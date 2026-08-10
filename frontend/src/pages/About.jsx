import React from "react";
import { Link } from "react-router-dom";
import { useLang } from "../i18n";
import { Reveal } from "../lib/motion";

export default function About() {
  const { t } = useLang();
  return (
    <main data-testid="about-page" className="bg-ivory pt-32 md:pt-40 pb-24">
      <div className="max-w-5xl mx-auto px-6 md:px-10">
        <Reveal><span className="overline text-coral">{t.nav.story}</span></Reveal>
        <Reveal delay={0.1}><h1 className="font-serif text-5xl md:text-8xl text-coffee font-light mt-4 leading-[0.98]">{t.story.title}</h1></Reveal>
        <div className="grid md:grid-cols-5 gap-12 mt-16 items-start">
          <Reveal delay={0.15} className="md:col-span-2">
            <div className="overflow-hidden rounded-2xl aspect-[3/4]">
              <img src="https://images.unsplash.com/photo-1643376452350-97eadd2c417f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000" alt="Stay Coral interior" loading="lazy" className="w-full h-full object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.2} className="md:col-span-3">
            <p className="text-charcoal/80 leading-[1.9] md:text-xl whitespace-pre-line font-light">{t.story.body}</p>
            <Link to="/stays" className="inline-flex mt-10 rounded-full bg-coffee text-ivory px-9 py-4 text-xs tracking-widest uppercase hover:bg-coral transition-all">{t.story.cta}</Link>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
