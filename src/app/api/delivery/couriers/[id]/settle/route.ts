import { NextResponse } from 'next/server';
import { DeliveryRepository } from '@/lib/db/repo';
import { isAuthorizedRequest } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAuthorizedRequest(req)) {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere token o API key de administrador para liquidar pagos.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const settlement = await DeliveryRepository.settleCourierPayout(id);

    if (!settlement) {
      return NextResponse.json({ error: 'Motorizado no encontrado' }, { status: 404 });
    }

    if ((settlement as any).error) {
      return NextResponse.json({ error: (settlement as any).error }, { status: 400 });
    }

    return NextResponse.json({ success: true, settlement });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
