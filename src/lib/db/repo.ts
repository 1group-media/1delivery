import { db, pool } from './index';
import { deliveryCouriers, deliveryRuns, merchants } from './schema';
import { eq, desc, and, or } from 'drizzle-orm';
import { DeliveryRunType, DeliveryStatus } from '@/types';

export class DeliveryRepository {
  // 1. Get Merchant Info
  static async getMerchant(slug: string) {
    const res = await db.select().from(merchants).where(eq(merchants.slug, slug)).limit(1);
    return res[0] || null;
  }

  // 2. Register or Retrieve Courier
  static async getOrCreateCourier(data: {
    cedula: string;
    name: string;
    phone: string;
    bikeModel: string;
    vehiclePlate: string;
    pagoMovilConfig?: any;
  }) {
    const existing = await db.select().from(deliveryCouriers).where(eq(deliveryCouriers.cedula, data.cedula)).limit(1);
    if (existing.length > 0) {
      return existing[0];
    }

    const id = `courier_${Date.now()}_${data.cedula.replace(/[^0-9]/g, '')}`;
    const [inserted] = await db.insert(deliveryCouriers).values({
      id,
      cedula: data.cedula,
      name: data.name,
      phone: data.phone,
      bikeModel: data.bikeModel,
      vehiclePlate: data.vehiclePlate,
      status: 'online',
      currentLocation: 'Anaco Centro',
      totalDeliveries: 0,
      rating: '5.00',
      earningsBalanceUsd: '0.00',
      pagoMovilConfig: data.pagoMovilConfig || { bank: '0102 - BDV', phone: data.phone, cedula: data.cedula },
    }).returning();

    return inserted;
  }

  // 3. List Couriers
  static async listCouriers() {
    return await db.select().from(deliveryCouriers).orderBy(desc(deliveryCouriers.createdAt));
  }

  // 4. Dispatch a New Delivery Run
  static async dispatchRun(params: {
    type: DeliveryRunType;
    storeSlug: string;
    orderId?: string;
    jobId?: string;
    pickupAddress: string;
    deliveryAddress: string;
    deliveryZone: string;
    recipientName: string;
    recipientPhone: string;
    packageDescription: string;
    deliveryFeeUsd?: number;
    notes?: string;
  }) {
    const merchant = await this.getMerchant(params.storeSlug);
    const bcvRate = merchant ? parseFloat(merchant.bcvRate) : 66.50;
    const feeUsd = params.deliveryFeeUsd || 2.50; // $2.50 base delivery fee in Anaco
    const feeVes = (feeUsd * bcvRate).toFixed(2);

    const id = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const [run] = await db.insert(deliveryRuns).values({
      id,
      type: params.type,
      storeSlug: params.storeSlug,
      orderId: params.orderId || null,
      jobId: params.jobId || null,
      courierId: null,
      pickupAddress: params.pickupAddress,
      deliveryAddress: params.deliveryAddress,
      deliveryZone: params.deliveryZone,
      recipientName: params.recipientName,
      recipientPhone: params.recipientPhone,
      packageDescription: params.packageDescription,
      deliveryFeeUsd: feeUsd.toFixed(2),
      deliveryFeeVes: feeVes,
      bcvRate: bcvRate.toFixed(2),
      status: 'pending_dispatch',
      notes: params.notes || null,
    }).returning();

    return run;
  }

  // 5. List Runs (with filters)
  static async listRuns(filter?: { status?: string; courierId?: string; storeSlug?: string }) {
    let query = db.select().from(deliveryRuns);
    const conditions = [];

    if (filter?.status) conditions.push(eq(deliveryRuns.status, filter.status));
    if (filter?.courierId) conditions.push(eq(deliveryRuns.courierId, filter.courierId));
    if (filter?.storeSlug) conditions.push(eq(deliveryRuns.storeSlug, filter.storeSlug));

    if (conditions.length > 0) {
      // @ts-ignore
      return await db.select().from(deliveryRuns).where(and(...conditions)).orderBy(desc(deliveryRuns.createdAt));
    }

    return await db.select().from(deliveryRuns).orderBy(desc(deliveryRuns.createdAt));
  }

  // 6. Courier Accepts Run
  static async acceptRun(runId: string, courierId: string) {
    const [updated] = await db.update(deliveryRuns)
      .set({
        courierId,
        status: 'accepted',
        acceptedAt: new Date(),
      })
      .where(and(eq(deliveryRuns.id, runId), eq(deliveryRuns.status, 'pending_dispatch')))
      .returning();

    if (updated) {
      await db.update(deliveryCouriers)
        .set({ status: 'busy' })
        .where(eq(deliveryCouriers.id, courierId));
    }

    return updated || null;
  }

  // 7. Update Run Status (picked_up -> delivered)
  static async updateRunStatus(runId: string, status: DeliveryStatus, proofPhotoUrl?: string) {
    const now = new Date();
    const updateData: any = { status };

    if (status === 'picked_up') {
      updateData.pickedUpAt = now;
    } else if (status === 'delivered') {
      updateData.deliveredAt = now;
      if (proofPhotoUrl) updateData.proofPhotoUrl = proofPhotoUrl;
    }

    const [updated] = await db.update(deliveryRuns)
      .set(updateData)
      .where(eq(deliveryRuns.id, runId))
      .returning();

    // If delivered: credit motorizado earnings and update totals
    if (updated && status === 'delivered' && updated.courierId) {
      const fee = parseFloat(updated.deliveryFeeUsd);
      // Motorizado earns 80% of delivery fee, 1group keeps 20% platform fee
      const courierEarn = (fee * 0.80).toFixed(2);

      await pool.query(`
        UPDATE delivery_couriers
        SET
          total_deliveries = total_deliveries + 1,
          earnings_balance_usd = earnings_balance_usd + $1,
          status = 'online'
        WHERE id = $2
      `, [courierEarn, updated.courierId]);
    }

    return updated;
  }

  // 8. Settle Courier Earnings (Instant Pago Móvil Payout Record)
  static async settleCourierPayout(courierId: string) {
    const courierRes = await db.select().from(deliveryCouriers).where(eq(deliveryCouriers.cedula, courierId)).limit(1);
    const courier = courierRes[0];
    if (!courier) return null;

    const balanceUsd = parseFloat(courier.earningsBalanceUsd);
    if (balanceUsd <= 0) return { error: 'No balance to settle' };

    const bcvRate = 66.50;
    const balanceVes = (balanceUsd * bcvRate).toFixed(2);
    const payoutRef = `PM-PAYOUT-${Math.floor(100000 + Math.random() * 900000)}`;

    // Reset balance
    await db.update(deliveryCouriers)
      .set({ earningsBalanceUsd: '0.00' })
      .where(eq(deliveryCouriers.id, courier.id));

    return {
      success: true,
      courierId: courier.id,
      courierName: courier.name,
      paidUsd: balanceUsd,
      paidVes: Number(balanceVes),
      bcvRate,
      payoutRef,
      pagoMovilDestination: courier.pagoMovilConfig,
      timestamp: new Date().toISOString()
    };
  }
}
