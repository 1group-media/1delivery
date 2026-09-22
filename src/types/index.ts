export type DeliveryRunType = 'commerce_order' | 'service_parts_run' | 'custom_errand';

export type DeliveryStatus =
  | 'pending_dispatch'
  | 'accepted'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export interface CourierProfile {
  id: string;
  cedula: string;
  name: string;
  phone: string;
  bikeModel: string;
  vehiclePlate: string;
  status: 'online' | 'busy' | 'offline';
  currentLocation?: string;
  totalDeliveries: number;
  rating: number;
  earningsBalanceUsd: number;
  pagoMovilConfig?: {
    bank: string;
    phone: string;
    cedula: string;
  };
  createdAt: string;
}

export interface DeliveryRun {
  id: string;
  type: DeliveryRunType;
  storeSlug: string;
  orderId?: string;
  jobId?: string;
  courierId?: string;
  pickupAddress: string;
  deliveryAddress: string;
  deliveryZone: string;
  recipientName: string;
  recipientPhone: string;
  packageDescription: string;
  deliveryFeeUsd: number;
  deliveryFeeVes: number;
  bcvRate: number;
  status: DeliveryStatus;
  notes?: string;
  proofPhotoUrl?: string;
  createdAt: string;
  acceptedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
}
