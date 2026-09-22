'use client';

import React, { useState, useEffect, use } from 'react';
import {
  Bike,
  MapPin,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Phone,
  RefreshCw,
  Navigation,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function MotorizadoPwa({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courierId = resolvedParams.id;

  const [courier, setCourier] = useState<any>(null);
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [payoutResult, setPayoutResult] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [cRes, rRes] = await Promise.all([
        fetch('/api/delivery/couriers'),
        fetch('/api/delivery/runs')
      ]);
      const cData = await cRes.json();
      const rData = await rRes.json();

      const matchedCourier = (cData.couriers || []).find(
        (c: any) => c.cedula === courierId || c.id === courierId
      );
      setCourier(matchedCourier || null);
      setRuns(rData.runs || []);
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
  }, [courierId]);

  const handleAccept = async (runId: string) => {
    if (!courier) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/delivery/runs/${runId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept', courierId: courier.id })
      });
      if (res.ok) await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async (runId: string, status: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/delivery/runs/${runId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayout = async () => {
    if (!courier) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/delivery/couriers/${courier.cedula}/settle`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setPayoutResult(data.settlement);
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mb-2" />
        <p className="text-sm">Cargando terminal de motorizado...</p>
      </div>
    );
  }

  const activeRun = runs.find(
    (r) => r.courierId === courier?.id && (r.status === 'accepted' || r.status === 'picked_up')
  );
  const availableRuns = runs.filter((r) => r.status === 'pending_dispatch');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 max-w-md mx-auto pb-20 border-x border-slate-900 shadow-2xl">
      {/* Top Mobile Bar */}
      <header className="p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black">
            <Bike className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-100 leading-tight">
              {courier?.name || 'Motorizado'}
            </h1>
            <p className="text-[11px] text-amber-400 font-semibold">
              {courier?.bikeModel} · Placa: {courier?.vehiclePlate}
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </header>

      {/* Wallet Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-4 shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Balance Acumulado (USD)</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
              Pago Móvil Inmediato
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-amber-400">${Number(courier?.earningsBalanceUsd || 0).toFixed(2)}</span>
              <span className="text-xs text-slate-400 ml-2">
                (~{(Number(courier?.earningsBalanceUsd || 0) * 66.50).toFixed(2)} Bs.)
              </span>
            </div>
            <button
              onClick={handlePayout}
              disabled={actionLoading || Number(courier?.earningsBalanceUsd || 0) <= 0}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-black text-xs rounded-xl shadow transition"
            >
              Liquidar
            </button>
          </div>

          {payoutResult && (
            <div className="mt-3 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
              <p className="font-bold">✓ Pago Móvil Liquidado:</p>
              <p>{payoutResult.paidVes} Bs. transferidos a {payoutResult.payoutRef}</p>
            </div>
          )}
        </div>
      </div>

      {/* Active Run Section (In Progress) */}
      {activeRun && (
        <div className="px-4 mb-5">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-2xl p-4 shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                <Navigation className="w-4 h-4 animate-bounce" /> Carrera en Curso
              </span>
              <span className="text-xs font-bold bg-amber-500 text-black px-2 py-0.5 rounded">
                ${Number(activeRun.deliveryFeeUsd).toFixed(2)} USD
              </span>
            </div>

            <h2 className="text-sm font-bold text-slate-100 mb-2">{activeRun.packageDescription}</h2>

            <div className="space-y-2 text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 mb-4">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-bold block">1. Retirar en:</span>
                  <span className="font-medium text-slate-200">{activeRun.pickupAddress}</span>
                </div>
              </div>
              <div className="flex items-start gap-2 border-t border-slate-800/80 pt-2">
                <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-bold block">2. Entregar a:</span>
                  <span className="font-medium text-slate-200">{activeRun.deliveryAddress} ({activeRun.deliveryZone})</span>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[11px] text-amber-300 font-bold">
                      Cliente: {activeRun.recipientName} · {activeRun.recipientPhone}
                    </p>
                    <a
                      href={`https://wa.me/${activeRun.recipientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`¡Hola ${activeRun.recipientName}! Soy tu motorizado de 1delivery. Voy en camino con tu paquete (${activeRun.packageDescription}).`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg transition"
                    >
                      <span>💬</span> WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons based on current state */}
            {activeRun.status === 'accepted' ? (
              <button
                onClick={() => handleStatusUpdate(activeRun.id, 'picked_up')}
                disabled={actionLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-xl uppercase tracking-wider transition shadow-lg"
              >
                📦 Marcar Paquete a Bordo
              </button>
            ) : (
              <button
                onClick={() => handleStatusUpdate(activeRun.id, 'delivered')}
                disabled={actionLoading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm rounded-xl uppercase tracking-wider transition shadow-lg"
              >
                ✓ Confirmar Entrega Realizada
              </button>
            )}
          </div>
        </div>
      )}

      {/* Available Runs Queue */}
      <div className="px-4">
        <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3 flex items-center justify-between">
          <span>Mandados Disponibles ({availableRuns.length})</span>
          <span className="text-[10px] text-amber-400 font-normal">Toca para aceptar</span>
        </h2>

        {availableRuns.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center text-slate-500 text-xs">
            <p>No hay carreras pendientes en Anaco en este momento.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableRuns.map((run) => (
              <div
                key={run.id}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-3.5 transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {run.type === 'service_parts_run' ? '🛠️ Repuesto Taller' : run.type === 'commerce_order' ? '📦 Tienda' : '⚡ Mandado'}
                  </span>
                  <span className="text-sm font-black text-amber-400">
                    +${(Number(run.deliveryFeeUsd) * 0.8).toFixed(2)} USD
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-200 mb-2">{run.packageDescription}</h3>

                <div className="text-[11px] text-slate-400 space-y-1 mb-3">
                  <p className="truncate"><strong>Desde:</strong> {run.pickupAddress}</p>
                  <p className="truncate"><strong>Hacia:</strong> {run.deliveryAddress} ({run.deliveryZone})</p>
                </div>

                <button
                  onClick={() => handleAccept(run.id)}
                  disabled={actionLoading || !!activeRun}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-black text-xs rounded-xl uppercase tracking-wider transition"
                >
                  {activeRun ? 'Termina tu carrera actual' : 'Aceptar Mandado'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
