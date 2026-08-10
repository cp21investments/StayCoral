import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ChevronDown, Star, ArrowRight, MapPin, Compass, Sparkles, HeartHandshake } from "lucide-react";
import { useLang } from "../i18n";
import { getProperties } from "../lib/api";
import { Reveal, RevealText, FadeIn } from "../lib/motion";
import PropertyCard from "../components/PropertyCard";

const IMG = {
  hero: "https://images.unsplash.com/photo-1535528775514-4b2e1ce44dda?crop=entropy&cs=srgb&fm=jpg&q=90&w=2200",
  intro: "https://images.unsplash.com/photo-1643376452350-97eadd2c417f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
  feature: "https://images.unsplash.com/photo-1715503485452-89d50b42ff5d?crop=entropy&cs=srgb&fm=jpg&q=90&w=2200",
  final: "https://images.unsplash.com/photo-1633627397446-04c7fca71c74?crop=entropy&cs=srgb&fm=jpg&q=90&w=2200",
  cartagena: [
    "https://images.unsplash.com/photo-1777227953225-26fec3f73d34?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000",
    "https://images.unsplash.com/photo-1561165804-9a48a4ad1f47?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000",
    "https://images.unsplash.com/photo-1780403267633-78f6a590c158?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000",
    "https://images.unsplash.com/photo-1601325382888-155b67b7b82f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000",
  ],
};

const REVIEWS = [
  { q: "An incredible location and such a beautiful apartment. Cartagena was right outside our door.", n: "Sarah", c: "United States" },
  { q: "The view of the sea and the walls at sunset was unforgettable. We'll be back.", n: "Thomas", c: "Germany" },
  { q: "Comfortable, spotless and perfectly located. Exactly what we needed in Manga.", n: "Camille", c: "France" },
];

const useProps = () => {
  const [data, setData] = useState([]);
  useEffect(() => { getProperties().then(setData).catch(() => {}); }, []);
  return data;
};

/* ---------------- Hero ---------------- */
const Hero = () => {
  const { t } = useLang();
  const nav = useNavigate();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.12, 1.25]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} data-testid="hero" className="relative h-screen w-full overflow-hidden bg-coffee">
      <motion.div style={{ scale, y }} className="absolute inset-0">
        <img src={IMG.hero} alt="Cartagena's Historic Center and Torre del Reloj at golden hour" className="w-full h-full object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-coffee/50 via-coffee/25 to-coffee/70" />

      <motion.div style={{ opacity }} className="relative z-10 h-full max-w-7xl mx-auto px-6 md:px-10 flex flex-col justify-center">
        <FadeIn delay={0.2}><span className="overline text-ivory/80">{t.hero.brand}</span></FadeIn>
        <h1 className="mt-5 font-serif text-ivory text-[3.2rem] leading-[1.02] md:text-8xl md:leading-[0.95] max-w-5xl font-light">
          <RevealText lines={t.hero.title.split(" ").reduce((acc, w, i) => {
            const li = Math.floor(i / 3); acc[li] = (acc[li] ? acc[li] + " " : "") + w; return acc;
          }, [])} startDelay={0.35} stagger={0.14} />
        </h1>
        <FadeIn delay={1.1}><p className="mt-7 text-ivory/85 text-lg md:text-2xl font-light max-w-xl">{t.hero.sub}</p></FadeIn>
        <FadeIn delay={1.35}>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/stays" data-testid="hero-explore" className="rounded-full bg-ivory text-coffee px-8 py-4 text-xs tracking-widest uppercase hover:bg-coral hover:text-white transition-all duration-300 hover:-translate-y-0.5">{t.hero.cta1}</Link>
            <button onClick={() => nav("/contact")} data-testid="hero-book" className="rounded-full border border-ivory/60 text-ivory px-8 py-4 text-xs tracking-widest uppercase hover:bg-ivory hover:text-coffee transition-all duration-300">{t.hero.cta2}</button>
          </div>
        </FadeIn>
      </motion.div>

      <div className="absolute bottom-8 left-0 w-full z-10 px-6 md:px-10 max-w-7xl mx-auto flex justify-between items-end">
        <FadeIn delay={1.6}><span className="overline text-ivory/70">{t.hero.loc}</span></FadeIn>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="flex flex-col items-center text-ivory/70">
          <span className="overline mb-2 hidden md:block">{t.hero.scroll}</span>
          <ChevronDown size={20} />
        </motion.div>
      </div>
    </section>
  );
};

