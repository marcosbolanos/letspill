ALTER TABLE "user_preferences" ALTER COLUMN "pill_regime" SET DEFAULT '21on7off';--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "pill_regime" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "startDate" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "username" DROP NOT NULL;