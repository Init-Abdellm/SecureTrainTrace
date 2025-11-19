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

    try {
        const { id } = req.query;

        if (!id || typeof id !== "string") {
            return res.status(400).json({ message: "Training ID is required" });
        }

        const trainees = await storage.getTraineesByTrainingId(id);
        return res.json(trainees);
    } catch (error) {
        console.error("Error fetching trainees:", error);
        return res.status(500).json({ message: "Failed to fetch trainees" });
    }
}

