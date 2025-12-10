CREATE TYPE "public"."invite_status" AS ENUM('pending', 'approved', 'revoked', 'ignored');--> statement-breakpoint
CREATE TYPE "public"."pill_regime_enum" AS ENUM('none', '21on7off', '21on7placebo', '21continous', '28continous');--> statement-breakpoint
CREATE TABLE "access_grant_log" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_id" text,
	"target_owner_id" text,
	"grantee_id" text,
	"action" text NOT NULL,
	"object_type" text,
	"object_id" text,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "access_grants" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"grantee_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "access_owner_grantee_scope_uniq" UNIQUE("owner_id","grantee_id"),
	CONSTRAINT "no_self_grants" CHECK ("access_grants"."owner_id" != "access_grants"."grantee_id")
);
--> statement-breakpoint
CREATE TABLE "access_invites" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"invitee_id" text NOT NULL,
	"status" "invite_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "access_request_owner_invitee_uniq" UNIQUE("owner_id","invitee_id"),
	CONSTRAINT "no_self_invites" CHECK ("access_invites"."owner_id" != "access_invites"."invitee_id")
);
--> statement-breakpoint
CREATE TABLE "pill_events" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"pillDate" date NOT NULL,
	"pillTaken" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"user_id" text PRIMARY KEY NOT NULL,
	"pill_regime" "pill_regime_enum",
	"startDate" date NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "access_grant_log" ADD CONSTRAINT "access_grant_log_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_grant_log" ADD CONSTRAINT "access_grant_log_target_owner_id_user_id_fk" FOREIGN KEY ("target_owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_grant_log" ADD CONSTRAINT "access_grant_log_grantee_id_user_id_fk" FOREIGN KEY ("grantee_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_grants" ADD CONSTRAINT "access_grants_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_grants" ADD CONSTRAINT "access_grants_grantee_id_user_id_fk" FOREIGN KEY ("grantee_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_invites" ADD CONSTRAINT "access_invites_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_invites" ADD CONSTRAINT "access_invites_invitee_id_user_id_fk" FOREIGN KEY ("invitee_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pill_events" ADD CONSTRAINT "pill_events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_actor_idx" ON "access_grant_log" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "audit_target_idx" ON "access_grant_log" USING btree ("target_owner_id");--> statement-breakpoint
CREATE INDEX "access_owner_grantee_idx" ON "access_grants" USING btree ("owner_id","grantee_id");--> statement-breakpoint
CREATE INDEX "access_grantee_idx" ON "access_grants" USING btree ("grantee_id");--> statement-breakpoint
CREATE INDEX "access_request_owner_invitee_idx" ON "access_invites" USING btree ("owner_id","invitee_id");--> statement-breakpoint
CREATE INDEX "access_request_invitee_idx" ON "access_invites" USING btree ("invitee_id");--> statement-breakpoint
CREATE INDEX "pillEvents_userId_pillDate_idx" ON "pill_events" USING btree ("user_id","pillDate");