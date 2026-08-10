import React from "react";
import { Link } from "react-router-dom";
import { useLang } from "../i18n";
import { Reveal } from "../lib/motion";

const IMGS = [
  "https://images.unsplash.com/photo-1777227953225-26fec3f73d34?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
  "https://images.unsplash.com/photo-1561165804-9a48a4ad1f47?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
  "https://images.unsplash.com/photo-1780403267633-78f6a590c158?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
  "https://images.unsplash.com/photo-1601325382888-155b67b7b82f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
];

export default function Cartagena() {
  const { t } = useLang();
  return (
    <main data-testid="cartagena-page" className="bg-ivory pt-32 md:pt-40 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <Reveal><span className="overline text-coral">{t.cartagena.overline}</span></Reveal>
        <Reveal delay={0.1}><h1 className="font-serif text-5xl md:text-8xl text-coffee font-light mt-4 leading-[0.98]">{t.cartagena.title}</h1></Reveal>
        <Reveal delay={0.2}><p className="text-charcoal/70 mt-6 max-w-2xl md:text-xl">{t.cartagena.sub}</p></Reveal>

        <div className="mt-20 space-y-24 md:space-y-32">
          {t.cartagena.items.map(([title, body], i) => (
            <Reveal key={i} className={`grid md:grid-cols-2 gap-10 md:gap-20 items-center ${i % 2 ? "md:[direction:rtl]" : ""}`}>
              <div className="overflow-hidden rounded-2xl aspect-[4/3] group [direction:ltr]">
                <img src={IMGS[i]} alt={title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[900ms]" />
              </div>
              <div className="[direction:ltr]">
                <span className="font-serif text-6xl text-coral/30">0{i + 1}</span>
                <h2 className="font-serif text-4xl md:text-5xl text-coffee mt-4 font-light">{title}</h2>
                <p className="text-charcoal/75 mt-5 leading-relaxed md:text-lg max-w-md">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-24 text-center">
          <Link to="/stays" className="rounded-full bg-coral text-white px-9 py-4 text-xs tracking-widest uppercase hover:bg-coral-dark transition-all inline-block">{t.common.viewAll}</Link>
        </Reveal>
      </div>
    </main>
  );
}
