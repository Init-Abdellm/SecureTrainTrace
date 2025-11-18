import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isAuthenticated } from "../_lib/auth";
import { storage } from "../_lib/storage";
import { insertTrainingSchema } from "../../shared/schema";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const cookieHeader = req.headers.cookie || null;
  
  if (!isAuthenticated(cookieHeader)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    if (req.method === "GET") {
      const trainings = await storage.getAllTrainings();
      return res.json(trainings);
    }

    if (req.method === "POST") {
      const validated = insertTrainingSchema.parse(req.body);
      const training = await storage.createTraining(validated);
      return res.json(training);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error: any) {
    console.error("Error in trainings route:", error);
    return res.status(400).json({ message: error.message || "Failed to process request" });
  }
}

