import { pgTable, text, timestamp, uuid, jsonb, integer } from "drizzle-orm/pg-core";
import type { MarketSnapshot, OnchainDataset } from "@/lib/types";

export const researchTheses = pgTable("research_theses", {
  id: text("id").primaryKey(),
  hypothesis: text("hypothesis").notNull(),
  supporting: text("supporting").notNull(),
  contradicting: text("contradicting").notNull(),
  invalidation: text("invalidation").notNull(),
  stance: text("stance").notNull().default("Under review"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const marketSnapshots = pgTable("market_snapshots", {
  id: text("id").primaryKey(),
  data: jsonb("data").$type<MarketSnapshot>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const researchNotes = pgTable("research_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  category: text("category").notNull().default("Observation"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const researchRuns = pgTable("research_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  status: text("status").notNull(),
  sourceCount: integer("source_count").notNull(),
  detail: text("detail").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const onchainDatasets = pgTable("onchain_datasets", {
  id: text("id").primaryKey(),
  data: jsonb("data").$type<OnchainDataset>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
