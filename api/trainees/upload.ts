import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isAuthenticated } from "../_lib/auth";
import { storage } from "../_lib/storage";
import { excelTraineeSchema } from "../../shared/schema";
import * as XLSX from "xlsx";
import multiparty from "multiparty";
import { tmpdir } from "os";
import { join } from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const cookieHeader = req.headers.cookie || null;
  
  if (!isAuthenticated(cookieHeader)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Use /tmp directory for Vercel serverless (only writable location)
    const form = new multiparty.Form({
      uploadDir: join(tmpdir(), "vercel-uploads"),
    });
    
    const { fields, files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const trainingId = fields.training_id?.[0];
    if (!trainingId) {
      return res.status(400).json({ message: "Training ID is required" });
    }

    // Verify training exists
    const training = await storage.getTraining(trainingId);
    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }

    // Read file buffer
    const fs = await import("fs/promises");
    const fileBuffer = await fs.readFile(file.path);

    // Parse Excel file
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
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
          trainingId: trainingId,
          trainingDate: training.date,
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

    // Clean up uploaded file
    try {
      const fs = await import("fs/promises");
      await fs.unlink(file.path);
    } catch (e) {
      // Ignore cleanup errors
    }

    return res.json({
      success: true,
      imported,
      failed: errors.length,
      errors,
    });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return res.status(500).json({ message: error.message || "Failed to process file" });
  }
}

