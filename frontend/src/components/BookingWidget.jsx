import React, { useEffect, useMemo, useState } from "react";
import { Star, Loader2, CheckCircle2 } from "lucide-react";
import { format, differenceInCalendarDays } from "date-fns";
import { es as esLocale } from "date-fns/locale";
import { Calendar } from "./ui/calendar";
import { useLang } from "../i18n";
import { api } from "../lib/api";

const iso = (d) => format(d, "yyyy-MM-dd");

export const BookingWidget = ({ p }) => {
  const { t, lang } = useLang();
  const bk = t.bk;
  const [blocked, setBlocked] = useState([]);
  const [range, setRange] = useState();
  const [guests, setGuests] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/properties/${p.slug}/availability`).then((r) => setBlocked(r.data.blocked || [])).catch(() => {});
  }, [p.slug]);

  const disabled = useMemo(() => [
    { before: new Date() },
    ...blocked.map((b) => {
      const end = new Date(b.end + "T00:00:00");
      end.setDate(end.getDate() - 1);
      return { from: new Date(b.start + "T00:00:00"), to: end };
    }),
  ], [blocked]);

  const nights = range?.from && range?.to ? differenceInCalendarDays(range.to, range.from) : 0;
  const hasConflict = useMemo(() => {
    if (!nights) return false;
    const ci = iso(range.from), co = iso(range.to);
    return blocked.some((b) => b.start < co && ci < b.end);
  }, [blocked, range, nights]);

  const price = p.price_night || 0;
  const total = price ? nights * price + (p.cleaning_fee || 0) : 0;
  const fmt = (n) => new Intl.NumberFormat(p.currency === "COP" ? "es-CO" : "en-US", { style: "currency", currency: p.currency || "COP", currencyDisplay: "code", maximumFractionDigits: 0 }).format(n);
  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));
  const canSubmit = nights > 0 && !hasConflict && form.name && form.email;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(""); setState("sending");
    try {
      await api.post("/bookings", { property_slug: p.slug, ...form, checkin: iso(range.from), checkout: iso(range.to), guests: +guests });
      setState("success");
    } catch (err) {
      setState("idle");
      setError(err.response?.status === 409 ? bk.conflict : err.response?.data?.detail || bk.error);
    }
  };

  const inp = "w-full border border-sand rounded-lg px-3 py-2.5 text-sm text-coffee bg-white outline-none focus:border-coral";

  return (
    <div data-testid="booking-widget" className="md:sticky md:top-28 bg-white rounded-2xl p-6 shadow-[0_20px_60px_-30px_rgba(58,44,37,0.35)]">
      {state === "success" ? (
        <div data-testid="booking-success" className="text-center py-8">
          <CheckCircle2 size={40} className="text-coral mx-auto" strokeWidth={1.4} />
          <h3 className="font-serif text-2xl text-coffee mt-4">{bk.success}</h3>
          <p className="text-charcoal/70 text-sm mt-2 leading-relaxed">{bk.successBody}</p>
          {p.airbnb_url && (
            <a href={p.airbnb_url} target="_blank" rel="noreferrer" className="inline-block mt-6 text-xs tracking-widest uppercase text-coffee/60 hover:text-coral transition-colors">{bk.viewAirbnb}</a>
          )}
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 text-coral">{[...Array(5)].map((_, k) => <Star key={k} size={13} fill="currentColor" />)}</div>
            {price > 0 && (
              <div className="text-right">
                <span className="font-serif text-2xl text-coffee">{fmt(price)}</span>
                <span className="text-charcoal/50 text-xs"> / {bk.night}</span>
              </div>
            )}
          </div>
          <p className="overline text-charcoal/50 mb-4">{p.location}</p>

          <p className="overline text-coffee mb-2">{bk.select}</p>
          <div className="border border-sand rounded-xl flex justify-center mb-4" data-testid="booking-calendar">
            <Calendar mode="range" selected={range} onSelect={setRange} disabled={disabled} numberOfMonths={1} locale={lang === "es" ? esLocale : undefined} />
          </div>

          {nights > 0 && (
            <div className="text-xs text-charcoal/70 mb-4 space-y-1.5 border-b border-sand pb-4" data-testid="booking-breakdown">
              <div className="flex justify-between"><span>{iso(range.from)} → {iso(range.to)}</span><span>{nights} {bk.nights}</span></div>
              {price > 0 && (
                <>
                  <div className="flex justify-between"><span>{fmt(price)} × {nights} {bk.nights}</span><span>{fmt(price * nights)}</span></div>
                  {p.cleaning_fee > 0 && <div className="flex justify-between"><span>{bk.cleaning}</span><span>{fmt(p.cleaning_fee)}</span></div>}
                  <div className="flex justify-between font-semibold text-coffee text-sm pt-1"><span>{bk.total}</span><span data-testid="booking-total">{fmt(total)}</span></div>
                </>
              )}
              {hasConflict && <p className="text-destructive font-medium pt-1" data-testid="booking-conflict">{bk.invalid}</p>}
            </div>
          )}

          <div className="space-y-2.5">
            <input data-testid="booking-name" required placeholder={bk.name} value={form.name} onChange={set("name")} className={inp} />
            <input data-testid="booking-email" required type="email" placeholder={bk.email} value={form.email} onChange={set("email")} className={inp} />
            <input data-testid="booking-phone" placeholder={bk.phone} value={form.phone} onChange={set("phone")} className={inp} />
            <select data-testid="booking-guests" value={guests} onChange={(e) => setGuests(e.target.value)} className={inp}>
              {[...Array(p.guests)].map((_, k) => <option key={k} value={k + 1}>{k + 1} {bk.guests}</option>)}
            </select>
          </div>

          {error && <p className="text-destructive text-xs mt-3" data-testid="booking-error">{error}</p>}

          <button data-testid="booking-request" type="submit" disabled={!canSubmit || state === "sending"}
            className="w-full mt-4 rounded-full bg-coral text-white py-4 text-xs tracking-widest uppercase hover:bg-coral-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {state === "sending" && <Loader2 size={14} className="animate-spin" />} {state === "sending" ? bk.sending : bk.request}
          </button>
          <p className="text-center text-[0.68rem] text-charcoal/50 mt-3">{bk.note}</p>

          {p.airbnb_url && (
            <div className="mt-5 pt-5 border-t border-sand text-center">
              <p className="text-xs text-charcoal/55 mb-2">{bk.prefer}</p>
              <a href={p.airbnb_url} target="_blank" rel="noreferrer" data-testid="booking-airbnb"
                className="inline-block w-full rounded-full border border-sand text-coffee/70 py-3 text-xs tracking-widest uppercase hover:border-coral hover:text-coral transition-colors">
                {bk.viewAirbnb}
              </a>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
