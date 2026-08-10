import React, { createContext, useContext, useState, useCallback } from "react";

const dict = {
  en: {
    nav: { stays: "Stays", cartagena: "Cartagena", story: "Our Story", journal: "Journal", contact: "Contact", book: "Book Direct" },
    hero: {
      brand: "Stay Coral Collection",
      title: "Stay where Cartagena comes alive.",
      sub: "Boutique vacation homes in Cartagena de Indias.",
      cta1: "Explore Our Stays", cta2: "Book Direct", loc: "Cartagena de Indias · Colombia", scroll: "Scroll",
    },
    intro: {
      overline: "The Collection",
      h1: "More than a place to stay.", h2: "A place to experience Cartagena.",
      body: "Stay Coral Collection brings together thoughtfully selected vacation homes in some of Cartagena's most desirable locations — from the historic heart of the Walled City to the relaxed streets of Manga. Each stay is designed around comfort, character and location, giving you the freedom of a private home with the feeling of a carefully curated boutique stay.",
      cta: "Discover Our Collection",
    },
    collection: {
      overline: "Our Collection", title: "Four sides of one city.",
      sub: "Distinct stays across two of Cartagena's most loved neighborhoods.",
      iconic: "The Iconic Stays", iconicHead: "Stay in the heart of Cartagena.",
      iconicDesc: "Our Historic Center residences place you directly in the energy of Cartagena's Walled City — surrounded by centuries of history, colorful streets, restaurants, cafés and some of the city's most iconic landmarks.",
      iconicTag: "Torre del Reloj · Historic Center",
      local: "The Local Collection", localHead: "Discover a quieter side of Cartagena.",
      localDesc: "Just beyond the energy of the Historic Center, Manga offers a more relaxed side of Cartagena — local streets, neighborhood restaurants, bay views and an authentic rhythm of everyday life.",
      localTag: "Comfortable · Authentic · Excellent value",
      explore: "Explore Stay",
    },
    feature: {
      h: "Wake up in the heart of Cartagena.",
      body: "Step outside and find yourself at the center of the city's most iconic moments. From the Torre del Reloj to the colorful streets of the Walled City, Cartagena is right outside your door.",
      cta1: "Explore This Stay", cta2: "Check Availability",
    },
    why: {
      title: "The Stay Coral Standard",
      items: [
        ["Prime Locations", "Handpicked locations that put you close to the Cartagena experience."],
        ["Thoughtful Spaces", "Comfortable, well-equipped homes designed for short getaways and extended stays."],
        ["Personal Hospitality", "We're here when you need us, and invisible when you don't."],
        ["Cartagena Expertise", "Local recommendations and thoughtful guidance to experience the city beyond the usual."],
      ],
    },
    cartagena: {
      overline: "The Destination", title: "Cartagena is waiting.",
      sub: "History. Caribbean light. Music. Architecture. Life.",
      items: [
        ["The Walled City", "Centuries of history, colorful streets and unforgettable architecture."],
        ["Getsemaní", "Art, music, food and the unmistakable energy of Cartagena."],
        ["Manga", "A slower rhythm, local life and views across the bay."],
        ["Beyond the City", "Rosario Islands, Caribbean beaches and unforgettable day trips."],
      ],
      cta: "Discover Cartagena",
    },
    reviews: { title: "Loved by our guests.", more: "Read More Reviews", placeholder: "Placeholder — to be replaced with verified guest reviews." },
    booking: {
      title: "Your Cartagena stay starts here.",
      body: "Book directly with Stay Coral Collection and enjoy a seamless experience from reservation to arrival.",
      cta1: "Check Availability", cta2: "Explore Our Stays",
    },
    journal: {
      overline: "Editorial", title: "The Cartagena Journal", cta: "Explore the Journal",
      articles: [
        "Where to Stay in Cartagena", "The Best Areas to Explore in Cartagena",
        "Cartagena for First-Time Visitors", "A 3-Day Cartagena Itinerary",
        "Old Town vs. Getsemaní vs. Manga", "The Best Beaches and Islands Near Cartagena",
      ],
      soon: "Coming soon",
    },
    final: { h: "Come experience Cartagena.", body: "Your home in the heart of the Caribbean is waiting.", cta1: "Book Your Stay", cta2: "Explore the Collection" },
    footer: { tagline: "Boutique vacation homes in Cartagena de Indias.", explore: "Explore", stays: "Stays", connect: "Connect", historic: "Historic Center", manga: "Manga", privacy: "Privacy Policy", terms: "Terms & Conditions", cancel: "Cancellation Policy", rights: "All rights reserved." },
    prop: { book: "Check Availability", from: "Guests", bedrooms: "Bedrooms", bathrooms: "Bathrooms", amenities: "Amenities", location: "Location", loves: "What guests love", rules: "House rules", faq: "FAQ", reviews: "Reviews", airbnb: "View on Airbnb", enquire: "Request to Book", desc: "About this stay", sleeping: "Sleeping arrangements", bed: "1 double bed + sofa bed", bed8: "2 double beds + 2 sofa beds" },
    contact: { title: "We'd love to hear from you.", sub: "Tell us about your trip and we'll help you find the perfect stay.", name: "Name", email: "Email", phone: "Phone / WhatsApp", checkin: "Check-in", checkout: "Check-out", guests: "Guests", property: "Property of interest", message: "Message", send: "Send Message", sending: "Sending...", success: "Thank you — we'll be in touch shortly.", error: "Something went wrong. Please try again.", wa: "Chat on WhatsApp" },
    story: { title: "Our Story", cta: "Explore Our Stays",
      body: "Stay Coral Collection was created around a simple idea: that where you stay should be part of the experience.\n\nWe curate comfortable, character-filled homes in Cartagena's most interesting neighborhoods, combining the freedom of a private residence with thoughtful hospitality.\n\nFrom the historic heart of the Walled City to the quieter streets of Manga, every stay is chosen with one goal in mind — helping our guests experience Cartagena in a way that feels personal, comfortable and memorable." },
    common: { chat: "Chat with us", viewAll: "View all stays", back: "Back to stays" },
  },
  es: {
    nav: { stays: "Alojamientos", cartagena: "Cartagena", story: "Nuestra Historia", journal: "Diario", contact: "Contacto", book: "Reserva Directa" },
    hero: {
      brand: "Stay Coral Collection",
      title: "Hospédate donde Cartagena cobra vida.",
      sub: "Casas boutique de vacaciones en Cartagena de Indias.",
      cta1: "Explorar Alojamientos", cta2: "Reserva Directa", loc: "Cartagena de Indias · Colombia", scroll: "Descubre",
    },
    intro: {
      overline: "La Colección",
      h1: "Más que un lugar para hospedarse.", h2: "Un lugar para vivir Cartagena.",
      body: "Stay Coral Collection reúne casas de vacaciones cuidadosamente seleccionadas en algunas de las ubicaciones más deseadas de Cartagena — desde el corazón histórico de la Ciudad Amurallada hasta las tranquilas calles de Manga. Cada alojamiento está diseñado en torno a la comodidad, el carácter y la ubicación, brindándote la libertad de una casa privada con la sensación de una estancia boutique curada.",
      cta: "Descubre la Colección",
    },
    collection: {
      overline: "Nuestra Colección", title: "Cuatro caras de una misma ciudad.",
      sub: "Alojamientos distintivos en dos de los barrios más queridos de Cartagena.",
      iconic: "Los Emblemáticos", iconicHead: "Hospédate en el corazón de Cartagena.",
      iconicDesc: "Nuestras residencias del Centro Histórico te sitúan directamente en la energía de la Ciudad Amurallada — rodeado de siglos de historia, calles coloridas, restaurantes, cafés y algunos de los monumentos más icónicos de la ciudad.",
      iconicTag: "Torre del Reloj · Centro Histórico",
      local: "La Colección Local", localHead: "Descubre un lado más tranquilo de Cartagena.",
      localDesc: "Justo más allá de la energía del Centro Histórico, Manga ofrece un lado más relajado de Cartagena — calles locales, restaurantes de barrio, vistas a la bahía y el ritmo auténtico de la vida cotidiana.",
      localTag: "Cómodo · Auténtico · Excelente valor",
      explore: "Explorar",
    },
    feature: {
      h: "Despierta en el corazón de Cartagena.",
      body: "Sal a la calle y encuéntrate en el centro de los momentos más icónicos de la ciudad. Desde la Torre del Reloj hasta las coloridas calles de la Ciudad Amurallada, Cartagena está justo afuera de tu puerta.",
      cta1: "Explorar este Alojamiento", cta2: "Consultar Disponibilidad",
    },
    why: {
      title: "El Estándar Stay Coral",
      items: [
        ["Ubicaciones Privilegiadas", "Ubicaciones seleccionadas que te acercan a la experiencia de Cartagena."],
        ["Espacios Pensados", "Casas cómodas y bien equipadas, diseñadas para escapadas cortas y estancias largas."],
        ["Hospitalidad Personal", "Estamos cuando nos necesitas, e invisibles cuando no."],
        ["Expertos en Cartagena", "Recomendaciones locales para vivir la ciudad más allá de lo habitual."],
      ],
    },
    cartagena: {
      overline: "El Destino", title: "Cartagena te espera.",
      sub: "Historia. Luz del Caribe. Música. Arquitectura. Vida.",
      items: [
        ["La Ciudad Amurallada", "Siglos de historia, calles coloridas y arquitectura inolvidable."],
        ["Getsemaní", "Arte, música, comida y la inconfundible energía de Cartagena."],
        ["Manga", "Un ritmo más pausado, vida local y vistas a la bahía."],
        ["Más allá de la ciudad", "Islas del Rosario, playas del Caribe y excursiones inolvidables."],
      ],
      cta: "Descubre Cartagena",
    },
    reviews: { title: "Amado por nuestros huéspedes.", more: "Ver más reseñas", placeholder: "Marcador — se reemplazará con reseñas verificadas de huéspedes." },
    booking: {
      title: "Tu estancia en Cartagena empieza aquí.",
      body: "Reserva directamente con Stay Coral Collection y disfruta de una experiencia impecable desde la reserva hasta tu llegada.",
      cta1: "Consultar Disponibilidad", cta2: "Explorar Alojamientos",
    },
    journal: {
      overline: "Editorial", title: "El Diario de Cartagena", cta: "Explorar el Diario",
      articles: [
        "Dónde alojarse en Cartagena", "Las mejores zonas para explorar en Cartagena",
        "Cartagena para quienes la visitan por primera vez", "Un itinerario de 3 días en Cartagena",
        "Centro Histórico vs. Getsemaní vs. Manga", "Las mejores playas e islas cerca de Cartagena",
      ],
      soon: "Próximamente",
    },
    final: { h: "Ven a vivir Cartagena.", body: "Tu hogar en el corazón del Caribe te espera.", cta1: "Reserva tu Estancia", cta2: "Explorar la Colección" },
    footer: { tagline: "Casas boutique de vacaciones en Cartagena de Indias.", explore: "Explorar", stays: "Alojamientos", connect: "Conecta", historic: "Centro Histórico", manga: "Manga", privacy: "Política de Privacidad", terms: "Términos y Condiciones", cancel: "Política de Cancelación", rights: "Todos los derechos reservados." },
    prop: { book: "Consultar Disponibilidad", from: "Huéspedes", bedrooms: "Habitaciones", bathrooms: "Baños", amenities: "Comodidades", location: "Ubicación", loves: "Lo que aman los huéspedes", rules: "Normas de la casa", faq: "Preguntas frecuentes", reviews: "Reseñas", airbnb: "Ver en Airbnb", enquire: "Solicitar Reserva", desc: "Sobre este alojamiento", sleeping: "Distribución para dormir", bed: "1 cama doble + sofá cama", bed8: "2 camas dobles + 2 sofás cama" },
    contact: { title: "Nos encantaría saber de ti.", sub: "Cuéntanos sobre tu viaje y te ayudamos a encontrar el alojamiento perfecto.", name: "Nombre", email: "Correo", phone: "Teléfono / WhatsApp", checkin: "Llegada", checkout: "Salida", guests: "Huéspedes", property: "Alojamiento de interés", message: "Mensaje", send: "Enviar Mensaje", sending: "Enviando...", success: "Gracias — te contactaremos pronto.", error: "Algo salió mal. Inténtalo de nuevo.", wa: "Escríbenos por WhatsApp" },
    story: { title: "Nuestra Historia", cta: "Explorar Alojamientos",
      body: "Stay Coral Collection nació de una idea sencilla: que el lugar donde te hospedas debe ser parte de la experiencia.\n\nCuramos casas cómodas y llenas de carácter en los barrios más interesantes de Cartagena, combinando la libertad de una residencia privada con una hospitalidad cuidada.\n\nDesde el corazón histórico de la Ciudad Amurallada hasta las tranquilas calles de Manga, cada alojamiento se elige con un solo objetivo — ayudar a nuestros huéspedes a vivir Cartagena de una forma personal, cómoda y memorable." },
    common: { chat: "Escríbenos", viewAll: "Ver todos los alojamientos", back: "Volver a alojamientos" },
  },
};

const LangContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem("scc_lang") || "en");
  const toggle = useCallback((l) => {
    const next = l || (lang === "en" ? "es" : "en");
    setLang(next);
    localStorage.setItem("scc_lang", next);
  }, [lang]);
  return <LangContext.Provider value={{ lang, t: dict[lang], toggle }}>{children}</LangContext.Provider>;
};

export const useLang = () => useContext(LangContext);
