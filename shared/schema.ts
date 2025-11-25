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

// Gamification Tables

// User Progress & Points
export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  totalPoints: integer("total_points").default(0).notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  lastActivityDate: timestamp("last_activity_date"),
  level: integer("level").default(1).notNull(),
  weeklyGoal: integer("weekly_goal").default(50).notNull(),
  completedLessons: integer("completed_lessons").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Badges/Achievements
export const badges = pgTable("badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  iconName: text("icon_name").notNull(), // Icon identifier (e.g., "trophy", "fire", "star")
  category: text("category").notNull().$type<"streak" | "completion" | "achievement" | "milestone">(),
  requirement: integer("requirement").notNull(), // Number required (e.g., 7 for 7-day streak)
  points: integer("points").default(10).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Badges (earned badges)
export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  badgeId: varchar("badge_id").notNull().references(() => badges.id),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

// Activity Log
export const activityLog = pgTable("activity_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  activityType: text("activity_type").notNull().$type<"lesson_completed" | "test_submitted" | "badge_earned" | "streak_milestone" | "level_up">(),
  pointsEarned: integer("points_earned").default(0).notNull(),
  metadata: jsonb("metadata"), // Additional data like submissionId, badgeId, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userProgressRelations = relations(userProgress, ({ one, many }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  activities: many(activityLog),
  badges: many(userBadges),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
userBadges: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
user: one(users, {
  fields: [userBadges.userId],
  references: [users.id],
}),
badge: one(badges, {
  fields: [userBadges.badgeId],
  references: [badges.id],
}),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
user: one(users, {
  fields: [activityLog.userId],
  references: [users.id],
}),
}));

// Insert Schemas
export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
id: true,
createdAt: true,
updatedAt: true,
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
id: true,
createdAt: true,
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
id: true,
earnedAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLog).omit({
id: true,
createdAt: true,
});

// Types
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

