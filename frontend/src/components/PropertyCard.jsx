import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Users } from "lucide-react";
import { Reveal } from "../lib/motion";
import { useLang } from "../i18n";

const PropertyCard = ({ property, index = 0 }) => {
  const { t } = useLang();
  const img = property.images?.[0];
  return (
    <Reveal delay={index * 0.08} className="group">
      <Link to={`/stays/${property.slug}`} data-testid={`property-card-${property.slug}`} className="block">
        <div className="relative overflow-hidden rounded-xl aspect-[4/5] bg-sand">
          {img && (
            <img
              src={img}
              alt={`${property.name} — ${property.location}`}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-coffee/60 via-transparent to-transparent" />
          <span className="absolute top-4 left-4 overline text-ivory bg-coffee/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
            {property.category === "historic" ? "Historic Center" : "Manga"}
          </span>
          <span className="absolute top-4 right-4 flex items-center gap-1.5 text-ivory text-xs bg-coffee/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <Users size={13} /> {property.guests}
          </span>
        </div>
        <div className="pt-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-serif text-2xl md:text-3xl text-coffee leading-tight">{property.name}</h3>
              <p className="overline text-coral mt-2">{property.location}</p>
              {property.price_night > 0 && (
                <p className="text-coffee text-sm mt-2 font-medium">
                  {new Intl.NumberFormat(property.currency === "COP" ? "es-CO" : "en-US", { style: "currency", currency: property.currency || "COP", currencyDisplay: "code", maximumFractionDigits: 0 }).format(property.price_night)}
                  <span className="text-charcoal/50 font-normal"> / {t.bk.night}</span>
                </p>
              )}
            </div>
            <ArrowUpRight className="text-coffee/40 group-hover:text-coral group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-300 shrink-0 mt-1" size={22} />
          </div>
          <p className="text-charcoal/70 text-sm leading-relaxed mt-3 line-clamp-2">{property.short_desc}</p>
          <span className="inline-flex items-center gap-2 mt-4 text-xs tracking-widest uppercase text-coffee group-hover:text-coral transition-colors">
            {t.collection.explore} →
          </span>
        </div>
      </Link>
    </Reveal>
  );
};

export default PropertyCard;
