import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Training programs table
export const trainings = pgTable("trainings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  date: date("date").notNull(),
  duration: varchar("duration", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTrainingSchema = createInsertSchema(trainings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTraining = z.infer<typeof insertTrainingSchema>;
export type Training = typeof trainings.$inferSelect;

// Trainees table
export const trainees = pgTable("trainees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  surname: varchar("surname", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phoneNumber: varchar("phone_number", { length: 50 }).notNull(),
  companyName: varchar("company_name", { length: 255 }),
  trainingId: varchar("training_id").notNull().references(() => trainings.id, { onDelete: "cascade" }),
  trainingDate: date("training_date").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  certificateUrl: varchar("certificate_url", { length: 500 }),
  certificateId: varchar("certificate_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTraineeSchema = createInsertSchema(trainees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  certificateUrl: true,
  certificateId: true,
}).extend({
  email: z.string().email("Invalid email format"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  status: z.enum(["pending", "passed", "failed"]).default("pending"),
});

export type InsertTrainee = z.infer<typeof insertTraineeSchema>;
export type Trainee = typeof trainees.$inferSelect;

// Excel upload validation schema
export const excelTraineeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  surname: z.string().min(1, "Surname is required"),
  email: z.string().email("Invalid email format"),
  phone_number: z.string().min(1, "Phone number is required"),
  company_name: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  training_name: z.string().min(1, "Training name is required"),
  training_id: z.string().min(1, "Training ID is required"),
});

export type ExcelTrainee = z.infer<typeof excelTraineeSchema>;
