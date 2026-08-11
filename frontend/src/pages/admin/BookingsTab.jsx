import React from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";

const COLORS = { pending: "bg-amber-100 text-amber-800", approved: "bg-emerald-100 text-emerald-800", rejected: "bg-red-100 text-red-700" };

export default function BookingsTab({ bookings, reload }) {
  const setStatus = async (id, status) => {
    try {
      await api.put(`/admin/bookings/${id}`, { status });
      toast.success(status === "approved" ? "Reserva aprobada" : "Reserva rechazada");
      reload();
    } catch { toast.error("Error"); }
  };
  const fmt = (b) => new Intl.NumberFormat(b.currency === "COP" ? "es-CO" : "en-US", { style: "currency", currency: b.currency || "COP", currencyDisplay: "code", maximumFractionDigits: 0 }).format(b.total || 0);
  return (
    <div className="grid gap-3" data-testid="admin-bookings">
      {bookings.length === 0 && <p className="text-charcoal/50">No hay solicitudes de reserva aún.</p>}
      {bookings.map((b) => (
        <div key={b.id} data-testid={`booking-row-${b.id}`} className="bg-white rounded-xl p-5">
          <div className="flex flex-wrap justify-between items-start gap-3">
            <div>
              <div className="font-serif text-xl text-coffee">
                {b.name}
                <span className={`ml-2 align-middle text-[10px] tracking-widest uppercase px-2 py-1 rounded-full ${COLORS[b.status] || ""}`}>{b.status}</span>
              </div>
              <div className="text-sm text-charcoal/70 mt-1">{b.email} · {b.phone || "—"}</div>
              <div className="text-sm text-charcoal/70 mt-1">{b.property_name} · {b.checkin} → {b.checkout} · {b.nights} noches · {b.guests} huéspedes</div>
              {b.total > 0 && <div className="text-sm text-coffee font-medium mt-1">Total: {fmt(b)}</div>}
              {b.message && <p className="text-sm text-charcoal/80 mt-2 italic">"{b.message}"</p>}
            </div>
            {b.status === "pending" && (
              <div className="flex gap-2">
                <button data-testid={`booking-approve-${b.id}`} onClick={() => setStatus(b.id, "approved")} className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-emerald-700"><Check size={13}/> Aprobar</button>
                <button data-testid={`booking-reject-${b.id}`} onClick={() => setStatus(b.id, "rejected")} className="inline-flex items-center gap-1 rounded-full bg-red-500 text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-red-600"><X size={13}/> Rechazar</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
