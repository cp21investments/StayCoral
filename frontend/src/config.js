export const SITE = {
  name: "Stay Coral Collection",
  whatsapp: "573027597562",
  whatsappDisplay: "+57 302 759 7562",
  instagram: "https://www.instagram.com/staycoralcollection",
  email: "cp21investments@gmail.com",
  location: "Cartagena de Indias · Colombia",
};

export const waLink = (msg) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
    msg || "Hi Stay Coral Collection! I'd like to know more about your stays in Cartagena."
  )}`;
