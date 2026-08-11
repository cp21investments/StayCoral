import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Users, BedDouble, Bath, MapPin, Check, X, Star, ChevronLeft, ChevronRight, ArrowLeft, ZoomIn, ZoomOut } from "lucide-react";
import { useLang } from "../i18n";
import { getProperty } from "../lib/api";
import { Reveal } from "../lib/motion";
import { BookingWidget } from "../components/BookingWidget";
import { PropertyReviews } from "../components/PropertyReviews";

const AMEN_FAQ = {
  en: [["What time is check-in / check-out?", "Check-in is from 3:00 PM and check-out is at 11:00 AM. Flexible times may be available on request."],
       ["Is the apartment good for remote work?", "Yes — fast Wi-Fi and a comfortable workspace make it ideal for digital nomads and longer stays."],
       ["How do I book directly?", "Use the Request to Book form or chat with us on WhatsApp — we'll confirm availability and pricing personally."]],
  es: [["¿Cuál es el horario de entrada / salida?", "La entrada es a partir de las 3:00 PM y la salida a las 11:00 AM. Horarios flexibles disponibles según disponibilidad."],
       ["¿Es adecuado para trabajar de forma remota?", "Sí — Wi-Fi rápido y un espacio de trabajo cómodo lo hacen ideal para nómadas digitales y estancias largas."],
       ["¿Cómo reservo directamente?", "Usa el formulario de Solicitud de Reserva o escríbenos por WhatsApp — confirmaremos disponibilidad y precios personalmente."]],
};

