import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Instagram, MessageCircle, Mail } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "../i18n";
import { Reveal } from "../lib/motion";
import { submitInquiry } from "../lib/api";
import { SITE, waLink } from "../config";

export default function Contact() {
  const { t } = useLang();
  const [params] = useSearchParams();
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", checkin: "", checkout: "", guests: "",
    property_name: params.get("property") || "", message: "",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await submitInquiry(form);
      toast.success(t.contact.success);
      setForm({ name: "", email: "", phone: "", checkin: "", checkout: "", guests: "", property_name: "", message: "" });
    } catch {
      toast.error(t.contact.error);
    } finally { setSending(false); }
  };

  const input = "w-full bg-transparent border-b border-sand focus:border-coral outline-none py-3 text-coffee placeholder:text-charcoal/40 transition-colors";

  return (
    <main data-testid="contact-page" className="bg-ivory pt-32 md:pt-40 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-16">
        <div>
          <Reveal><span className="overline text-coral">{t.nav.contact}</span></Reveal>
          <Reveal delay={0.1}><h1 className="font-serif text-5xl md:text-7xl text-coffee font-light mt-4 leading-[1.0]">{t.contact.title}</h1></Reveal>
          <Reveal delay={0.2}><p className="text-charcoal/70 mt-6 md:text-lg max-w-md">{t.contact.sub}</p></Reveal>
          <Reveal delay={0.3} className="mt-12 space-y-5">
            <a href={waLink()} target="_blank" rel="noreferrer" data-testid="contact-whatsapp" className="flex items-center gap-4 text-coffee hover:text-coral transition-colors"><MessageCircle className="text-coral" size={22}/><span>{SITE.whatsappDisplay}</span></a>
            <a href={`mailto:${SITE.email}`} data-testid="contact-email" className="flex items-center gap-4 text-coffee hover:text-coral transition-colors"><Mail className="text-coral" size={22}/><span>{SITE.email}</span></a>
            <a href={SITE.instagram} target="_blank" rel="noreferrer" data-testid="contact-instagram" className="flex items-center gap-4 text-coffee hover:text-coral transition-colors"><Instagram className="text-coral" size={22}/><span>@staycoralcollection</span></a>
          </Reveal>
          <Reveal delay={0.35}><p className="overline text-charcoal/50 mt-12">{SITE.location}</p></Reveal>
        </div>

        <Reveal delay={0.2}>
          <form data-testid="contact-form" onSubmit={submit} className="bg-white rounded-2xl p-8 md:p-10 shadow-[0_20px_60px_-30px_rgba(58,44,37,0.35)]">
            <div className="grid gap-6">
              <input data-testid="input-name" required placeholder={t.contact.name} value={form.name} onChange={set("name")} className={input} />
              <input data-testid="input-email" required type="email" placeholder={t.contact.email} value={form.email} onChange={set("email")} className={input} />
              <input data-testid="input-phone" placeholder={t.contact.phone} value={form.phone} onChange={set("phone")} className={input} />
              <div className="grid grid-cols-2 gap-6">
                <div><label className="overline text-charcoal/40 text-[0.6rem]">{t.contact.checkin}</label><input data-testid="input-checkin" type="date" value={form.checkin} onChange={set("checkin")} className={input} /></div>
                <div><label className="overline text-charcoal/40 text-[0.6rem]">{t.contact.checkout}</label><input data-testid="input-checkout" type="date" value={form.checkout} onChange={set("checkout")} className={input} /></div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <input data-testid="input-guests" placeholder={t.contact.guests} value={form.guests} onChange={set("guests")} className={input} />
                <input data-testid="input-property" placeholder={t.contact.property} value={form.property_name} onChange={set("property_name")} className={input} />
              </div>
              <textarea data-testid="input-message" rows={3} placeholder={t.contact.message} value={form.message} onChange={set("message")} className={`${input} resize-none`} />
            </div>
            <button data-testid="contact-submit" disabled={sending} className="w-full mt-8 rounded-full bg-coral text-white py-4 text-xs tracking-widest uppercase hover:bg-coral-dark transition-all disabled:opacity-60">
              {sending ? t.contact.sending : t.contact.send}
            </button>
            <a href={waLink()} target="_blank" rel="noreferrer" className="block text-center mt-4 text-xs tracking-widest uppercase text-coffee/60 hover:text-coral transition-colors">{t.contact.wa}</a>
          </form>
        </Reveal>
      </div>
    </main>
  );
}