/* ---------------- Brand intro ---------------- */
const Intro = () => {
  const { t } = useLang();
  return (
    <section data-testid="section-intro" className="bg-ivory py-24 md:py-40">
      <div className="max-w-7xl mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-14 md:gap-24 items-center">
        <div>
          <Reveal><span className="overline text-coral">{t.intro.overline}</span></Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-6 font-serif text-4xl md:text-6xl text-coffee leading-[1.05] font-light">
              {t.intro.h1}<br /><span className="italic text-coral">{t.intro.h2}</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}><p className="mt-8 text-charcoal/75 leading-relaxed md:text-lg max-w-lg">{t.intro.body}</p></Reveal>
          <Reveal delay={0.3}>
            <Link to="/stays" className="inline-flex items-center gap-2 mt-9 text-xs tracking-widest uppercase text-coffee border-b border-coral pb-1 hover:text-coral transition-colors">
              {t.intro.cta} <ArrowRight size={15} />
            </Link>
          </Reveal>
        </div>
        <Reveal delay={0.15} className="relative">
          <div className="overflow-hidden rounded-2xl aspect-[4/5]">
            <img src={IMG.intro} alt="Elegant boutique interior in Cartagena" loading="lazy" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-coffee text-ivory px-7 py-5 rounded-xl hidden md:block">
            <div className="font-serif text-3xl">05</div>
            <div className="overline text-ivory/60 mt-1">Curated stays</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ---------------- Marquee ---------------- */
const Marquee = () => {
  const words = "Curated Stays · Historic Center · Torre del Reloj · Caribbean Views · Manga · Boutique Living · ";
  return (
    <div className="bg-coffee py-6 overflow-hidden select-none" aria-hidden>
      <div className="flex whitespace-nowrap animate-marquee">
        {[0, 1].map((k) => (
          <span key={k} className="font-serif italic text-ivory/90 text-4xl md:text-6xl pr-6">{words.repeat(2)}</span>
        ))}
      </div>
    </div>
  );
};

/* ---------------- Collection ---------------- */
const Collection = ({ properties }) => {
  const { t } = useLang();
  const [tab, setTab] = useState("historic");
  const list = properties.filter((p) => p.category === tab);
  const cat = tab === "historic" ? t.collection : t.collection;
  return (
    <section data-testid="section-collection" className="bg-ivory py-24 md:py-36">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
          <div>
            <Reveal><span className="overline text-coral">{t.collection.overline}</span></Reveal>
            <Reveal delay={0.1}><h2 className="mt-5 font-serif text-4xl md:text-6xl text-coffee font-light max-w-xl leading-[1.05]">{t.collection.title}</h2></Reveal>
          </div>
          <Reveal delay={0.15}>
            <div className="flex gap-2 bg-sand/40 rounded-full p-1.5">
              <button data-testid="tab-historic" onClick={() => setTab("historic")} className={`px-6 py-2.5 rounded-full text-xs tracking-widest uppercase transition-all ${tab === "historic" ? "bg-coffee text-ivory" : "text-coffee/70 hover:text-coffee"}`}>{t.collection.iconic}</button>
              <button data-testid="tab-manga" onClick={() => setTab("manga")} className={`px-6 py-2.5 rounded-full text-xs tracking-widest uppercase transition-all ${tab === "manga" ? "bg-coffee text-ivory" : "text-coffee/70 hover:text-coffee"}`}>{t.collection.local}</button>
            </div>
          </Reveal>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5 }}>
            <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-3xl">
              <div>
                <h3 className="font-serif text-3xl md:text-4xl text-coffee italic font-light">{tab === "historic" ? t.collection.iconicHead : t.collection.localHead}</h3>
              </div>
              <div>
                <p className="text-charcoal/75 leading-relaxed">{tab === "historic" ? t.collection.iconicDesc : t.collection.localDesc}</p>
                <span className="overline text-coral mt-4 inline-block">{tab === "historic" ? t.collection.iconicTag : t.collection.localTag}</span>
              </div>
            </div>
            <div className={`grid gap-8 md:gap-10 ${list.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2 max-w-4xl"}`}>
              {list.map((p, i) => <PropertyCard key={p.slug} property={p} index={i} />)}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

/* ---------------- Premium feature (parallax) ---------------- */
const Feature = ({ property }) => {
  const { t } = useLang();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.15, 1.05]);
  return (
    <section ref={ref} data-testid="section-feature" className="relative h-[85vh] overflow-hidden flex items-center bg-coffee">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <img src={IMG.feature} alt="Torre del Reloj street in Cartagena's Walled City" loading="lazy" className="w-full h-full object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-coffee/80 via-coffee/40 to-transparent" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 w-full">
        <Reveal className="max-w-xl">
          <span className="overline text-ivory/70">{t.collection.iconicTag}</span>
          <h2 className="mt-5 font-serif text-ivory text-4xl md:text-6xl leading-[1.05] font-light">{t.feature.h}</h2>
          <p className="mt-6 text-ivory/85 leading-relaxed md:text-lg">{t.feature.body}</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link to={property ? `/stays/${property.slug}` : "/stays"} className="rounded-full bg-ivory text-coffee px-8 py-4 text-xs tracking-widest uppercase hover:bg-coral hover:text-white transition-all">{t.feature.cta1}</Link>
            <Link to="/contact" className="rounded-full border border-ivory/60 text-ivory px-8 py-4 text-xs tracking-widest uppercase hover:bg-ivory hover:text-coffee transition-all">{t.feature.cta2}</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ---------------- Why ---------------- */
const Why = () => {
  const { t } = useLang();
  const icons = [MapPin, Sparkles, HeartHandshake, Compass];
  return (
    <section data-testid="section-why" className="bg-sand/40 py-24 md:py-36">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <Reveal><h2 className="font-serif text-4xl md:text-6xl text-coffee font-light mb-16 max-w-lg leading-[1.05]">{t.why.title}</h2></Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-y-14 gap-x-10">
          {t.why.items.map(([title, body], i) => {
            const Icon = icons[i];
            return (
              <Reveal key={i} delay={i * 0.1}>
                <span className="font-serif text-5xl text-coral/40">0{i + 1}</span>
                <Icon className="text-coral mt-4" size={26} strokeWidth={1.4} />
                <h4 className="font-serif text-2xl text-coffee mt-5">{title}</h4>
                <p className="text-charcoal/70 text-sm leading-relaxed mt-3">{body}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ---------------- Cartagena editorial ---------------- */
const Cartagena = () => {
  const { t } = useLang();
  return (
    <section data-testid="section-cartagena" className="bg-ivory py-24 md:py-36">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="max-w-2xl mb-16">
          <Reveal><span className="overline text-coral">{t.cartagena.overline}</span></Reveal>
          <Reveal delay={0.1}><h2 className="mt-5 font-serif text-4xl md:text-6xl text-coffee font-light leading-[1.05]">{t.cartagena.title}</h2></Reveal>
          <Reveal delay={0.2}><p className="mt-5 text-charcoal/70 md:text-lg">{t.cartagena.sub}</p></Reveal>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {t.cartagena.items.map(([title, body], i) => (
            <Reveal key={i} delay={i * 0.08} className={`group ${i % 2 === 1 ? "lg:mt-16" : ""}`}>
              <Link to="/cartagena" className="block">
                <div className="overflow-hidden rounded-xl aspect-[3/4]">
                  <img src={IMG.cartagena[i]} alt={title} loading="lazy" className="w-full h-full object-cover transition-transform duration-[900ms] group-hover:scale-105" />
                </div>
                <h4 className="font-serif text-xl md:text-2xl text-coffee mt-4">{title}</h4>
                <p className="text-charcoal/65 text-sm leading-relaxed mt-2">{body}</p>
              </Link>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <Link to="/cartagena" className="inline-flex items-center gap-2 mt-14 text-xs tracking-widest uppercase text-coffee border-b border-coral pb-1 hover:text-coral transition-colors">{t.cartagena.cta} <ArrowRight size={15} /></Link>
        </Reveal>
      </div>
    </section>
  );
};

/* ---------------- Reviews ---------------- */
const Reviews = () => {
  const { t } = useLang();
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((p) => (p + 1) % REVIEWS.length), 6000); return () => clearInterval(id); }, []);
  const r = REVIEWS[i];
  return (
    <section data-testid="section-reviews" className="bg-coffee text-ivory py-24 md:py-40">
      <div className="max-w-4xl mx-auto px-6 md:px-10 text-center">
        <span className="overline text-coral">{t.reviews.title}</span>
        <div className="flex justify-center gap-1 mt-8 text-coral">{[...Array(5)].map((_, k) => <Star key={k} size={16} fill="currentColor" />)}</div>
        <AnimatePresence mode="wait">
          <motion.blockquote key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6 }} className="mt-8">
            <p className="font-serif italic text-3xl md:text-5xl leading-[1.15] font-light">“{r.q}”</p>
            <footer className="mt-8 overline text-ivory/60">{r.n} · {r.c}</footer>
          </motion.blockquote>
        </AnimatePresence>
        <div className="flex justify-center gap-2 mt-10">
          {REVIEWS.map((_, k) => <button key={k} onClick={() => setI(k)} className={`h-1.5 rounded-full transition-all ${k === i ? "w-8 bg-coral" : "w-2 bg-ivory/30"}`} />)}
        </div>
        <p className="text-ivory/30 text-[0.7rem] tracking-wider mt-8 italic">{t.reviews.placeholder}</p>
        <a href="https://www.airbnb.com/rooms/1714620022302650838" target="_blank" rel="noreferrer" className="inline-block mt-6 text-xs tracking-widest uppercase border-b border-coral pb-1 hover:text-coral transition-colors">{t.reviews.more}</a>
      </div>
    </section>
  );
};

/* ---------------- Booking band ---------------- */
const BookingBand = () => {
  const { t } = useLang();
  return (
    <section data-testid="section-booking" className="bg-sand py-24 md:py-32">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <Reveal><h2 className="font-serif text-4xl md:text-6xl text-coffee font-light leading-[1.05]">{t.booking.title}</h2></Reveal>
        <Reveal delay={0.1}><p className="mt-6 text-charcoal/75 md:text-lg max-w-xl mx-auto">{t.booking.body}</p></Reveal>
        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link to="/contact" className="rounded-full bg-coral text-white px-9 py-4 text-xs tracking-widest uppercase hover:bg-coral-dark transition-all hover:-translate-y-0.5">{t.booking.cta1}</Link>
            <Link to="/stays" className="rounded-full border border-coffee/40 text-coffee px-9 py-4 text-xs tracking-widest uppercase hover:bg-coffee hover:text-ivory transition-all">{t.booking.cta2}</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ---------------- Journal ---------------- */
const Journal = () => {
  const { t } = useLang();
  const imgs = [IMG.cartagena[0], IMG.cartagena[1], IMG.cartagena[3]];
  return (
    <section data-testid="section-journal" className="bg-ivory py-24 md:py-36">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex items-end justify-between mb-14">
          <div>
            <Reveal><span className="overline text-coral">{t.journal.overline}</span></Reveal>
            <Reveal delay={0.1}><h2 className="mt-5 font-serif text-4xl md:text-6xl text-coffee font-light">{t.journal.title}</h2></Reveal>
          </div>
          <Reveal delay={0.15}><Link to="/journal" className="hidden md:inline-flex items-center gap-2 text-xs tracking-widest uppercase text-coffee border-b border-coral pb-1 hover:text-coral transition-colors">{t.journal.cta} <ArrowRight size={15} /></Link></Reveal>
        </div>
        <div className="grid md:grid-cols-3 gap-10">
          {t.journal.articles.slice(0, 3).map((a, i) => (
            <Reveal key={i} delay={i * 0.1} className="group">
              <Link to="/journal">
                <div className="overflow-hidden rounded-xl aspect-[3/2]">
                  <img src={imgs[i]} alt={a} loading="lazy" className="w-full h-full object-cover transition-transform duration-[900ms] group-hover:scale-105" />
                </div>
                <span className="overline text-coral mt-5 inline-block">{t.journal.soon}</span>
                <h3 className="font-serif text-2xl text-coffee mt-2 group-hover:text-coral transition-colors">{a}</h3>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ---------------- Final CTA ---------------- */
const FinalCTA = () => {
  const { t } = useLang();
  return (
    <section data-testid="section-final" className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-coffee">
      <img src={IMG.final} alt="Torre del Reloj illuminated at night" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-coffee/60" />
      <Reveal className="relative z-10 text-center px-6 max-w-2xl">
        <h2 className="font-serif text-ivory text-5xl md:text-7xl font-light leading-[1.02]">{t.final.h}</h2>
        <p className="mt-6 text-ivory/85 md:text-lg">{t.final.body}</p>
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link to="/contact" className="rounded-full bg-coral text-white px-9 py-4 text-xs tracking-widest uppercase hover:bg-coral-dark transition-all hover:-translate-y-0.5">{t.final.cta1}</Link>
          <Link to="/stays" className="rounded-full border border-ivory/60 text-ivory px-9 py-4 text-xs tracking-widest uppercase hover:bg-ivory hover:text-coffee transition-all">{t.final.cta2}</Link>
        </div>
      </Reveal>
    </section>
  );
};

export default function Home() {
  const properties = useProps();
  const featured = properties.find((p) => p.featured) || properties[0];
  return (
    <main data-testid="home-page">
      <Hero />
      <Intro />
      <Marquee />
      <Collection properties={properties} />
      <Feature property={featured} />
      <Why />
      <Cartagena />
      <Reviews />
      <BookingBand />
      <Journal />
      <FinalCTA />
    </main>
  );
}
