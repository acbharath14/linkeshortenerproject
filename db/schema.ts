import { pgTable, text, timestamp, integer, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const links = pgTable('links', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id', { length: 255 }).notNull(),
  originalUrl: text('original_url').notNull(),
  shortCode: varchar('short_code', { length: 10 }).notNull().unique(),
  title: varchar('title', { length: 255 }),
  description: text('description'),
  clicks: integer('clicks').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
});

export const clicks = pgTable('clicks', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  linkId: text('link_id').notNull().references(() => links.id, { onDelete: 'cascade' }),
  referrer: text('referrer'),
  userAgent: text('user_agent'),
  ipAddress: varchar('ip_address', { length: 45 }),
  clickedAt: timestamp('clicked_at').defaultNow().notNull(),
});

export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
export type Click = typeof clicks.$inferSelect;
