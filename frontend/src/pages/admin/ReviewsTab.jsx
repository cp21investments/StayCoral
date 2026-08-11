import React, { useEffect, useState } from "react";
import { Trash2, Pencil, Plus, X, Star } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";

const EMPTY = { property_slug: "", name: "", country: "", rating: 5, month: "", text: "" };

export default function ReviewsTab({ properties }) {
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState(null);
  const load = () => api.get("/admin/reviews").then((r) => setReviews(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      const { id, ...data } = form;
      data.rating = +data.rating;
      if (id) await api.put(`/admin/reviews/${id}`, data);
      else await api.post("/admin/reviews", data);
      toast.success("Guardado");
      setForm(null); load();
    } catch (er) { toast.error(er.response?.data?.detail || "Error"); }
  };
  const del = async (id) => {
    if (!window.confirm("¿Eliminar esta reseña?")) return;
    try { await api.delete(`/admin/reviews/${id}`); toast.success("Eliminada"); load(); } catch { toast.error("Error"); }
  };
  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));
  const inp = "w-full border border-sand rounded-lg px-3 py-2 text-sm text-coffee bg-white outline-none focus:border-coral";
  const propName = (slug) => properties.find((p) => p.slug === slug)?.name || slug;

  return (
    <div data-testid="admin-reviews">
      {!form && (
        <button data-testid="admin-add-review" onClick={() => setForm({ ...EMPTY, property_slug: properties[0]?.slug || "" })}
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-coral text-white px-5 py-3 text-xs tracking-widest uppercase hover:bg-coral-dark"><Plus size={15}/> Agregar Reseña</button>
      )}
      {form && (
        <form data-testid="review-form" onSubmit={save} className="bg-white rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-serif text-xl text-coffee">{form.id ? "Editar" : "Nueva"} Reseña</h3>
            <button type="button" onClick={() => setForm(null)}><X size={18} className="text-coffee"/></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-coffee col-span-2 md:col-span-1">Propiedad
              <select required value={form.property_slug} onChange={set("property_slug")} className={inp}>
                {properties.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
              </select>
            </label>
            <label className="text-xs text-coffee">Nombre del huésped<input required value={form.name} onChange={set("name")} className={inp}/></label>
            <label className="text-xs text-coffee">País<input value={form.country} onChange={set("country")} className={inp} placeholder="Estados Unidos"/></label>
            <label className="text-xs text-coffee">Fecha (texto)<input value={form.month} onChange={set("month")} className={inp} placeholder="Marzo 2026"/></label>
            <label className="text-xs text-coffee">Calificación
              <select value={form.rating} onChange={set("rating")} className={inp}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{`${n} ★`}</option>)}</select>
            </label>
            <label className="text-xs text-coffee col-span-2">Comentario<textarea required rows={3} value={form.text} onChange={set("text")} className={inp} placeholder="Pega aquí el comentario real de Airbnb…"/></label>
          </div>
          <button data-testid="review-form-save" type="submit" className="w-full mt-4 rounded-full bg-coral text-white py-3 text-xs tracking-widest uppercase hover:bg-coral-dark">Guardar Reseña</button>
        </form>
      )}
      <div className="grid gap-3">
        {reviews.length === 0 && !form && <p className="text-charcoal/50">Sin reseñas. Agrega los comentarios reales de tus huéspedes de Airbnb.</p>}
        {reviews.map((r) => (
          <div key={r.id} data-testid={`admin-review-row-${r.id}`} className="bg-white rounded-xl p-5 flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg text-coffee">{r.name}</span>
                <span className="flex text-coral">{[...Array(Math.min(r.rating || 5, 5))].map((_, k) => <Star key={k} size={11} fill="currentColor"/>)}</span>
              </div>
              <div className="overline text-charcoal/50 mt-0.5">{propName(r.property_slug)}{r.country ? ` · ${r.country}` : ""}{r.month ? ` · ${r.month}` : ""}</div>
              <p className="text-sm text-charcoal/75 mt-2 italic">"{r.text}"</p>
            </div>
            <button data-testid={`review-edit-${r.id}`} onClick={() => setForm({ ...r })} className="text-coffee hover:text-coral p-2"><Pencil size={16}/></button>
            <button data-testid={`review-delete-${r.id}`} onClick={() => del(r.id)} className="text-coffee hover:text-destructive p-2"><Trash2 size={16}/></button>
          </div>
        ))}
      </div>
    </div>
  );
}
