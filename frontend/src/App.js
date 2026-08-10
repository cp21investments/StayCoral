import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/i18n";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Home from "@/pages/Home";
import Stays from "@/pages/Stays";
import PropertyDetail from "@/pages/PropertyDetail";
import Cartagena from "@/pages/Cartagena";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Journal from "@/pages/Journal";
import Login from "@/pages/admin/Login";
import Dashboard from "@/pages/admin/Dashboard";

function Site() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stays" element={<Stays />} />
        <Route path="/stays/:slug" element={<PropertyDetail />} />
        <Route path="/cartagena" element={<Cartagena />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/journal" element={<Journal />} />
      </Routes>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

function Shell() {
  const loc = useLocation();
  const isAdmin = loc.pathname.startsWith("/admin");
  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<Dashboard />} />
      </Routes>
    );
  }
  return (
    <SmoothScroll>
      <Site />
    </SmoothScroll>
  );
}

function App() {
  return (
    <div className="App">
      <LanguageProvider>
        <BrowserRouter>
          <Shell />
          <Toaster position="bottom-center" richColors />
        </BrowserRouter>
      </LanguageProvider>
    </div>
  );
}

export default App;
