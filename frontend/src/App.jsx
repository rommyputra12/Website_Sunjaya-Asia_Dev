import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "./i18n/LanguageContext";
import { AssetProvider } from "./context/AssetContext";
import { SmoothScroll } from "./components/motion/SmoothScroll";
import { Nav } from "./components/layout/Nav";
import { Footer } from "./components/layout/Footer";
import { CookieBanner } from "./components/CookieBanner";
import { RouteSeo } from "./components/RouteSeo";
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
          const y = el.getBoundingClientRect().top + window.scrollY - ((document.querySelector("header")?.offsetHeight || 80) + 8);
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
      <AssetProvider>
      <LanguageProvider>
        <BrowserRouter>
          <SmoothScroll>
              <ScrollTop />
              <RouteSeo />
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
                <Route path="*" element={
                  <section data-testid="not-found" className="pt-40 pb-32 px-6 md:px-10 max-w-[1600px] mx-auto">
                    <span className="font-mono text-lg md:text-2xl font-bold tracking-[0.24em] uppercase text-copper">404</span>
                    <h1 className="mt-4 font-serif text-2xl md:text-4xl text-bone tracking-tight">Page not found</h1>
                    <a href="/" data-testid="not-found-home" className="mt-8 inline-block font-mono text-xs tracking-[0.22em] uppercase text-copper border-b border-copper/50 pb-1 hover:border-copper transition-colors">Back to home →</a>
                  </section>
                } />
              </Routes>
            </main>
            <Footer />
            <CookieBanner />
          </SmoothScroll>
        </BrowserRouter>
      </LanguageProvider>
      </AssetProvider>
    </div>
  );
}

export default App;
