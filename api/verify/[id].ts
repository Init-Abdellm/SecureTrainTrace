import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../_lib/storage";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { id } = req.query;
    let trainee;
    
    // Try to find by trainee ID first
    trainee = await storage.getTrainee(id as string);
    
    // If not found and ID looks like a certificate ID, search all trainees
    if (!trainee && typeof id === "string" && id.startsWith('CERT-')) {
      const allTrainees = await storage.getAllTrainees();
      trainee = allTrainees.find(t => t.certificateId === id);
    }
    
    if (!trainee || trainee.status !== "passed" || !trainee.certificateId) {
      return res.json({ valid: false });
    }

    const training = await storage.getTraining(trainee.trainingId);
    if (!training) {
      return res.json({ valid: false });
    }

    return res.json({
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
    return res.status(500).json({ valid: false });
  }
}

