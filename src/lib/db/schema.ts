import { pgTable, text, varchar, integer, numeric, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

// 1. Merchants & Stores Table
export const merchants = pgTable('merchants', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  numericId: varchar('numeric_id', { length: 12 }).notNull().unique(),
  name: text('name').notNull(),
  tagline: text('tagline'),
  location: text('location').notNull(),
  handle: varchar('handle', { length: 50 }),
  bcvRate: numeric('bcv_rate', { precision: 12, scale: 2 }).notNull(),
  ownerPassword: text('owner_password').notNull(),
  webhookSecret: text('webhook_secret'),
  remoteTimeoutSec: integer('remote_timeout_sec').notNull().default(30),
  remoteCooldownSec: integer('remote_cooldown_sec').notNull().default(60),
  pagoMovilConfig: jsonb('pago_movil_config').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 2. Delivery Couriers (Motorizados / Mandados)
export const deliveryCouriers = pgTable('delivery_couriers', {
  id: text('id').primaryKey(),
  cedula: varchar('cedula', { length: 20 }).notNull().unique(),
  name: text('name').notNull(),
  phone: varchar('phone', { length: 30 }).notNull(),
  bikeModel: text('bike_model').notNull(),
  vehiclePlate: varchar('vehicle_plate', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('online'), // 'online', 'busy', 'offline'
  currentLocation: text('current_location'),
  totalDeliveries: integer('total_deliveries').notNull().default(0),
  rating: numeric('rating', { precision: 3, scale: 2 }).notNull().default('5.00'),
  earningsBalanceUsd: numeric('earnings_balance_usd', { precision: 10, scale: 2 }).notNull().default('0.00'),
  pagoMovilConfig: jsonb('pago_movil_config'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_couriers_status').on(table.status),
  index('idx_couriers_cedula').on(table.cedula),
]);

// 3. Delivery Runs & Dispatch Orders
export const deliveryRuns = pgTable('delivery_runs', {
  id: text('id').primaryKey(),
  type: varchar('type', { length: 30 }).notNull(), // 'commerce_order', 'service_parts_run', 'custom_errand'
  storeSlug: text('store_slug').notNull(),
  orderId: text('order_id'),
  jobId: text('job_id'),
  courierId: text('courier_id'),
  pickupAddress: text('pickup_address').notNull(),
  deliveryAddress: text('delivery_address').notNull(),
  deliveryZone: text('delivery_zone').notNull(),
  recipientName: text('recipient_name').notNull(),
  recipientPhone: varchar('recipient_phone', { length: 30 }).notNull(),
  packageDescription: text('package_description').notNull(),
  deliveryFeeUsd: numeric('delivery_fee_usd', { precision: 10, scale: 2 }).notNull(),
  deliveryFeeVes: numeric('delivery_fee_ves', { precision: 12, scale: 2 }).notNull(),
  bcvRate: numeric('bcv_rate', { precision: 12, scale: 2 }).notNull(),
  status: varchar('status', { length: 30 }).notNull().default('pending_dispatch'), // 'pending_dispatch', 'accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled'
  notes: text('notes'),
  proofPhotoUrl: text('proof_photo_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  pickedUpAt: timestamp('picked_up_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
}, (table) => [
  index('idx_runs_status').on(table.status),
  index('idx_runs_courier').on(table.courierId),
  index('idx_runs_store').on(table.storeSlug),
]);

// 4. Ingested Bank Payments (for auto reconciliation)
export const bankPayments = pgTable('bank_payments', {
  id: text('id').primaryKey(),
  reference: varchar('reference', { length: 60 }).notNull().unique(),
  storeSlug: text('store_slug').notNull(),
  amountUsd: numeric('amount_usd', { precision: 10, scale: 2 }).notNull(),
  amountVes: numeric('amount_ves', { precision: 12, scale: 2 }).notNull(),
  settledBcvRate: numeric('settled_bcv_rate', { precision: 12, scale: 2 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 30 }),
  depositorCedula: varchar('depositor_cedula', { length: 20 }),
  bankName: text('bank_name').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('unclaimed'),
  claimedWalletId: text('claimed_wallet_id'),
  claimedAt: timestamp('claimed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
