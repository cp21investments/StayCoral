import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useLang } from "../i18n";
import { api } from "../lib/api";

export const PropertyReviews = ({ slug }) => {
  const { t } = useLang();
  const [reviews, setReviews] = useState([]);
  useEffect(() => { api.get(`/properties/${slug}/reviews`).then((r) => setReviews(r.data)).catch(() => {}); }, [slug]);
  if (!reviews.length) return null;
  return (
    <div data-testid="property-reviews">
      <h2 className="font-serif text-3xl text-coffee mt-12 mb-6">{t.bk.reviewsTitle}</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {reviews.map((r) => (
          <div key={r.id} data-testid={`review-card-${r.id}`} className="bg-white rounded-xl p-6">
            <div className="flex items-center gap-1 text-coral">{[...Array(Math.min(r.rating || 5, 5))].map((_, k) => <Star key={k} size={12} fill="currentColor" />)}</div>
            <p className="text-charcoal/80 text-sm leading-relaxed mt-3 italic">"{r.text}"</p>
            <div className="mt-4 text-coffee font-serif text-lg">{r.name}</div>
            <div className="overline text-charcoal/50">{[r.country, r.month].filter(Boolean).join(" · ")}{(r.country || r.month) ? " · " : ""}{t.bk.source}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
