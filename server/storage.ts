import { 
  type User, 
  type InsertUser,
  type ConversionJob,
  type InsertConversionJob,
  type ConversionIssue,
  type InsertConversionIssue,
  type ConversionStats,
  type InsertConversionStats
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createConversionJob(job: InsertConversionJob): Promise<ConversionJob>;
  getConversionJob(id: string): Promise<ConversionJob | undefined>;
  updateConversionJob(id: string, updates: Partial<ConversionJob>): Promise<ConversionJob | undefined>;
  
  createConversionIssue(issue: InsertConversionIssue): Promise<ConversionIssue>;
  getConversionIssues(jobId: string): Promise<ConversionIssue[]>;
  
  createConversionStats(stats: InsertConversionStats): Promise<ConversionStats>;
  getConversionStats(jobId: string): Promise<ConversionStats | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private conversionJobs: Map<string, ConversionJob>;
  private conversionIssues: Map<string, ConversionIssue[]>;
  private conversionStats: Map<string, ConversionStats>;

  constructor() {
    this.users = new Map();
    this.conversionJobs = new Map();
    this.conversionIssues = new Map();
    this.conversionStats = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createConversionJob(insertJob: InsertConversionJob): Promise<ConversionJob> {
    const id = randomUUID();
    const job: ConversionJob = { 
      ...insertJob, 
      id,
      status: "pending",
      convertedContent: null,
      createdAt: new Date(),
      completedAt: null
    };
    this.conversionJobs.set(id, job);
    return job;
  }

  async getConversionJob(id: string): Promise<ConversionJob | undefined> {
    return this.conversionJobs.get(id);
  }

  async updateConversionJob(id: string, updates: Partial<ConversionJob>): Promise<ConversionJob | undefined> {
    const job = this.conversionJobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...updates };
    this.conversionJobs.set(id, updatedJob);
    return updatedJob;
  }

  async createConversionIssue(insertIssue: InsertConversionIssue): Promise<ConversionIssue> {
    const id = randomUUID();
    const issue: ConversionIssue = { 
      ...insertIssue, 
      id,
      lineNumber: insertIssue.lineNumber ?? null,
      originalText: insertIssue.originalText ?? null,
      convertedText: insertIssue.convertedText ?? null,
      autoFixed: insertIssue.autoFixed ?? false
    };
    
    const jobIssues = this.conversionIssues.get(insertIssue.jobId) || [];
    jobIssues.push(issue);
    this.conversionIssues.set(insertIssue.jobId, jobIssues);
    
    return issue;
  }

  async getConversionIssues(jobId: string): Promise<ConversionIssue[]> {
    return this.conversionIssues.get(jobId) || [];
  }

  async createConversionStats(insertStats: InsertConversionStats): Promise<ConversionStats> {
    const id = randomUUID();
    const stats: ConversionStats = { 
      ...insertStats, 
      id,
      totalIssues: insertStats.totalIssues ?? 0,
      autoFixed: insertStats.autoFixed ?? 0,
      warningsCount: insertStats.warningsCount ?? 0,
      errorsCount: insertStats.errorsCount ?? 0,
      optimizationsCount: insertStats.optimizationsCount ?? 0,
      conversionTimeMs: insertStats.conversionTimeMs ?? 0
    };
    this.conversionStats.set(insertStats.jobId, stats);
    return stats;
  }

  async getConversionStats(jobId: string): Promise<ConversionStats | undefined> {
    return this.conversionStats.get(jobId);
  }
}

export const storage = new MemStorage();
