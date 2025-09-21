import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConversionJobSchema } from "@shared/schema";
import multer from "multer";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}
import { convertMySQLToMariaDB } from "../client/src/lib/sql-converter";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload and create conversion job
  app.post("/api/convert", upload.single("file"), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileContent = req.file.buffer.toString('utf-8');
      
      const jobData = {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        originalContent: fileContent
      };

      const validatedData = insertConversionJobSchema.parse(jobData);
      const job = await storage.createConversionJob(validatedData);

      res.json({ jobId: job.id });
    } catch (error) {
      console.error("Error creating conversion job:", error);
      res.status(500).json({ error: "Failed to create conversion job" });
    }
  });

  // Start conversion analysis
  app.post("/api/convert/:jobId/analyze", async (req, res) => {
    try {
      const { jobId } = req.params;
      const job = await storage.getConversionJob(jobId);
      
      if (!job) {
        return res.status(404).json({ error: "Conversion job not found" });
      }

      // Update job status to analyzing
      await storage.updateConversionJob(jobId, { status: "analyzing" });

      // Perform the actual conversion
      const startTime = Date.now();
      const conversionResult = await convertMySQLToMariaDB(job.originalContent);
      const conversionTime = Date.now() - startTime;

      // Store conversion issues
      for (const issue of conversionResult.issues) {
        await storage.createConversionIssue({
          jobId,
          ...issue
        });
      }

      // Store conversion stats
      await storage.createConversionStats({
        jobId,
        totalIssues: conversionResult.stats.totalIssues,
        autoFixed: conversionResult.stats.autoFixed,
        warningsCount: conversionResult.stats.warningsCount,
        errorsCount: conversionResult.stats.errorsCount,
        optimizationsCount: conversionResult.stats.optimizationsCount,
        conversionTimeMs: conversionTime
      });

      // Update job with converted content and completion status
      const updatedJob = await storage.updateConversionJob(jobId, {
        status: "completed",
        convertedContent: conversionResult.convertedSQL,
        completedAt: new Date()
      });

      console.log(`Job ${jobId} updated to completed status:`, {
        jobStatus: updatedJob?.status,
        hasConvertedContent: !!updatedJob?.convertedContent,
        completedAt: updatedJob?.completedAt
      });

      res.json({ 
        status: "completed",
        stats: conversionResult.stats 
      });
    } catch (error) {
      console.error("Error analyzing conversion job:", error);
      await storage.updateConversionJob(req.params.jobId, { status: "failed" });
      res.status(500).json({ error: "Failed to analyze conversion job" });
    }
  });

  // Get conversion job details
  app.get("/api/convert/:jobId", async (req, res) => {
    try {
      const { jobId } = req.params;
      const job = await storage.getConversionJob(jobId);
      
      if (!job) {
        return res.status(404).json({ error: "Conversion job not found" });
      }

      const issues = await storage.getConversionIssues(jobId);
      const stats = await storage.getConversionStats(jobId);

      console.log(`Getting job ${jobId}:`, {
        status: job.status,
        hasConvertedContent: !!job.convertedContent,
        completedAt: job.completedAt
      });

      res.json({
        job,
        issues,
        stats
      });
    } catch (error) {
      console.error("Error getting conversion job:", error);
      res.status(500).json({ error: "Failed to get conversion job" });
    }
  });

  // Download converted SQL file
  app.get("/api/convert/:jobId/download", async (req, res) => {
    try {
      const { jobId } = req.params;
      const job = await storage.getConversionJob(jobId);
      
      if (!job || !job.convertedContent) {
        return res.status(404).json({ error: "Converted file not found" });
      }

      const fileName = job.fileName.replace(/\.[^/.]+$/, "") + "_mariadb103.sql";
      
      res.set({
        'Content-Type': 'application/sql',
        'Content-Disposition': `attachment; filename="${fileName}"`
      });
      
      res.send(job.convertedContent);
    } catch (error) {
      console.error("Error downloading converted file:", error);
      res.status(500).json({ error: "Failed to download converted file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
