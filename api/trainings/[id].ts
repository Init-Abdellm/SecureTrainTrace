import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isAuthenticated } from "../_lib/auth.js";
import { storage } from "../_lib/storage.js";
import { insertTrainingSchema } from "../../shared/schema.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const cookieHeader = req.headers.cookie || null;

  console.log("Training [id] endpoint hit - Method:", req.method, "URL:", req.url, "Query:", req.query);

  if (!isAuthenticated(cookieHeader)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id } = req.query;

  try {
    if (req.method === "GET") {
      console.log("Fetching training with ID:", id, "Type:", typeof id);

      // DEBUG: Fetch all trainings to see what IDs exist
      const allTrainings = await storage.getAllTrainings();
      console.log("All training IDs in DB:", allTrainings.map(t => t.id));

      const training = await storage.getTraining(id as string);
      console.log("Training found:", training ? "yes" : "no", training ? `Name: ${training.name}` : "");
      if (!training) {
        return res.status(404).json({
          message: "Training not found",
          requestedId: id,
          availableIds: allTrainings.map(t => t.id)
        });
      }
      return res.json(training);
    }

    if (req.method === "PATCH") {
      const validated = insertTrainingSchema.partial().parse(req.body);
      const training = await storage.updateTraining(id as string, validated);
      if (!training) {
        return res.status(404).json({ message: "Training not found" });
      }
      return res.json(training);
    }

    if (req.method === "DELETE") {
      await storage.deleteTraining(id as string);
      return res.json({ success: true });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error: any) {
    console.error("Error in training route:", error);
    return res.status(400).json({ message: error.message || "Failed to process request" });
  }
}

