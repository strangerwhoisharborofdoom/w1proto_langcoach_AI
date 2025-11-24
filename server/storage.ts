import {
  users,
  assignments,
  testPrompts,
  submissions,
  evaluations,
  teacherFeedback,
  resources,
  type User,
  type InsertUser,
  type Assignment,
  type InsertAssignment,
  type TestPrompt,
  type InsertTestPrompt,
  type Submission,
  type InsertSubmission,
  type Evaluation,
  type InsertEvaluation,
  type TeacherFeedback,
  type InsertTeacherFeedback,
  type Resource,
  type InsertResource,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;

  // Assignment operations
  getAssignment(id: string): Promise<Assignment | undefined>;
  getAssignmentsByTeacher(teacherId: string): Promise<Assignment[]>;
  getAllAssignments(): Promise<Assignment[]>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  deleteAssignment(id: string): Promise<void>;

  // Test prompt operations
  getTestPrompt(id: string): Promise<TestPrompt | undefined>;
  getTestPromptsByType(testType: string): Promise<TestPrompt[]>;
  createTestPrompt(prompt: InsertTestPrompt): Promise<TestPrompt>;

  // Submission operations
  getSubmission(id: string): Promise<Submission | undefined>;
  getSubmissionByAssignmentAndStudent(assignmentId: string, studentId: string): Promise<Submission | undefined>;
  getSubmissionsByStudent(studentId: string): Promise<Submission[]>;
  getSubmissionsByAssignment(assignmentId: string): Promise<Submission[]>;
  getSubmissionsByTeacher(teacherId: string): Promise<Submission[]>;
  getAllSubmissions(): Promise<Submission[]>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  updateSubmission(id: string, data: Partial<Submission>): Promise<Submission>;

  // Evaluation operations
  getEvaluation(id: string): Promise<Evaluation | undefined>;
  getEvaluationBySubmission(submissionId: string): Promise<Evaluation | undefined>;
  getAllEvaluations(): Promise<Evaluation[]>;
  createEvaluation(evaluation: InsertEvaluation): Promise<Evaluation>;

  // Teacher feedback operations
  getFeedbackBySubmission(submissionId: string): Promise<TeacherFeedback[]>;
  createTeacherFeedback(feedback: InsertTeacherFeedback): Promise<TeacherFeedback>;

  // Resource operations
  getResource(id: string): Promise<Resource | undefined>;
  getResourcesByAssignment(assignmentId: string): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  // Assignment operations
  async getAssignment(id: string): Promise<Assignment | undefined> {
    const [assignment] = await db.select().from(assignments).where(eq(assignments.id, id));
    return assignment || undefined;
  }

  async getAssignmentsByTeacher(teacherId: string): Promise<Assignment[]> {
    return await db
      .select()
      .from(assignments)
      .where(eq(assignments.teacherId, teacherId))
      .orderBy(desc(assignments.createdAt));
  }

  async getAllAssignments(): Promise<Assignment[]> {
    return await db.select().from(assignments).orderBy(desc(assignments.createdAt));
  }

  async createAssignment(insertAssignment: InsertAssignment): Promise<Assignment> {
    const [assignment] = await db.insert(assignments).values(insertAssignment).returning();
    return assignment;
  }

  async deleteAssignment(id: string): Promise<void> {
    await db.delete(assignments).where(eq(assignments.id, id));
  }

  // Test prompt operations
  async getTestPrompt(id: string): Promise<TestPrompt | undefined> {
    const [prompt] = await db.select().from(testPrompts).where(eq(testPrompts.id, id));
    return prompt || undefined;
  }

  async getTestPromptsByType(testType: string): Promise<TestPrompt[]> {
    return await db.select().from(testPrompts).where(eq(testPrompts.testType, testType));
  }

  async createTestPrompt(insertPrompt: InsertTestPrompt): Promise<TestPrompt> {
    const [prompt] = await db.insert(testPrompts).values(insertPrompt).returning();
    return prompt;
  }

  // Submission operations
  async getSubmission(id: string): Promise<Submission | undefined> {
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id));
    return submission || undefined;
  }

  async getSubmissionByAssignmentAndStudent(
    assignmentId: string,
    studentId: string
  ): Promise<Submission | undefined> {
    const [submission] = await db
      .select()
      .from(submissions)
      .where(and(eq(submissions.assignmentId, assignmentId), eq(submissions.studentId, studentId)));
    return submission || undefined;
  }

  async getSubmissionsByStudent(studentId: string): Promise<Submission[]> {
    return await db
      .select()
      .from(submissions)
      .where(eq(submissions.studentId, studentId))
      .orderBy(desc(submissions.submittedAt));
  }

  async getSubmissionsByAssignment(assignmentId: string): Promise<Submission[]> {
    return await db
      .select()
      .from(submissions)
      .where(eq(submissions.assignmentId, assignmentId))
      .orderBy(desc(submissions.submittedAt));
  }

  async getSubmissionsByTeacher(teacherId: string): Promise<Submission[]> {
    const teacherAssignments = await this.getAssignmentsByTeacher(teacherId);
    const assignmentIds = teacherAssignments.map((a) => a.id);
    
    if (assignmentIds.length === 0) return [];
    
    const allSubmissions = await db.select().from(submissions).orderBy(desc(submissions.submittedAt));
    return allSubmissions.filter((s) => assignmentIds.includes(s.assignmentId));
  }

  async getAllSubmissions(): Promise<Submission[]> {
    return await db.select().from(submissions).orderBy(desc(submissions.submittedAt));
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const [submission] = await db.insert(submissions).values(insertSubmission).returning();
    return submission;
  }

  async updateSubmission(id: string, data: Partial<Submission>): Promise<Submission> {
    const [submission] = await db
      .update(submissions)
      .set(data)
      .where(eq(submissions.id, id))
      .returning();
    return submission;
  }

  // Evaluation operations
  async getEvaluation(id: string): Promise<Evaluation | undefined> {
    const [evaluation] = await db.select().from(evaluations).where(eq(evaluations.id, id));
    return evaluation || undefined;
  }

  async getEvaluationBySubmission(submissionId: string): Promise<Evaluation | undefined> {
    const [evaluation] = await db
      .select()
      .from(evaluations)
      .where(eq(evaluations.submissionId, submissionId));
    return evaluation || undefined;
  }

  async getAllEvaluations(): Promise<Evaluation[]> {
    return await db.select().from(evaluations);
  }

  async createEvaluation(insertEvaluation: InsertEvaluation): Promise<Evaluation> {
    const [evaluation] = await db.insert(evaluations).values(insertEvaluation).returning();
    return evaluation;
  }

  // Teacher feedback operations
  async getFeedbackBySubmission(submissionId: string): Promise<TeacherFeedback[]> {
    return await db
      .select()
      .from(teacherFeedback)
      .where(eq(teacherFeedback.submissionId, submissionId));
  }

  async createTeacherFeedback(insertFeedback: InsertTeacherFeedback): Promise<TeacherFeedback> {
    const [feedback] = await db.insert(teacherFeedback).values(insertFeedback).returning();
    return feedback;
  }

  // Resource operations
  async getResource(id: string): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource || undefined;
  }

  async getResourcesByAssignment(assignmentId: string): Promise<Resource[]> {
    return await db.select().from(resources).where(eq(resources.assignmentId, assignmentId));
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    const [resource] = await db.insert(resources).values(insertResource).returning();
    return resource;
  }
}

export const storage = new DatabaseStorage();
