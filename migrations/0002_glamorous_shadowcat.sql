ALTER TYPE "public"."order_status" ADD VALUE 'CONFIRMED' BEFORE 'SHIPPED';--> statement-breakpoint
ALTER TYPE "public"."payment_status" ADD VALUE 'EXPIRED' BEFORE 'REFUNDED';