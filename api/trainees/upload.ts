import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isAuthenticated } from "../_lib/auth.js";
import { storage } from "../_lib/storage.js";
import { excelTraineeSchema } from "../../shared/schema.js";
import * as XLSX from "xlsx";
// busboy will be imported dynamically to handle ESM/CommonJS compatibility

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
    // Parse multipart form using busboy (works better with Vercel serverless)
    // Dynamic import to handle ESM/CommonJS compatibility
    const busboyModule = await import("busboy");
    const BusboyConstructor = (busboyModule.default || busboyModule) as any;
    
    const { fileBuffer, trainingId } = await new Promise<{ fileBuffer: Buffer; trainingId: string }>((resolve, reject) => {
      const bb = BusboyConstructor({ headers: req.headers });
      let fileBuffer: Buffer | null = null;
      let trainingId: string | null = null;

      bb.on("file", (name, file, info) => {
        const { filename, encoding, mimeType } = info;
        if (name !== "file") {
          file.resume(); // Drain file we don't need
          return;
        }

        const chunks: Buffer[] = [];
        file.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
        });

        file.on("end", () => {
          fileBuffer = Buffer.concat(chunks);
        });
      });

      bb.on("field", (name, value) => {
        if (name === "training_id") {
          trainingId = value;
        }
      });

      bb.on("close", () => {
        if (!fileBuffer) {
          reject(new Error("No file uploaded"));
          return;
        }
        if (!trainingId) {
          reject(new Error("Training ID is required"));
          return;
        }
        resolve({ fileBuffer, trainingId });
      });

      bb.on("error", (err) => {
        reject(err);
      });

      // Pipe the request to busboy
      // VercelRequest extends IncomingMessage which is a readable stream
      (req as any).pipe(bb);
    });

    // Verify training exists
    const training = await storage.getTraining(trainingId);
    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }

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

