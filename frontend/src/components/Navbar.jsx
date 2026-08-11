import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "../i18n";

const Navbar = () => {
  const { t, lang, toggle } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();
  const onHome = loc.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { to: "/stays", label: t.nav.stays },
    { to: "/cartagena", label: t.nav.cartagena },
    { to: "/about", label: t.nav.story },
    { to: "/journal", label: t.nav.journal },
    { to: "/contact", label: t.nav.contact },
  ];

  const solid = scrolled || !onHome;
  const textCol = solid ? "text-coffee" : "text-ivory";

  return (
    <>
      <header
        data-testid="navbar"
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          solid ? "bg-ivory/85 backdrop-blur-xl border-b border-sand/50 py-4" : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-[1fr_auto_1fr] items-center">
          <nav className={`hidden lg:flex items-center gap-5 xl:gap-7 justify-self-start min-w-0 text-[0.72rem] tracking-widest uppercase ${textCol}`}>
            {links.map((l) => (
              <Link key={l.to} to={l.to} data-testid={`nav-${l.to.slice(1)}`} className="hover:text-coral transition-colors duration-300 whitespace-nowrap">
                {l.label}
              </Link>
            ))}
          </nav>

          <Link
            to="/"
            data-testid="nav-logo"
            className={`font-serif text-xl md:text-2xl tracking-[0.15em] uppercase justify-self-center whitespace-nowrap ${textCol}`}
          >
            Stay Coral
          </Link>

          <div className="flex items-center gap-4 md:gap-6 justify-self-end">
            <div className={`hidden sm:flex items-center gap-2 text-xs tracking-widest ${textCol}`}>
              <button data-testid="lang-en" onClick={() => toggle("en")} className={lang === "en" ? "text-coral font-medium" : "opacity-60 hover:opacity-100"}>EN</button>
              <span className="opacity-40">|</span>
              <button data-testid="lang-es" onClick={() => toggle("es")} className={lang === "es" ? "text-coral font-medium" : "opacity-60 hover:opacity-100"}>ES</button>
            </div>
            <button
              data-testid="nav-book-direct"
              onClick={() => nav("/contact")}
              className="hidden md:inline-flex items-center rounded-full bg-coral text-white px-6 py-2.5 text-[0.72rem] tracking-widest uppercase hover:bg-coral-dark transition-all duration-300 hover:-translate-y-0.5"
            >
              {t.nav.book}
            </button>
            <button data-testid="nav-menu-toggle" className={`lg:hidden ${textCol}`} onClick={() => setOpen(true)} aria-label="Menu">
              <Menu size={26} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            data-testid="mobile-menu"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[60] bg-coffee text-ivory flex flex-col px-8 py-8"
          >
            <div className="flex justify-between items-center mb-16">
              <span className="font-serif text-2xl tracking-widest uppercase">Stay Coral</span>
              <button data-testid="mobile-menu-close" onClick={() => setOpen(false)}><X size={28} /></button>
            </div>
            <nav className="flex flex-col gap-7 text-3xl font-serif">
              {links.map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="hover:text-coral transition-colors">{l.label}</Link>
              ))}
            </nav>
            <div className="mt-auto">
              <div className="flex gap-3 text-sm tracking-widest mb-6">
                <button onClick={() => toggle("en")} className={lang === "en" ? "text-coral" : "opacity-60"}>EN</button>
                <span className="opacity-40">|</span>
                <button onClick={() => toggle("es")} className={lang === "es" ? "text-coral" : "opacity-60"}>ES</button>
              </div>
              <button
                data-testid="mobile-book-direct"
                onClick={() => { setOpen(false); nav("/contact"); }}
                className="w-full rounded-full bg-coral text-white py-4 text-sm tracking-widest uppercase"
              >
                {t.nav.book}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
