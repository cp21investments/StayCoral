import React from "react";
import { useLang } from "../i18n";
import { Reveal } from "../lib/motion";

export default function Journal() {
  const { t } = useLang();
  const imgs = [
    "https://images.unsplash.com/photo-1777227953225-26fec3f73d34?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000",
    "https://images.unsplash.com/photo-1561165804-9a48a4ad1f47?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000",
    "https://images.unsplash.com/photo-1780403267633-78f6a590c158?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000",
    "https://images.unsplash.com/photo-1601325382888-155b67b7b82f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000",
    "https://images.unsplash.com/photo-1535528775514-4b2e1ce44dda?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000",
    "https://images.unsplash.com/photo-1715503485452-89d50b42ff5d?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000",
  ];
  return (
    <main data-testid="journal-page" className="bg-ivory pt-32 md:pt-40 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <Reveal><span className="overline text-coral">{t.journal.overline}</span></Reveal>
        <Reveal delay={0.1}><h1 className="font-serif text-5xl md:text-8xl text-coffee font-light mt-4 leading-[0.98]">{t.journal.title}</h1></Reveal>
        <div className="grid md:grid-cols-3 gap-x-10 gap-y-16 mt-16">
          {t.journal.articles.map((a, i) => (
            <Reveal key={i} delay={(i % 3) * 0.1} className="group cursor-pointer">
              <div className="overflow-hidden rounded-xl aspect-[3/2]">
                <img src={imgs[i % imgs.length]} alt={a} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[900ms]" />
              </div>
              <span className="overline text-coral mt-5 inline-block">{t.journal.soon}</span>
              <h2 className="font-serif text-2xl md:text-3xl text-coffee mt-2 group-hover:text-coral transition-colors leading-snug">{a}</h2>
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  );
}
