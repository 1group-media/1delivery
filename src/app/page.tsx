'use client';

import React, { useState, useEffect } from 'react';
import {
  Bike,
  Package,
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  RefreshCw,
  Phone,
  MapPin,
  DollarSign
} from 'lucide-react';

export default function CentralDispatchDashboard() {
  const [runs, setRuns] = useState<any[]>([]);
  const [couriers, setCouriers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDispatching, setIsDispatching] = useState(false);

  // New run form
  const [type, setType] = useState<'commerce_order' | 'service_parts_run' | 'custom_errand'>('commerce_order');
  const [storeSlug, setStoreSlug] = useState('san-antonio');
  const [pickupAddress, setPickupAddress] = useState('Licorería San Antonio, Av. Portuguesa, Anaco');
  const [deliveryAddress, setDeliveryAddress] = useState('Av. Miranda, Res. Las Flores, Apto 3B');
  const [deliveryZone, setDeliveryZone] = useState('Anaco Centro');
  const [recipientName, setRecipientName] = useState('Manuel Ramos');
  const [recipientPhone, setRecipientPhone] = useState('0414-8889900');
  const [packageDescription, setPackageDescription] = useState('2x Cerveza Polar Pilsen + 1x Hielo');
  const [deliveryFeeUsd, setDeliveryFeeUsd] = useState(2.50);

  const fetchData = async () => {
    try {
      const [runsRes, couriersRes] = await Promise.all([
        fetch('/api/delivery/runs'),
        fetch('/api/delivery/couriers')
      ]);
      const runsData = await runsRes.json();
      const couriersData = await couriersRes.json();
      setRuns(runsData.runs || []);
      setCouriers(couriersData.couriers || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDispatching(true);
    try {
      const res = await fetch('/api/delivery/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          storeSlug,
          pickupAddress,
          deliveryAddress,
          deliveryZone,
          recipientName,
          recipientPhone,
          packageDescription,
          deliveryFeeUsd: Number(deliveryFeeUsd)
        })
      });
      if (res.ok) {
        await fetchData();
        setRecipientName('');
        setPackageDescription('');
      }
    } catch (err) {
      console.error('Dispatch error:', err);
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Top Banner */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-30 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight">1delivery</span>
                <span className="text-[10px] bg-amber-500 text-black font-extrabold px-1.5 py-0.5 rounded">ANACO</span>
              </div>
              <p className="text-xs text-slate-400">Despacho de Mandados y Repuestos · @motozen_adv</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Recargar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <a
              href="/motorizado/V-24890123"
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg flex items-center gap-1.5 transition"
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Ver PWA Motorizado</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Dispatch Form */}
        <section className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl h-fit">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Despachar Nuevo Mandado
          </h2>

          <form onSubmit={handleDispatch} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Tipo de Envío</label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setType('commerce_order');
                    setPickupAddress('Licorería San Antonio, Av. Portuguesa, Anaco');
                    setStoreSlug('san-antonio');
                  }}
                  className={`py-2 px-1 rounded-lg border text-center font-bold flex flex-col items-center gap-1 transition ${
                    type === 'commerce_order'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Comercio</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('service_parts_run');
                    setPickupAddress('Auto Repuestos El Tigre, Av. Mérida, Anaco');
                    setStoreSlug('motozen');
                  }}
                  className={`py-2 px-1 rounded-lg border text-center font-bold flex flex-col items-center gap-1 transition ${
                    type === 'service_parts_run'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Taller Partes</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('custom_errand');
                    setPickupAddress('Farmacia Saas, Anaco Centro');
                    setStoreSlug('mandado');
                  }}
                  className={`py-2 px-1 rounded-lg border text-center font-bold flex flex-col items-center gap-1 transition ${
                    type === 'custom_errand'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>Mandado</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Punto de Retiro (Pickup)</label>
              <input
                type="text"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Destino de Entrega (Delivery)</label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Zona</label>
                <select
                  value={deliveryZone}
                  onChange={(e) => setDeliveryZone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                >
                  <option value="Anaco Centro">Anaco Centro</option>
                  <option value="Campo Sur">Campo Sur</option>
                  <option value="Campo Norte">Campo Norte</option>
                  <option value="Zona Industrial">Zona Industrial</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Tarifa Envío ($)</label>
                <input
                  type="number"
                  step="0.50"
                  value={deliveryFeeUsd}
                  onChange={(e) => setDeliveryFeeUsd(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-amber-400 font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Destinatario y Teléfono</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  required
                />
                <input
                  type="text"
                  placeholder="0412-0000000"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Descripción del Paquete</label>
              <textarea
                value={packageDescription}
                onChange={(e) => setPackageDescription(e.target.value)}
                rows={2}
                placeholder="Ej. Pastillas de freno o 2 botellas ron"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isDispatching}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl uppercase tracking-wider transition shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
            >
              {isDispatching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Bike className="w-4 h-4" />}
              <span>Lanzar a Motorizados</span>
            </button>
          </form>
        </section>

        {/* Middle & Right Column: Active Dispatch Runs */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Cola Activa de Envíos ({runs.length})
            </h2>
            <div className="flex gap-2 text-xs">
              <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg font-medium">
                {couriers.filter(c => c.status === 'online').length} Motorizados Disponibles
              </span>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
              <span>Cargando carreras de entrega...</span>
            </div>
          ) : runs.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              <p>No hay mandados activos en este momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {runs.map((run) => {
                const isPending = run.status === 'pending_dispatch';
                const isAccepted = run.status === 'accepted';
                const isPickedUp = run.status === 'picked_up';
                const isDelivered = run.status === 'delivered';

                return (
                  <div
                    key={run.id}
                    className={`border rounded-2xl p-4 transition ${
                      isPending
                        ? 'bg-amber-500/5 border-amber-500/40'
                        : isDelivered
                        ? 'bg-slate-900/50 border-emerald-500/20 opacity-80'
                        : 'bg-slate-900 border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wide ${
                        run.type === 'service_parts_run'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : run.type === 'commerce_order'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {run.type === 'service_parts_run' ? '🛠️ Repuesto Taller' : run.type === 'commerce_order' ? '📦 Tienda' : '⚡ Mandado'}
                      </span>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                        isPending
                          ? 'bg-amber-500 text-black animate-pulse'
                          : isDelivered
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {isPending ? 'Buscando Moto' : isAccepted ? 'Asignado' : isPickedUp ? 'En Tránsito' : 'Entregado'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-100 line-clamp-1">{run.packageDescription}</h3>
                    <p className="text-xs text-amber-400 font-semibold mb-3">
                      ${Number(run.deliveryFeeUsd).toFixed(2)} USD · ({Number(run.deliveryFeeVes).toFixed(2)} Bs.)
                    </p>

                    <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800 pt-2.5 mb-3">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate"><strong>Desde:</strong> {run.pickupAddress}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate"><strong>Hacia:</strong> {run.deliveryAddress} ({run.deliveryZone})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{run.recipientName} ({run.recipientPhone})</span>
                      </div>
                    </div>

                    {run.notes && (
                      <div className="text-[11px] bg-slate-950/60 p-2 rounded text-slate-400 italic mb-2">
                        "{run.notes}"
                      </div>
                    )}

                    <div className="text-[10px] text-slate-500 flex justify-between items-center border-t border-slate-800/80 pt-2">
                      <span>ID: {run.id.slice(-8)}</span>
                      <span>{new Date(run.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
