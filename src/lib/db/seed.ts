import { DeliveryRepository } from './repo';

export async function seedDelivery() {
  console.log('[1delivery] Seeding motorizados and initial dispatch runs in Anaco...');

  // 1. Seed Courier
  const courier = await DeliveryRepository.getOrCreateCourier({
    cedula: 'V-24890123',
    name: 'Carlos Mendoza (El Gocho)',
    phone: '0412-5550199',
    bikeModel: 'Bera SBR 150 (Azul)',
    vehiclePlate: 'AI8K99X',
    pagoMovilConfig: {
      bank: '0102 - BDV',
      phone: '04125550199',
      cedula: '24890123'
    }
  });
  console.log('Courier seeded:', courier.name);

  // 2. Seed Commerce Order Delivery
  const run1 = await DeliveryRepository.dispatchRun({
    type: 'commerce_order',
    storeSlug: 'san-antonio',
    pickupAddress: 'Licorería San Antonio, Av. Portuguesa c/c Sucre, Anaco',
    deliveryAddress: 'Calle 1ro de Mayo, Casa #42, Anaco Centro',
    deliveryZone: 'Anaco Centro',
    recipientName: 'Alejandro Bastardo',
    recipientPhone: '0414-7778899',
    packageDescription: '1x Caja Ron Santa Teresa Gran Reserva + 2x Coca Cola 2L',
    deliveryFeeUsd: 2.50,
    notes: 'Portón negro. Tocar timbre o llamar al llegar.',
  });
  console.log('Run 1 (Commerce) dispatched:', run1.id);

  // 3. Seed Service Parts Run (Urgent Mechanic Parts Errand)
  const run2 = await DeliveryRepository.dispatchRun({
    type: 'service_parts_run',
    storeSlug: 'motozen',
    pickupAddress: 'Auto Repuestos El Tigre, Av. Mérida, Anaco',
    deliveryAddress: 'Taller MotoZen ADV, Galpón #4, Zona Industrial Anaco',
    deliveryZone: 'Zona Industrial',
    recipientName: 'Ron (Taller MotoZen)',
    recipientPhone: '0412-0000000',
    packageDescription: 'Pastillas de freno Brembo + Filtro de Aceite K&N para Ducati DesertX',
    deliveryFeeUsd: 3.50,
    notes: 'Entregar directamente al mecánico jefe en el elevador principal.',
  });
  console.log('Run 2 (Service Parts Run) dispatched:', run2.id);

  return { courier, run1, run2 };
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedDelivery().then(() => process.exit(0)).catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}
