import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isAuthenticated } from "../../_lib/auth.js";
import { storage } from "../../_lib/storage.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const cookieHeader = req.headers.cookie || null;
  
  if (!isAuthenticated(cookieHeader)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id: trainingId } = req.query;

  try {
    console.log("Fetching trainees for training ID:", trainingId);
    const trainees = await storage.getTraineesByTrainingId(trainingId as string);
    console.log("Trainees found:", trainees.length);
    return res.json(trainees);
  } catch (error) {
    console.error("Error fetching trainees:", error);
    return res.status(500).json({ message: "Failed to fetch trainees" });
  }
}

