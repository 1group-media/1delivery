import { NextResponse } from 'next/server';
import { DeliveryRepository } from '@/lib/db/repo';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (body.action === 'accept' && body.courierId) {
      const run = await DeliveryRepository.acceptRun(id, body.courierId);
      if (!run) {
        return NextResponse.json({ error: 'Run already claimed or not found' }, { status: 409 });
      }
      return NextResponse.json({ success: true, run });
    }

    if (body.status) {
      const run = await DeliveryRepository.updateRunStatus(id, body.status, body.proofPhotoUrl);
      return NextResponse.json({ success: true, run });
    }

    return NextResponse.json({ error: 'Invalid action or status' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
