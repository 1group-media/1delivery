import { NextResponse } from 'next/server';
import { DeliveryRepository } from '@/lib/db/repo';
import { checkRateLimit } from '@/lib/rate-limiter';
import { isAuthorizedRequest } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    if (!isAuthorizedRequest(req)) {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere token o API key de comercio para solicitar despachos.' },
        { status: 401 }
      );
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'dispatch_client';
    const rate = checkRateLimit(ip, 30, 60000);

    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Tasa de despacho excedida. Espere unos segundos.', resetInSec: rate.resetInSec },
        { status: 429, headers: { 'Retry-After': String(rate.resetInSec) } }
      );
    }

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

    // @ts-ignore
    const isReplay = Boolean(run?.isIdempotentReplay);

    return NextResponse.json(
      { success: true, run, isIdempotentReplay: isReplay },
      {
        status: isReplay ? 200 : 201,
        headers: {
          'X-Idempotent-Replay': isReplay ? 'true' : 'false',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
