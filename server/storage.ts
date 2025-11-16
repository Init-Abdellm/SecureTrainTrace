// Referencing blueprints: javascript_database, javascript_log_in_with_replit
import {
  users,
  trainings,
  trainees,
  type User,
  type UpsertUser,
  type Training,
  type InsertTraining,
  type Trainee,
  type InsertTrainee,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Training operations
  getAllTrainings(): Promise<Training[]>;
  getTraining(id: string): Promise<Training | undefined>;
  createTraining(training: InsertTraining): Promise<Training>;
  updateTraining(id: string, training: Partial<InsertTraining>): Promise<Training | undefined>;
  deleteTraining(id: string): Promise<void>;
  
  // Trainee operations
  getAllTrainees(): Promise<Trainee[]>;
  getTraineesByTrainingId(trainingId: string): Promise<Trainee[]>;
  getTrainee(id: string): Promise<Trainee | undefined>;
  createTrainee(trainee: InsertTrainee): Promise<Trainee>;
  createTrainees(trainees: InsertTrainee[]): Promise<Trainee[]>;
  updateTrainee(id: string, trainee: Partial<InsertTrainee>): Promise<Trainee | undefined>;
  deleteTrainee(id: string): Promise<void>;
  getTraineeByEmail(email: string): Promise<Trainee | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Training operations
  async getAllTrainings(): Promise<Training[]> {
    return await db.select().from(trainings).orderBy(trainings.createdAt);
  }

  async getTraining(id: string): Promise<Training | undefined> {
    const [training] = await db.select().from(trainings).where(eq(trainings.id, id));
    return training;
  }

  async createTraining(training: InsertTraining): Promise<Training> {
    const [newTraining] = await db
      .insert(trainings)
      .values(training)
      .returning();
    return newTraining;
  }

  async updateTraining(id: string, training: Partial<InsertTraining>): Promise<Training | undefined> {
    const [updated] = await db
      .update(trainings)
      .set({ ...training, updatedAt: new Date() })
      .where(eq(trainings.id, id))
      .returning();
    return updated;
  }

  async deleteTraining(id: string): Promise<void> {
    await db.delete(trainings).where(eq(trainings.id, id));
  }

  // Trainee operations
  async getAllTrainees(): Promise<Trainee[]> {
    return await db.select().from(trainees).orderBy(trainees.createdAt);
  }

  async getTraineesByTrainingId(trainingId: string): Promise<Trainee[]> {
    return await db.select().from(trainees).where(eq(trainees.trainingId, trainingId));
  }

  async getTrainee(id: string): Promise<Trainee | undefined> {
    const [trainee] = await db.select().from(trainees).where(eq(trainees.id, id));
    return trainee;
  }

  async createTrainee(trainee: InsertTrainee): Promise<Trainee> {
    const [newTrainee] = await db
      .insert(trainees)
      .values(trainee)
      .returning();
    return newTrainee;
  }

  async createTrainees(traineeList: InsertTrainee[]): Promise<Trainee[]> {
    const created = await db
      .insert(trainees)
      .values(traineeList)
      .returning();
    return created;
  }

  async updateTrainee(id: string, trainee: Partial<InsertTrainee>): Promise<Trainee | undefined> {
    const [updated] = await db
      .update(trainees)
      .set({ ...trainee, updatedAt: new Date() })
      .where(eq(trainees.id, id))
      .returning();
    return updated;
  }

  async deleteTrainee(id: string): Promise<void> {
    await db.delete(trainees).where(eq(trainees.id, id));
  }

  async getTraineeByEmail(email: string): Promise<Trainee | undefined> {
    const [trainee] = await db.select().from(trainees).where(eq(trainees.email, email));
    return trainee;
  }
}

export const storage = new DatabaseStorage();
