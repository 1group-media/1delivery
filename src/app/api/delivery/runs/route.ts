import { NextResponse } from 'next/server';
import { DeliveryRepository } from '@/lib/db/repo';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const courierId = searchParams.get('courierId') || undefined;
    const storeSlug = searchParams.get('storeSlug') || undefined;

    const runs = await DeliveryRepository.listRuns({ status, courierId, storeSlug });
    return NextResponse.json({ runs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
