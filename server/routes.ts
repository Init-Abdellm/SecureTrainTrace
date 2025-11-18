import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertTrainingSchema, insertTraineeSchema, excelTraineeSchema } from "@shared/schema";
import multer from "multer";
import * as XLSX from "xlsx";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { randomUUID } from "crypto";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Training CRUD routes
  app.get('/api/trainings', isAuthenticated, async (req, res) => {
    try {
      const trainings = await storage.getAllTrainings();
      res.json(trainings);
    } catch (error) {
      console.error("Error fetching trainings:", error);
      res.status(500).json({ message: "Failed to fetch trainings" });
    }
  });

  app.get('/api/trainings/:id', isAuthenticated, async (req, res) => {
    try {
      const training = await storage.getTraining(req.params.id);
      if (!training) {
        return res.status(404).json({ message: "Training not found" });
      }
      res.json(training);
    } catch (error) {
      console.error("Error fetching training:", error);
      res.status(500).json({ message: "Failed to fetch training" });
    }
  });

  app.post('/api/trainings', isAuthenticated, async (req, res) => {
    try {
      const validated = insertTrainingSchema.parse(req.body);
      const training = await storage.createTraining(validated);
      res.json(training);
    } catch (error: any) {
      console.error("Error creating training:", error);
      res.status(400).json({ message: error.message || "Failed to create training" });
    }
  });

  app.patch('/api/trainings/:id', isAuthenticated, async (req, res) => {
    try {
      const validated = insertTrainingSchema.partial().parse(req.body);
      const training = await storage.updateTraining(req.params.id, validated);
      if (!training) {
        return res.status(404).json({ message: "Training not found" });
      }
      res.json(training);
    } catch (error: any) {
      console.error("Error updating training:", error);
      res.status(400).json({ message: error.message || "Failed to update training" });
    }
  });

  app.delete('/api/trainings/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteTraining(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting training:", error);
      res.status(500).json({ message: "Failed to delete training" });
    }
  });

  // Trainee routes
  app.get('/api/trainees', isAuthenticated, async (req, res) => {
    try {
      const trainees = await storage.getAllTrainees();
      res.json(trainees);
    } catch (error) {
      console.error("Error fetching trainees:", error);
      res.status(500).json({ message: "Failed to fetch trainees" });
    }
  });

  app.get('/api/trainings/:trainingId/trainees', isAuthenticated, async (req, res) => {
    try {
      const trainees = await storage.getTraineesByTrainingId(req.params.trainingId);
      res.json(trainees);
    } catch (error) {
      console.error("Error fetching trainees:", error);
      res.status(500).json({ message: "Failed to fetch trainees" });
    }
  });

  app.get('/api/trainees/:id', isAuthenticated, async (req, res) => {
    try {
      const trainee = await storage.getTrainee(req.params.id);
      if (!trainee) {
        return res.status(404).json({ message: "Trainee not found" });
      }
      res.json(trainee);
    } catch (error) {
      console.error("Error fetching trainee:", error);
      res.status(500).json({ message: "Failed to fetch trainee" });
    }
  });

  app.patch('/api/trainees/:id', isAuthenticated, async (req, res) => {
    try {
      const { status, ...otherFields } = req.body;

      // If status is changing to "passed", generate certificate
      if (status === "passed") {
        const trainee = await storage.getTrainee(req.params.id);
        if (!trainee) {
          return res.status(404).json({ message: "Trainee not found" });
        }

        const training = await storage.getTraining(trainee.trainingId);
        if (!training) {
          return res.status(404).json({ message: "Training not found" });
        }

        // Generate certificate
        const certificateId = `CERT-${randomUUID()}`;
        const certificateUrl = await generateCertificate(trainee, training, certificateId);

        const updated = await storage.updateTrainee(req.params.id, {
          ...otherFields,
          status,
          certificateId,
          certificateUrl,
        });

        return res.json(updated);
      }

      const validated = insertTraineeSchema.partial().parse(req.body);
      const trainee = await storage.updateTrainee(req.params.id, validated);
      if (!trainee) {
        return res.status(404).json({ message: "Trainee not found" });
      }
      res.json(trainee);
    } catch (error: any) {
      console.error("Error updating trainee:", error);
      res.status(400).json({ message: error.message || "Failed to update trainee" });
    }
  });

  app.delete('/api/trainees/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteTrainee(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting trainee:", error);
      res.status(500).json({ message: "Failed to delete trainee" });
    }
  });

  // Excel upload route
  app.post('/api/trainees/upload', isAuthenticated, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const trainingId = req.body.training_id;
      if (!trainingId) {
        return res.status(400).json({ message: "Training ID is required" });
      }

      // Verify training exists
      const training = await storage.getTraining(trainingId);
      if (!training) {
        return res.status(404).json({ message: "Training not found" });
      }

      // Parse Excel file
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const errors: string[] = [];
      const validTrainees: any[] = [];

      // Validate each row
      for (let i = 0; i < data.length; i++) {
        const row = data[i] as any;
        const rowNum = i + 2; // Excel rows start at 1, header is row 1

        try {
          // Normalize the row data - convert all number fields to strings
          const normalizedRow = {
            name: row.name?.toString() || '',
            surname: row.surname?.toString() || '',
            email: row.email?.toString() || '',
            phone_number: row.phone_number?.toString() || '',
            company_name: row.company_name?.toString() || undefined,
          };

          const validated = excelTraineeSchema.parse(normalizedRow);

          // Check if trainee already exists
          const existing = await storage.getTraineeByEmail(validated.email);
          if (existing) {
            errors.push(`Row ${rowNum}: Email ${validated.email} already exists`);
            continue;
          }

          validTrainees.push({
            name: validated.name,
            surname: validated.surname,
            email: validated.email,
            phoneNumber: validated.phone_number,
            companyName: validated.company_name || null,
            trainingId: trainingId, // Use the training ID from the context
            trainingDate: training.date, // Use the training date from the training
            status: "pending",
          });
        } catch (error: any) {
          if (error.errors) {
            const errorMessages = error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(", ");
            errors.push(`Row ${rowNum}: ${errorMessages}`);
          } else {
            errors.push(`Row ${rowNum}: Invalid data - ${error.message}`);
          }
        }
      }

      // Insert valid trainees
      let imported = 0;
      if (validTrainees.length > 0) {
        const created = await storage.createTrainees(validTrainees);
        imported = created.length;
      }

      res.json({
        success: true,
        imported,
        failed: errors.length,
        errors,
      });
    } catch (error: any) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: error.message || "Failed to process file" });
    }
  });

  // Public verification route (no authentication required)
  // Accepts either trainee ID or certificate ID
  app.get('/api/verify/:id', async (req, res) => {
    try {
      let trainee;

      // Try to find by trainee ID first
      trainee = await storage.getTrainee(req.params.id);

      // If not found and ID looks like a certificate ID, search all trainees
      if (!trainee && req.params.id.startsWith('CERT-')) {
        const allTrainees = await storage.getAllTrainees();
        trainee = allTrainees.find(t => t.certificateId === req.params.id);
      }

      if (!trainee || trainee.status !== "passed" || !trainee.certificateId) {
        return res.json({ valid: false });
      }

      const training = await storage.getTraining(trainee.trainingId);
      if (!training) {
        return res.json({ valid: false });
      }

      res.json({
        valid: true,
        trainee: {
          name: trainee.name,
          surname: trainee.surname,
          email: trainee.email,
          phoneNumber: trainee.phoneNumber,
          companyName: trainee.companyName,
          trainingName: training.name,
          trainingDate: trainee.trainingDate,
          certificateId: trainee.certificateId,
          certificateUrl: trainee.certificateUrl,
        },
      });
    } catch (error) {
      console.error("Error verifying certificate:", error);
      res.status(500).json({ valid: false });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

// Certificate generation helper function
async function generateCertificate(
  trainee: any,
  training: any,
  certificateId: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 72, right: 72 }
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        const base64 = pdfBuffer.toString('base64');
        const dataUrl = `data:application/pdf;base64,${base64}`;
        resolve(dataUrl);
      });

      // Certificate translations - could be extended to support multiple languages
      // For now, using English. To add i18n, accept language from request header or trainee preference
      const certTexts = {
        title: 'Certificate of Completion',
        certifies: 'This certifies that',
        hasCompleted: 'has successfully completed the training',
        on: 'on',
        certificateId: 'Certificate ID',
        issueDate: 'Issue Date',
        scanToVerify: 'Scan QR code to verify'
      };

      // Header
      doc.fontSize(32)
        .font('Helvetica-Bold')
        .text(certTexts.title, { align: 'center' });

      doc.moveDown(2);

      // Body
      doc.fontSize(16)
        .font('Helvetica')
        .text(certTexts.certifies, { align: 'center' });

      doc.moveDown(0.5);

      doc.fontSize(24)
        .font('Helvetica-Bold')
        .text(`${trainee.name} ${trainee.surname}`, { align: 'center' });

      doc.moveDown(0.5);

      doc.fontSize(16)
        .font('Helvetica')
        .text(certTexts.hasCompleted, { align: 'center' });

      doc.moveDown(0.5);

      doc.fontSize(20)
        .font('Helvetica-Bold')
        .text(training.name, { align: 'center' });

      doc.moveDown(0.5);

      // Use locale-aware date formatting (could be extended based on language)
      const dateLocale = 'fr-FR'; // Could be 'fr-FR' for French
      doc.fontSize(14)
        .font('Helvetica')
        .text(`${certTexts.on} ${new Date(trainee.trainingDate).toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' });

      doc.moveDown(2);

      // Generate QR code - use full domain from environment
      const domain = process.env.APP_DOMAIN || 'localhost:1994';
      const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
      const verificationUrl = `${protocol}://${domain}/verify/${trainee.id}`;

      QRCode.toDataURL(verificationUrl, { width: 150 }, (err: Error | null | undefined, url: string) => {
        if (err) {
          console.error('QR Code generation error:', err);
          doc.end();
          return;
        }

        // Add QR code to PDF
        const qrImage = url.split(',')[1];
        const qrBuffer = Buffer.from(qrImage, 'base64');

        doc.image(qrBuffer, doc.page.width - 150 - 72, doc.page.height - 150 - 72, {
          width: 120,
          height: 120
        });

        // Footer
        const issueDateLocale = 'en-US'; // Could be 'fr-FR' for French
        doc.fontSize(10)
          .font('Helvetica')
          .text(`${certTexts.certificateId}: ${certificateId}`, 72, doc.page.height - 100, { align: 'left' });

        doc.text(`${certTexts.issueDate}: ${new Date().toLocaleDateString(issueDateLocale, { year: 'numeric', month: 'long', day: 'numeric' })}`, 72, doc.page.height - 80, { align: 'left' });

        doc.fontSize(8)
          .text(certTexts.scanToVerify, doc.page.width - 150 - 72, doc.page.height - 50, {
            width: 120,
            align: 'center'
          });

        doc.end();
      });
    } catch (error) {
      reject(error);
    }
  });
}
