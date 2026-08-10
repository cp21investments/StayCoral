import { useEffect } from "react";
import Lenis from "lenis";
import { useLocation } from "react-router-dom";

export default function SmoothScroll({ children }) {
  const { pathname } = useLocation();

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true, lerp: 0.09 });
    let raf;
    const loop = (time) => { lenis.raf(time); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    window.__lenis = lenis;
    return () => { cancelAnimationFrame(raf); lenis.destroy(); window.__lenis = null; };
  }, []);

  useEffect(() => {
    window.__lenis?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
  }, [pathname]);

  return children;
}
