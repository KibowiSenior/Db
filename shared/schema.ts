import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const conversionJobs = pgTable("conversion_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  originalContent: text("original_content").notNull(),
  convertedContent: text("converted_content"),
  status: text("status").notNull().default("pending"), // pending, analyzing, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const conversionIssues = pgTable("conversion_issues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => conversionJobs.id),
  lineNumber: integer("line_number"),
  issueType: text("issue_type").notNull(), // warning, error, info
  category: text("category").notNull(), // syntax, compatibility, optimization
  description: text("description").notNull(),
  originalText: text("original_text"),
  convertedText: text("converted_text"),
  autoFixed: boolean("auto_fixed").default(false),
});

export const conversionStats = pgTable("conversion_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => conversionJobs.id),
  totalIssues: integer("total_issues").default(0),
  autoFixed: integer("auto_fixed").default(0),
  warningsCount: integer("warnings_count").default(0),
  errorsCount: integer("errors_count").default(0),
  optimizationsCount: integer("optimizations_count").default(0),
  conversionTimeMs: integer("conversion_time_ms").default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertConversionJobSchema = createInsertSchema(conversionJobs).pick({
  fileName: true,
  fileSize: true,
  originalContent: true,
});

export const insertConversionIssueSchema = createInsertSchema(conversionIssues).omit({
  id: true,
});

export const insertConversionStatsSchema = createInsertSchema(conversionStats).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ConversionJob = typeof conversionJobs.$inferSelect;
export type InsertConversionJob = z.infer<typeof insertConversionJobSchema>;
export type ConversionIssue = typeof conversionIssues.$inferSelect;
export type InsertConversionIssue = z.infer<typeof insertConversionIssueSchema>;
export type ConversionStats = typeof conversionStats.$inferSelect;
export type InsertConversionStats = z.infer<typeof insertConversionStatsSchema>;
