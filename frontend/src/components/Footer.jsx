import React from "react";
import { Link } from "react-router-dom";
import { Instagram, MessageCircle, Mail } from "lucide-react";
import { useLang } from "../i18n";
import { SITE, waLink } from "../config";

const Footer = () => {
  const { t } = useLang();
  return (
    <footer data-testid="footer" className="bg-charcoal text-ivory">
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-24 pb-10">
        <div className="grid md:grid-cols-4 gap-12 md:gap-8">
          <div className="md:col-span-1">
            <div className="font-serif text-2xl tracking-[0.12em] uppercase mb-4">Stay Coral<br/>Collection</div>
            <p className="text-ivory/60 text-sm leading-relaxed max-w-xs">{t.footer.tagline}</p>
            <p className="text-coral text-xs tracking-widest uppercase mt-6">{SITE.location}</p>
          </div>

          <div>
            <h4 className="overline text-coral mb-5">{t.footer.explore}</h4>
            <ul className="space-y-3 text-sm text-ivory/75">
              <li><Link to="/stays" className="hover:text-coral transition-colors">{t.nav.stays}</Link></li>
              <li><Link to="/cartagena" className="hover:text-coral transition-colors">{t.nav.cartagena}</Link></li>
              <li><Link to="/about" className="hover:text-coral transition-colors">{t.nav.story}</Link></li>
              <li><Link to="/journal" className="hover:text-coral transition-colors">{t.nav.journal}</Link></li>
              <li><Link to="/contact" className="hover:text-coral transition-colors">{t.nav.contact}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="overline text-coral mb-5">{t.footer.stays}</h4>
            <ul className="space-y-3 text-sm text-ivory/75">
              <li><Link to="/stays?c=historic" className="hover:text-coral transition-colors">{t.footer.historic}</Link></li>
              <li><Link to="/stays?c=manga" className="hover:text-coral transition-colors">{t.footer.manga}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="overline text-coral mb-5">{t.footer.connect}</h4>
            <ul className="space-y-3 text-sm text-ivory/75">
              <li><a href={SITE.instagram} target="_blank" rel="noreferrer" data-testid="footer-instagram" className="inline-flex items-center gap-2 hover:text-coral transition-colors"><Instagram size={15}/> Instagram</a></li>
              <li><a href={waLink()} target="_blank" rel="noreferrer" data-testid="footer-whatsapp" className="inline-flex items-center gap-2 hover:text-coral transition-colors"><MessageCircle size={15}/> WhatsApp</a></li>
              <li><a href={`mailto:${SITE.email}`} data-testid="footer-email" className="inline-flex items-center gap-2 hover:text-coral transition-colors"><Mail size={15}/> Email</a></li>
            </ul>
            <Link to="/contact" data-testid="footer-book-direct" className="inline-flex mt-6 rounded-full bg-coral text-white px-6 py-2.5 text-[0.72rem] tracking-widest uppercase hover:bg-coral-dark transition-colors">{t.nav.book}</Link>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-ivory/10 flex flex-col md:flex-row justify-between gap-6 text-xs text-ivory/50">
          <div className="flex flex-wrap gap-6">
            <span className="hover:text-coral cursor-pointer transition-colors">{t.footer.privacy}</span>
            <span className="hover:text-coral cursor-pointer transition-colors">{t.footer.terms}</span>
            <span className="hover:text-coral cursor-pointer transition-colors">{t.footer.cancel}</span>
          </div>
          <span>© {new Date().getFullYear()} Stay Coral Collection. {t.footer.rights}</span>
        </div>
      </div>

      <div className="overflow-hidden border-t border-ivory/10 select-none" aria-hidden>
        <div className="font-serif text-[16vw] md:text-[13vw] leading-none text-ivory/[0.05] text-center py-2 whitespace-nowrap">
          STAY CORAL COLLECTION
        </div>
      </div>
    </footer>
  );
};

export default Footer;
