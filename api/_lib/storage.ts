import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import * as schema from '../../shared/schema';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

class DatabaseStorage {
  async getAllTrainings() {
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    const result = await db.select().from(schema.trainings).orderBy(schema.trainings.createdAt);
    console.log('Trainings found:', result.length);
    return result;
  }

  async getTraining(id: string) {
    const [training] = await db.select().from(schema.trainings).where(eq(schema.trainings.id, id));
    return training;
  }

  async createTraining(training: any) {
    const [newTraining] = await db.insert(schema.trainings).values(training).returning();
    return newTraining;
  }

  async updateTraining(id: string, training: any) {
    const [updated] = await db
      .update(schema.trainings)
      .set({ ...training, updatedAt: new Date() })
      .where(eq(schema.trainings.id, id))
      .returning();
    return updated;
  }

  async deleteTraining(id: string) {
    await db.delete(schema.trainings).where(eq(schema.trainings.id, id));
  }

  async getAllTrainees() {
    return await db.select().from(schema.trainees).orderBy(schema.trainees.createdAt);
  }

  async getTraineesByTrainingId(trainingId: string) {
    return await db.select().from(schema.trainees).where(eq(schema.trainees.trainingId, trainingId));
  }

  async getTrainee(id: string) {
    const [trainee] = await db.select().from(schema.trainees).where(eq(schema.trainees.id, id));
    return trainee;
  }

  async createTrainee(trainee: any) {
    const [newTrainee] = await db.insert(schema.trainees).values(trainee).returning();
    return newTrainee;
  }

  async createTrainees(traineeList: any[]) {
    const created = await db.insert(schema.trainees).values(traineeList).returning();
    return created;
  }

  async updateTrainee(id: string, trainee: any) {
    const [updated] = await db
      .update(schema.trainees)
      .set({ ...trainee, updatedAt: new Date() })
      .where(eq(schema.trainees.id, id))
      .returning();
    return updated;
  }

  async deleteTrainee(id: string) {
    await db.delete(schema.trainees).where(eq(schema.trainees.id, id));
  }

  async getTraineeByEmail(email: string) {
    const [trainee] = await db.select().from(schema.trainees).where(eq(schema.trainees.email, email));
    return trainee;
  }
}

export const storage = new DatabaseStorage();
