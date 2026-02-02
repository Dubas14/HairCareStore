import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260202181448 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "loyalty_points" drop constraint if exists "loyalty_points_referral_code_unique";`);
    this.addSql(`alter table if exists "loyalty_points" drop constraint if exists "loyalty_points_customer_id_unique";`);
    this.addSql(`create table if not exists "loyalty_points" ("id" text not null, "customer_id" text not null, "points_balance" integer not null default 0, "total_earned" integer not null default 0, "total_spent" integer not null default 0, "level" text check ("level" in ('bronze', 'silver', 'gold')) not null default 'bronze', "referral_code" text not null, "referred_by" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "loyalty_points_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_loyalty_points_customer_id_unique" ON "loyalty_points" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_loyalty_points_referral_code_unique" ON "loyalty_points" ("referral_code") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_loyalty_points_deleted_at" ON "loyalty_points" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "loyalty_transaction" ("id" text not null, "customer_id" text not null, "transaction_type" text check ("transaction_type" in ('earned', 'spent', 'expired', 'welcome', 'referral', 'adjustment')) not null, "points_amount" integer not null, "order_id" text null, "description" text null, "balance_after" integer not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "loyalty_transaction_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_loyalty_transaction_deleted_at" ON "loyalty_transaction" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_loyalty_transaction_customer" ON "loyalty_transaction" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_loyalty_transaction_order" ON "loyalty_transaction" ("order_id") WHERE order_id IS NOT NULL AND deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "loyalty_points" cascade;`);

    this.addSql(`drop table if exists "loyalty_transaction" cascade;`);
  }

}
