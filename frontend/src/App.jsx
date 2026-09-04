import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "./i18n/LanguageContext";
import { SmoothScroll } from "./components/motion/SmoothScroll";
import { Nav } from "./components/layout/Nav";
import { Footer } from "./components/layout/Footer";
import { CookieBanner } from "./components/CookieBanner";
import Home from "./pages/Home";
import About from "./pages/About";
import Pillars from "./pages/Pillars";
import Subsidiaries from "./pages/Subsidiaries";
import News from "./pages/News";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import Legal from "./pages/Legal";
import "./App.css";

const ScrollTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      // Delay to let the page render, then scroll to anchor
      const id = hash.replace("#", "");
      const attempt = (tries = 0) => {
        const el = document.getElementById(id);
        if (el) {
          // Account for fixed nav height
          const y = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: Math.max(0, y), behavior: "auto" });
        } else if (tries < 10) {
          setTimeout(() => attempt(tries + 1), 80);
        }
      };
      attempt();
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [pathname, hash]);
  return null;
};

function App() {
  return (
    <div className="App grain">
      <LanguageProvider>
        <BrowserRouter>
          <SmoothScroll>
            <ScrollTop />
            <Nav />
            <main className="min-h-screen">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/pillars" element={<Pillars />} />
                <Route path="/subsidiaries" element={<Subsidiaries />} />
                <Route path="/news" element={<News />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/legal/:type" element={<Legal />} />
                <Route path="/legal" element={<Legal />} />
              </Routes>
            </main>
            <Footer />
            <CookieBanner />
          </SmoothScroll>
        </BrowserRouter>
      </LanguageProvider>
    </div>
  );
}

export default App;
