import { NextResponse } from 'next/server';
import { DeliveryRepository } from '@/lib/db/repo';

export async function GET() {
  try {
    const couriers = await DeliveryRepository.listCouriers();
    return NextResponse.json({ couriers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.cedula || !body.name || !body.phone || !body.bikeModel || !body.vehiclePlate) {
      return NextResponse.json({ error: 'Faltan datos del motorizado' }, { status: 400 });
    }

    const courier = await DeliveryRepository.getOrCreateCourier(body);
    return NextResponse.json({ success: true, courier }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
