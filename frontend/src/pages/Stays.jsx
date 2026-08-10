import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLang } from "../i18n";
import { getProperties } from "../lib/api";
import { Reveal } from "../lib/motion";
import PropertyCard from "../components/PropertyCard";

export default function Stays() {
  const { t } = useLang();
  const [params, setParams] = useSearchParams();
  const cat = params.get("c") || "all";
  const [all, setAll] = useState([]);
  useEffect(() => { getProperties().then(setAll).catch(() => {}); }, []);
  const list = cat === "all" ? all : all.filter((p) => p.category === cat);

  const tabs = [["all", t.common.viewAll], ["historic", t.footer.historic], ["manga", t.footer.manga]];

  return (
    <main data-testid="stays-page" className="bg-ivory pt-32 md:pt-40 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <Reveal><span className="overline text-coral">{t.collection.overline}</span></Reveal>
        <Reveal delay={0.1}><h1 className="font-serif text-5xl md:text-7xl text-coffee font-light mt-4 leading-[1.02]">{t.collection.title}</h1></Reveal>
        <Reveal delay={0.2}><p className="text-charcoal/70 mt-5 max-w-xl md:text-lg">{t.collection.sub}</p></Reveal>

        <div className="flex gap-2 bg-sand/40 rounded-full p-1.5 w-fit mt-10 mb-14">
          {tabs.map(([k, label]) => (
            <button key={k} data-testid={`stays-tab-${k}`} onClick={() => setParams(k === "all" ? {} : { c: k })}
              className={`px-6 py-2.5 rounded-full text-xs tracking-widest uppercase transition-all ${cat === k ? "bg-coffee text-ivory" : "text-coffee/70 hover:text-coffee"}`}>{label}</button>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {list.map((p, i) => <PropertyCard key={p.slug} property={p} index={i} />)}
        </div>
      </div>
    </main>
  );
}