export default function PropertyDetail() {
  const { slug } = useParams();
  const { t, lang } = useLang();
  const nav = useNavigate();
  const [p, setP] = useState(null);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState(false);

  useEffect(() => { getProperty(slug).then(setP).catch(() => nav("/stays")); }, [slug, nav]);
  if (!p) return <div className="h-screen flex items-center justify-center font-serif text-2xl text-coffee">Loading…</div>;

  const imgs = p.images?.length ? p.images : [];
  const move = (d) => setActive((a) => (a + d + imgs.length) % imgs.length);

  return (
    <main data-testid="property-detail" className="bg-ivory pt-28 md:pt-32">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <Link to="/stays" className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-coffee/70 hover:text-coral transition-colors mb-8"><ArrowLeft size={15}/> {t.common.back}</Link>

        {/* Gallery */}
        <div className="grid md:grid-cols-4 gap-3 mb-12">
          <button data-testid="gallery-image-0" onClick={() => { setActive(0); setLightbox(true); }} className="md:col-span-2 md:row-span-2 overflow-hidden rounded-xl aspect-[4/3] md:aspect-auto group">
            <img src={imgs[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </button>
          {imgs.slice(1, 5).map((im, i) => (
            <button key={i} data-testid={`gallery-image-${i + 1}`} onClick={() => { setActive(i + 1); setLightbox(true); }} className="overflow-hidden rounded-xl aspect-[4/3] group hidden md:block">
              <img src={im} alt={`${p.name} ${i + 2}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-12 lg:gap-16 pb-24">
          {/* Left */}
          <div className="md:col-span-2">
            <span className="overline text-coral">{p.tagline}</span>
            <h1 className="font-serif text-4xl md:text-6xl text-coffee font-light mt-3 leading-[1.02]">{p.name}</h1>
            <p className="flex items-center gap-2 text-charcoal/60 mt-4 text-sm"><MapPin size={15} className="text-coral" /> {p.location}</p>
            <p className="font-serif italic text-2xl md:text-3xl text-coffee/80 mt-8 leading-snug">{p.short_desc}</p>

            <div className="flex flex-wrap gap-8 mt-10 py-8 border-y border-sand">
              <div className="flex items-center gap-3"><Users className="text-coral" size={22} strokeWidth={1.4}/><div><div className="font-serif text-2xl text-coffee">{p.guests}</div><div className="overline text-charcoal/50">{t.prop.from}</div></div></div>
              <div className="flex items-center gap-3"><BedDouble className="text-coral" size={22} strokeWidth={1.4}/><div><div className="font-serif text-2xl text-coffee">{p.bedrooms}</div><div className="overline text-charcoal/50">{t.prop.bedrooms}</div></div></div>
              <div className="flex items-center gap-3"><Bath className="text-coral" size={22} strokeWidth={1.4}/><div><div className="font-serif text-2xl text-coffee">{p.bathrooms}</div><div className="overline text-charcoal/50">{t.prop.bathrooms}</div></div></div>
            </div>

            <h2 className="font-serif text-3xl text-coffee mt-12 mb-4">{t.prop.desc}</h2>
            <p className="text-charcoal/75 leading-relaxed whitespace-pre-line">{p.description}</p>

            <h2 className="font-serif text-3xl text-coffee mt-12 mb-6">{t.prop.amenities}</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              {p.amenities.map((a) => <div key={a} className="flex items-center gap-3 text-charcoal/80 text-sm"><Check size={16} className="text-coral shrink-0" /> {a}</div>)}
            </div>

            <h2 className="font-serif text-3xl text-coffee mt-12 mb-4">{t.prop.sleeping}</h2>
            <p className="text-charcoal/75">{p.guests >= 8 ? t.prop.bed8 : t.prop.bed}</p>

            <h2 className="font-serif text-3xl text-coffee mt-12 mb-6">{t.prop.location}</h2>
            <div className="overflow-hidden rounded-xl aspect-[16/9] border border-sand">
              <iframe title="map" width="100%" height="100%" style={{ border: 0 }} loading="lazy"
                src={`https://maps.google.com/maps?q=${p.lat},${p.lng}&z=15&output=embed`} />
            </div>

            <h2 className="font-serif text-3xl text-coffee mt-12 mb-6">{t.prop.faq}</h2>
            <div className="divide-y divide-sand border-y border-sand">
              {AMEN_FAQ[lang].map(([q, a], i) => <FAQ key={i} q={q} a={a} />)}
            </div>

            <PropertyReviews slug={p.slug} />
          </div>

          {/* Booking widget */}
          <div className="md:col-span-1" id="booking-widget">
            <BookingWidget p={p} />
          </div>
        </div>
      </div>

      {/* Already on Airbnb */}
      {p.airbnb_url && (
        <section className="bg-white border-t border-sand">
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 text-center">
            <h2 className="font-serif text-3xl md:text-4xl text-coffee">{t.bk.alreadyTitle}</h2>
            <p className="text-charcoal/60 mt-3">{t.bk.alreadyBody}</p>
            <a href={p.airbnb_url} target="_blank" rel="noreferrer" data-testid="airbnb-listing-link"
              className="inline-flex items-center gap-2 mt-6 text-xs tracking-widest uppercase text-coffee border-b border-coral pb-1 hover:text-coral transition-colors">
              → {t.bk.alreadyCta}
            </a>
          </div>
        </section>
      )}

      {/* Sticky mobile CTA */}
      <div className="md:hidden fixed bottom-0 left-0 w-full z-30 bg-white/95 backdrop-blur border-t border-sand p-4">
        <button data-testid="mobile-book-cta" onClick={() => document.getElementById("booking-widget")?.scrollIntoView({ behavior: "smooth" })} className="w-full rounded-full bg-coral text-white py-4 text-xs tracking-widest uppercase">{t.prop.book}</button>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div data-testid="lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-coffee/95 flex items-center justify-center" onClick={() => { setLightbox(false); setZoom(false); }}>
            <button data-testid="lightbox-close" className="absolute top-6 right-6 text-ivory z-10" onClick={() => { setLightbox(false); setZoom(false); }}><X size={30} /></button>
            <button data-testid="lightbox-zoom" className="absolute top-6 right-20 text-ivory z-10" onClick={(e) => { e.stopPropagation(); setZoom((z) => !z); }}>{zoom ? <ZoomOut size={26} /> : <ZoomIn size={26} />}</button>
            <button data-testid="lightbox-prev" className="absolute left-4 md:left-10 text-ivory z-10" onClick={(e) => { e.stopPropagation(); setZoom(false); move(-1); }}><ChevronLeft size={40} /></button>
            <div className={`${zoom ? "overflow-auto cursor-zoom-out" : "cursor-zoom-in"} max-h-[88vh] max-w-[92vw]`} onClick={(e) => { e.stopPropagation(); setZoom((z) => !z); }}>
              <img src={imgs[active]} alt={p.name} className={`rounded-lg transition-transform duration-300 ${zoom ? "max-w-none w-[170vw] md:w-[130vw]" : "max-h-[85vh] max-w-[90vw] object-contain"}`} />
            </div>
            <button data-testid="lightbox-next" className="absolute right-4 md:right-10 text-ivory z-10" onClick={(e) => { e.stopPropagation(); setZoom(false); move(1); }}><ChevronRight size={40} /></button>
            <span data-testid="lightbox-counter" className="absolute bottom-6 left-1/2 -translate-x-1/2 text-ivory/80 text-xs tracking-widest">{active + 1} / {imgs.length}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

const Field = ({ label, children }) => (
  <div className="border border-sand rounded-lg px-4 py-2.5">
    <div className="overline text-charcoal/40 text-[0.6rem] mb-1">{label}</div>
    {children}
  </div>
);

const FAQ = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="py-5">
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center text-left gap-4">
        <span className="font-serif text-xl text-coffee">{q}</span>
        <span className="text-coral text-2xl">{open ? "−" : "+"}</span>
      </button>
      <AnimatePresence>{open && <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="text-charcoal/70 text-sm leading-relaxed overflow-hidden mt-2">{a}</motion.p>}</AnimatePresence>
    </div>
  );
};
