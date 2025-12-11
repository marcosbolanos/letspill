ALTER TABLE "pill_events" RENAME COLUMN "pillDate" TO "pill_date";--> statement-breakpoint
ALTER TABLE "pill_events" RENAME COLUMN "pillTaken" TO "pill_taken";--> statement-breakpoint
DROP INDEX "pillEvents_userId_pillDate_idx";--> statement-breakpoint
CREATE INDEX "pillEvents_userId_pillDate_idx" ON "pill_events" USING btree ("user_id","pill_date","created_at" DESC NULLS LAST);