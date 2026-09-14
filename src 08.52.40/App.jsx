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
                <Route path="/download" element={
                  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', padding: '24px' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Download Project</h1>
                    <p style={{ color: '#666', textAlign: 'center', maxWidth: '400px' }}>
                      Pilih file yang ingin diunduh di bawah ini.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '300px' }}>
                      <a href="/project-code.tar.gz" download style={{ display: 'block', textAlign: 'center', padding: '14px 24px', background: '#0f172a', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
                        Kode Saja (101 KB)
                      </a>
                      <a href="/project-full.tar.gz" download style={{ display: 'block', textAlign: 'center', padding: '14px 24px', background: '#0f172a', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
                        Kode + Gambar (74 MB)
                      </a>
                    </div>
                  </div>
                } />
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
