import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { transcribeAudio, evaluateSpeech } from "./openai";
import bcrypt from "bcrypt";
import session from "express-session";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertUserSchema, insertAssignmentSchema } from "@shared/schema";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "language-eval-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    })
  );

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  const requireRole = (roles: string[]) => {
    return async (req: any, res: any, next: any) => {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      req.user = user;
      next();
    };
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      req.session.userId = user.id;
      res.json({ ...user, password: undefined });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.json({ ...user, password: undefined });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Assignment routes
  app.get("/api/assignments", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let assignments;
      if (user.role === "teacher") {
        assignments = await storage.getAssignmentsByTeacher(user.id);
      } else if (user.role === "admin") {
        assignments = await storage.getAllAssignments();
      } else {
        assignments = await storage.getAllAssignments();
      }

      res.json(assignments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/assignments/student", requireAuth, async (req, res) => {
    try {
      const assignments = await storage.getAllAssignments();
      res.json(assignments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/assignments/:id", requireAuth, async (req, res) => {
    try {
      const assignment = await storage.getAssignment(req.params.id);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      res.json(assignment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/assignments", requireRole(["teacher"]), async (req, res) => {
    try {
      const data = insertAssignmentSchema.parse({
        ...req.body,
        teacherId: req.session.userId,
      });
      const assignment = await storage.createAssignment(data);
      res.json(assignment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/assignments/:id", requireRole(["teacher"]), async (req, res) => {
    try {
      await storage.deleteAssignment(req.params.id);
      res.json({ message: "Assignment deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Submission routes
  app.post("/api/submissions", requireRole(["student"]), upload.single("audio"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No audio file provided" });
      }

      const { assignmentId } = req.body;
      const assignment = await storage.getAssignment(assignmentId);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      // Create submission
      const submission = await storage.createSubmission({
        assignmentId,
        studentId: req.session.userId!,
        audioFilePath: req.file.path,
        status: "pending",
      });

      // Process audio asynchronously
      setTimeout(async () => {
        try {
          // Check if OpenAI is configured
          if (!process.env.OPENAI_API_KEY) {
            console.error("OPENAI_API_KEY not configured - skipping evaluation");
            await storage.updateSubmission(submission.id, {
              status: "pending",
              transcription: "AI evaluation unavailable - OpenAI API key not configured",
            });
            return;
          }

          // Transcribe audio
          const { text: transcription } = await transcribeAudio(req.file!.path);

          // Update submission with transcription
          await storage.updateSubmission(submission.id, {
            transcription,
          });

          // Get AI evaluation
          const evaluation = await evaluateSpeech(transcription, assignment.testType);

          // Save evaluation
          await storage.createEvaluation({
            submissionId: submission.id,
            overallScore: evaluation.overallScore,
            pronunciationScore: evaluation.pronunciationScore,
            fluencyScore: evaluation.fluencyScore,
            vocabularyScore: evaluation.vocabularyScore,
            grammarScore: evaluation.grammarScore,
            aiFeedback: evaluation.feedback,
          });

          // Update submission status
          await storage.updateSubmission(submission.id, {
            status: "evaluated",
          });
        } catch (error) {
          console.error("Error processing submission:", error);
          await storage.updateSubmission(submission.id, {
            status: "pending",
            transcription: "Error during AI evaluation: " + (error as Error).message,
          });
        }
      }, 100);

      res.json(submission);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/submissions/student", requireRole(["student"]), async (req, res) => {
    try {
      const submissions = await storage.getSubmissionsByStudent(req.session.userId!);
      res.json(submissions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/submissions/student/all", requireRole(["student"]), async (req, res) => {
    try {
      const submissions = await storage.getSubmissionsByStudent(req.session.userId!);
      
      const submissionsWithDetails = await Promise.all(
        submissions.map(async (submission) => {
          const evaluation = await storage.getEvaluationBySubmission(submission.id);
          const assignment = await storage.getAssignment(submission.assignmentId);
          return { ...submission, evaluation, assignment };
        })
      );

      res.json(submissionsWithDetails);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/submissions/assignment/:assignmentId", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role === "student") {
        const submission = await storage.getSubmissionByAssignmentAndStudent(
          req.params.assignmentId,
          user.id
        );
        if (!submission) {
          return res.json(null);
        }
        const evaluation = await storage.getEvaluationBySubmission(submission.id);
        return res.json({ ...submission, evaluation });
      }

      const submissions = await storage.getSubmissionsByAssignment(req.params.assignmentId);
      res.json(submissions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/submissions/teacher", requireRole(["teacher"]), async (req, res) => {
    try {
      const submissions = await storage.getSubmissionsByTeacher(req.session.userId!);
      res.json(submissions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Teacher additional routes
  app.get("/api/teacher/students", requireRole(["teacher"]), async (req, res) => {
    try {
      const students = await storage.getUsersByRole("student");
      res.json(students.map((u) => ({ ...u, password: undefined })));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/teacher/student-progress", requireRole(["teacher"]), async (req, res) => {
    try {
      const submissions = await storage.getSubmissionsByTeacher(req.session.userId!);
      const submissionsWithEvaluations = await Promise.all(
        submissions.map(async (submission) => {
          const evaluation = await storage.getEvaluationBySubmission(submission.id);
          return { ...submission, evaluation };
        })
      );
      res.json(submissionsWithEvaluations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/teacher/submissions/all", requireRole(["teacher"]), async (req, res) => {
    try {
      const submissions = await storage.getSubmissionsByTeacher(req.session.userId!);
      const submissionsWithDetails = await Promise.all(
        submissions.map(async (submission) => {
          const evaluation = await storage.getEvaluationBySubmission(submission.id);
          const assignment = await storage.getAssignment(submission.assignmentId);
          const student = await storage.getUser(submission.studentId);
          return { ...submission, evaluation, assignment, student: student ? { ...student, password: undefined } : null };
        })
      );
      res.json(submissionsWithDetails);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/teacher/feedback", requireRole(["teacher"]), async (req, res) => {
    try {
      const { submissionId, feedback } = req.body;
      
      await storage.createTeacherFeedback({
        submissionId,
        teacherId: req.session.userId!,
        feedback,
      });

      await storage.updateSubmission(submissionId, {
        status: "feedback_provided",
      });

      res.json({ message: "Feedback submitted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin routes
  app.get("/api/admin/users", requireRole(["admin"]), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map((u) => ({ ...u, password: undefined })));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/assignments", requireRole(["admin"]), async (req, res) => {
    try {
      const assignments = await storage.getAllAssignments();
      res.json(assignments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/submissions", requireRole(["admin"]), async (req, res) => {
    try {
      const submissions = await storage.getAllSubmissions();
      res.json(submissions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/evaluations", requireRole(["admin"]), async (req, res) => {
    try {
      const evaluations = await storage.getAllEvaluations();
      res.json(evaluations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
