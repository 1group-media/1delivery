import { NextResponse } from 'next/server';
import { DeliveryRepository } from '@/lib/db/repo';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.type || !body.storeSlug || !body.pickupAddress || !body.deliveryAddress || !body.recipientName || !body.recipientPhone || !body.packageDescription) {
      return NextResponse.json({ error: 'Faltan campos requeridos para el mandado' }, { status: 400 });
    }

    const run = await DeliveryRepository.dispatchRun({
      type: body.type,
      storeSlug: body.storeSlug,
      orderId: body.orderId,
      jobId: body.jobId,
      pickupAddress: body.pickupAddress,
      deliveryAddress: body.deliveryAddress,
      deliveryZone: body.deliveryZone || 'Anaco Centro',
      recipientName: body.recipientName,
      recipientPhone: body.recipientPhone,
      packageDescription: body.packageDescription,
      deliveryFeeUsd: body.deliveryFeeUsd ? Number(body.deliveryFeeUsd) : 2.50,
      notes: body.notes,
    });

    return NextResponse.json({ success: true, run }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
