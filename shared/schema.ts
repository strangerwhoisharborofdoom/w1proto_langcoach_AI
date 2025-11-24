import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().$type<"teacher" | "student" | "admin">(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assignments = pgTable("assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teacherId: varchar("teacher_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  testType: text("test_type").notNull().$type<"OET" | "IELTS" | "Business English">(),
  dueDate: timestamp("due_date"),
  instructions: text("instructions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const testPrompts = pgTable("test_prompts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  testType: text("test_type").notNull().$type<"OET" | "IELTS" | "Business English">(),
  title: text("title").notNull(),
  prompt: text("prompt").notNull(),
  duration: integer("duration").notNull(),
  difficulty: text("difficulty").notNull().$type<"beginner" | "intermediate" | "advanced">(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const submissions = pgTable("submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assignmentId: varchar("assignment_id").notNull().references(() => assignments.id),
  studentId: varchar("student_id").notNull().references(() => users.id),
  audioFilePath: text("audio_file_path"),
  transcription: text("transcription"),
  status: text("status").notNull().$type<"pending" | "evaluated" | "feedback_provided">().default("pending"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export const evaluations = pgTable("evaluations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  submissionId: varchar("submission_id").notNull().references(() => submissions.id),
  overallScore: integer("overall_score").notNull(),
  pronunciationScore: integer("pronunciation_score").notNull(),
  fluencyScore: integer("fluency_score").notNull(),
  vocabularyScore: integer("vocabulary_score").notNull(),
  grammarScore: integer("grammar_score").notNull(),
  aiFeedback: jsonb("ai_feedback").$type<{
    pronunciation: string;
    fluency: string;
    vocabulary: string;
    grammar: string;
    strengths: string[];
    improvements: string[];
  }>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const teacherFeedback = pgTable("teacher_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  submissionId: varchar("submission_id").notNull().references(() => submissions.id),
  teacherId: varchar("teacher_id").notNull().references(() => users.id),
  feedback: text("feedback").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const resources = pgTable("resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  uploaderId: varchar("uploader_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  fileType: text("file_type").notNull().$type<"pdf" | "ppt" | "video">(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  assignmentId: varchar("assignment_id").references(() => assignments.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  assignmentsCreated: many(assignments),
  submissions: many(submissions),
  feedbackGiven: many(teacherFeedback),
  resourcesUploaded: many(resources),
}));

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  teacher: one(users, {
    fields: [assignments.teacherId],
    references: [users.id],
  }),
  submissions: many(submissions),
  resources: many(resources),
}));

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  assignment: one(assignments, {
    fields: [submissions.assignmentId],
    references: [assignments.id],
  }),
  student: one(users, {
    fields: [submissions.studentId],
    references: [users.id],
  }),
  evaluation: one(evaluations),
  teacherFeedback: many(teacherFeedback),
}));

export const evaluationsRelations = relations(evaluations, ({ one }) => ({
  submission: one(submissions, {
    fields: [evaluations.submissionId],
    references: [submissions.id],
  }),
}));

export const teacherFeedbackRelations = relations(teacherFeedback, ({ one }) => ({
  submission: one(submissions, {
    fields: [teacherFeedback.submissionId],
    references: [submissions.id],
  }),
  teacher: one(users, {
    fields: [teacherFeedback.teacherId],
    references: [users.id],
  }),
}));

export const resourcesRelations = relations(resources, ({ one }) => ({
  uploader: one(users, {
    fields: [resources.uploaderId],
    references: [users.id],
  }),
  assignment: one(assignments, {
    fields: [resources.assignmentId],
    references: [assignments.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  createdAt: true,
});

export const insertTestPromptSchema = createInsertSchema(testPrompts).omit({
  id: true,
  createdAt: true,
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  submittedAt: true,
});

export const insertEvaluationSchema = createInsertSchema(evaluations).omit({
  id: true,
  createdAt: true,
});

export const insertTeacherFeedbackSchema = createInsertSchema(teacherFeedback).omit({
  id: true,
  createdAt: true,
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;

export type TestPrompt = typeof testPrompts.$inferSelect;
export type InsertTestPrompt = z.infer<typeof insertTestPromptSchema>;

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;

export type Evaluation = typeof evaluations.$inferSelect;
export type InsertEvaluation = z.infer<typeof insertEvaluationSchema>;

export type TeacherFeedback = typeof teacherFeedback.$inferSelect;
export type InsertTeacherFeedback = z.infer<typeof insertTeacherFeedbackSchema>;

export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;
