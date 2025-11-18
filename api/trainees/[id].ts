import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isAuthenticated } from "../_lib/auth";
import { storage } from "../_lib/storage";
import { insertTraineeSchema } from "@shared/schema";
import { randomUUID } from "crypto";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const cookieHeader = req.headers.cookie || null;
  
  if (!isAuthenticated(cookieHeader)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id } = req.query;

  try {
    if (req.method === "GET") {
      const trainee = await storage.getTrainee(id as string);
      if (!trainee) {
        return res.status(404).json({ message: "Trainee not found" });
      }
      return res.json(trainee);
    }

    if (req.method === "PATCH") {
      const { status, ...otherFields } = req.body;
      
      // If status is changing to "passed", generate certificate
      if (status === "passed") {
        const trainee = await storage.getTrainee(id as string);
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

        const updated = await storage.updateTrainee(id as string, {
          ...otherFields,
          status,
          certificateId,
          certificateUrl,
        });

        return res.json(updated);
      }

      const validated = insertTraineeSchema.partial().parse(req.body);
      const trainee = await storage.updateTrainee(id as string, validated);
      if (!trainee) {
        return res.status(404).json({ message: "Trainee not found" });
      }
      return res.json(trainee);
    }

    if (req.method === "DELETE") {
      await storage.deleteTrainee(id as string);
      return res.json({ success: true });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error: any) {
    console.error("Error in trainee route:", error);
    return res.status(400).json({ message: error.message || "Failed to process request" });
  }
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

      // Header
      doc.fontSize(32)
        .font('Helvetica-Bold')
        .text('Certificate of Completion', { align: 'center' });

      doc.moveDown(2);

      // Body
      doc.fontSize(16)
        .font('Helvetica')
        .text('This certifies that', { align: 'center' });

      doc.moveDown(0.5);

      doc.fontSize(24)
        .font('Helvetica-Bold')
        .text(`${trainee.name} ${trainee.surname}`, { align: 'center' });

      doc.moveDown(0.5);

      doc.fontSize(16)
        .font('Helvetica')
        .text('has successfully completed the training', { align: 'center' });

      doc.moveDown(0.5);

      doc.fontSize(20)
        .font('Helvetica-Bold')
        .text(training.name, { align: 'center' });

      doc.moveDown(0.5);

      doc.fontSize(14)
        .font('Helvetica')
        .text(`on ${new Date(trainee.trainingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' });

      doc.moveDown(2);

      // Generate QR code - use full domain from environment
      // Vercel provides VERCEL_URL in production, or use APP_DOMAIN if set
      const domain = process.env.APP_DOMAIN || process.env.VERCEL_URL || process.env.VERCEL_BRANCH_URL || 'localhost:5000';
      const protocol = process.env.NODE_ENV === "production" || process.env.VERCEL ? "https" : "http";
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
        doc.fontSize(10)
          .font('Helvetica')
          .text(`Certificate ID: ${certificateId}`, 72, doc.page.height - 100, { align: 'left' });

        doc.text(`Issue Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 72, doc.page.height - 80, { align: 'left' });

        doc.fontSize(8)
          .text('Scan QR code to verify', doc.page.width - 150 - 72, doc.page.height - 50, {
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

