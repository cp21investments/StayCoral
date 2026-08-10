import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogOut, Plus, Pencil, Trash2, X, Inbox, Home as HomeIcon } from "lucide-react";
import { api, getProperties } from "../../lib/api";

const EMPTY = {
  slug: "", name: "", category: "historic", location: "", tagline: "",
  short_desc: "", description: "", guests: 4, bedrooms: 1, bathrooms: 1,
  amenities: [], images: [], airbnb_url: "", booking_url: "", featured: false,
  order: 99, lat: 10.4236, lng: -75.5518,
};

export default function Dashboard() {
  const nav = useNavigate();
  const [tab, setTab] = useState("properties");
  const [props, setProps] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = () => getProperties().then(setProps).catch(() => {});
  useEffect(() => {
    api.get("/auth/me").catch(() => nav("/admin/login"));
    load();
    api.get("/admin/inquiries").then((r) => setInquiries(r.data)).catch(() => {});
  }, [nav]);

  const logout = () => { localStorage.removeItem("scc_token"); nav("/admin/login"); };

  const save = async (data) => {
    try {
      if (editing?.existing) await api.put(`/admin/properties/${editing.slug}`, data);
      else await api.post("/admin/properties", data);
      toast.success("Saved");
      setEditing(null); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Error saving"); }
  };
  const del = async (slug) => {
    if (!window.confirm("Delete this property?")) return;
    try { await api.delete(`/admin/properties/${slug}`); toast.success("Deleted"); load(); }
    catch { toast.error("Error"); }
  };

  return (
    <main data-testid="admin-dashboard" className="min-h-screen bg-ivory">
      <header className="bg-coffee text-ivory px-6 md:px-10 py-5 flex items-center justify-between sticky top-0 z-20">
        <span className="font-serif text-xl tracking-widest uppercase">Stay Coral · Admin</span>
        <div className="flex items-center gap-3">
          <a href="/" className="text-xs tracking-widest uppercase hover:text-coral flex items-center gap-1"><HomeIcon size={14}/> Site</a>
          <button data-testid="admin-logout" onClick={logout} className="text-xs tracking-widest uppercase hover:text-coral flex items-center gap-1"><LogOut size={14}/> Logout</button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 md:px-10 py-10">
        <div className="flex gap-2 mb-8">
          <button onClick={() => setTab("properties")} className={`px-5 py-2 rounded-full text-xs tracking-widest uppercase ${tab === "properties" ? "bg-coffee text-ivory" : "bg-sand/40 text-coffee"}`}>Properties ({props.length})</button>
          <button data-testid="admin-tab-inquiries" onClick={() => setTab("inquiries")} className={`px-5 py-2 rounded-full text-xs tracking-widest uppercase flex items-center gap-2 ${tab === "inquiries" ? "bg-coffee text-ivory" : "bg-sand/40 text-coffee"}`}><Inbox size={14}/> Inquiries ({inquiries.length})</button>
        </div>

        {tab === "properties" && (
          <>
            <button data-testid="admin-add-property" onClick={() => setEditing({ ...EMPTY, existing: false })} className="mb-6 inline-flex items-center gap-2 rounded-full bg-coral text-white px-5 py-3 text-xs tracking-widest uppercase hover:bg-coral-dark"><Plus size={15}/> Add Property</button>
            <div className="grid gap-3">
              {props.map((p) => (
                <div key={p.slug} data-testid={`admin-property-row-${p.slug}`} className="bg-white rounded-xl p-5 flex items-center gap-5">
                  <img src={p.images?.[0]} alt={p.name} className="w-20 h-20 object-cover rounded-lg" />
                  <div className="flex-1">
                    <div className="font-serif text-xl text-coffee">{p.name}</div>
                    <div className="overline text-charcoal/50">{p.category} · {p.location}</div>
                  </div>
                  <button data-testid={`admin-edit-${p.slug}`} onClick={() => setEditing({ ...p, existing: true })} className="text-coffee hover:text-coral p-2"><Pencil size={18}/></button>
                  <button data-testid={`admin-delete-${p.slug}`} onClick={() => del(p.slug)} className="text-coffee hover:text-destructive p-2"><Trash2 size={18}/></button>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "inquiries" && (
          <div className="grid gap-3">
            {inquiries.length === 0 && <p className="text-charcoal/50">No inquiries yet.</p>}
            {inquiries.map((q, i) => (
              <div key={i} className="bg-white rounded-xl p-5">
                <div className="flex justify-between"><span className="font-serif text-xl text-coffee">{q.name}</span><span className="text-xs text-charcoal/50">{(q.created_at || "").slice(0, 10)}</span></div>
                <div className="text-sm text-charcoal/70 mt-1">{q.email} · {q.phone}</div>
                <div className="text-sm text-charcoal/70 mt-1">{q.property_name} · {q.checkin} → {q.checkout} · {q.guests} guests</div>
                {q.message && <p className="text-sm text-charcoal/80 mt-2 italic">"{q.message}"</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && <PropertyForm data={editing} onClose={() => setEditing(null)} onSave={save} />}
    </main>
  );
}

function PropertyForm({ data, onClose, onSave }) {
  const [f, setF] = useState({ ...data, amenities: (data.amenities || []).join("\n"), images: (data.images || []).join("\n") });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    onSave({
      ...f,
      guests: +f.guests, bedrooms: +f.bedrooms, bathrooms: +f.bathrooms, order: +f.order,
      lat: parseFloat(f.lat), lng: parseFloat(f.lng), featured: !!f.featured,
      amenities: f.amenities.split("\n").map((s) => s.trim()).filter(Boolean),
      images: f.images.split("\n").map((s) => s.trim()).filter(Boolean),
    });
  };
  const inp = "w-full border border-sand rounded-lg px-3 py-2 text-sm text-coffee bg-white outline-none focus:border-coral";
  return (
    <div className="fixed inset-0 z-50 bg-coffee/70 flex items-center justify-center p-4 overflow-auto">
      <form data-testid="property-form" onSubmit={submit} className="bg-ivory rounded-2xl p-8 w-full max-w-2xl my-8 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6"><h2 className="font-serif text-2xl text-coffee">{data.existing ? "Edit" : "New"} Property</h2><button type="button" onClick={onClose}><X className="text-coffee"/></button></div>
        <div className="grid grid-cols-2 gap-4">
          <label className="text-xs text-coffee">Name<input required value={f.name} onChange={set("name")} className={inp}/></label>
          <label className="text-xs text-coffee">Slug<input required value={f.slug} onChange={set("slug")} className={inp} disabled={data.existing}/></label>
          <label className="text-xs text-coffee">Category
            <select value={f.category} onChange={set("category")} className={inp}><option value="historic">historic</option><option value="manga">manga</option></select>
          </label>
          <label className="text-xs text-coffee">Location<input value={f.location} onChange={set("location")} className={inp}/></label>
          <label className="text-xs text-coffee col-span-2">Tagline / Main feature<input value={f.tagline} onChange={set("tagline")} className={inp}/></label>
          <label className="text-xs text-coffee col-span-2">Short description<input value={f.short_desc} onChange={set("short_desc")} className={inp}/></label>
          <label className="text-xs text-coffee col-span-2">Full description<textarea rows={4} value={f.description} onChange={set("description")} className={inp}/></label>
          <label className="text-xs text-coffee">Guests<input type="number" value={f.guests} onChange={set("guests")} className={inp}/></label>
          <label className="text-xs text-coffee">Bedrooms<input type="number" value={f.bedrooms} onChange={set("bedrooms")} className={inp}/></label>
          <label className="text-xs text-coffee">Bathrooms<input type="number" value={f.bathrooms} onChange={set("bathrooms")} className={inp}/></label>
          <label className="text-xs text-coffee">Order<input type="number" value={f.order} onChange={set("order")} className={inp}/></label>
          <label className="text-xs text-coffee">Latitude<input value={f.lat} onChange={set("lat")} className={inp}/></label>
          <label className="text-xs text-coffee">Longitude<input value={f.lng} onChange={set("lng")} className={inp}/></label>
          <label className="text-xs text-coffee col-span-2">Airbnb URL<input value={f.airbnb_url || ""} onChange={set("airbnb_url")} className={inp}/></label>
          <label className="text-xs text-coffee col-span-2">Booking.com URL<input value={f.booking_url || ""} onChange={set("booking_url")} className={inp}/></label>
          <label className="text-xs text-coffee col-span-2">Amenities (one per line)<textarea rows={4} value={f.amenities} onChange={set("amenities")} className={inp}/></label>
          <label className="text-xs text-coffee col-span-2">Image URLs (one per line)<textarea rows={4} value={f.images} onChange={set("images")} className={inp}/></label>
          <label className="text-xs text-coffee flex items-center gap-2 col-span-2"><input type="checkbox" checked={f.featured} onChange={(e) => setF((s) => ({ ...s, featured: e.target.checked }))}/> Featured (flagship on homepage)</label>
        </div>
        <button data-testid="property-form-save" type="submit" className="w-full mt-6 rounded-full bg-coral text-white py-3 text-xs tracking-widest uppercase hover:bg-coral-dark">Save Property</button>
      </form>
    </div>
  );
}
