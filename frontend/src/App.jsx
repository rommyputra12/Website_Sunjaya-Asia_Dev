import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, matchPath } from "react-router-dom";
import { LanguageProvider } from "./i18n/LanguageContext";
import { AssetProvider } from "./context/AssetContext";
import { SmoothScroll } from "./components/motion/SmoothScroll";
import { Nav } from "./components/layout/Nav";
import { Footer } from "./components/layout/Footer";
import { CookieBanner } from "./components/CookieBanner";
import { ADMIN_PATH } from "./lib/adminPath";
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

const KNOWN = ["/", "/about", "/pillars", "/subsidiaries", "/news", "/contact", ADMIN_PATH, "/legal", "/legal/:type"];
// Header, footer & cookie banner only on real pages (404 stays bare)
const OnKnownRoute = ({ children }) => {
  const { pathname } = useLocation();
  return KNOWN.some((p) => matchPath(p, pathname)) ? children : null;
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
              <OnKnownRoute><Nav /></OnKnownRoute>
              <main className="min-h-screen">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/pillars" element={<Pillars />} />
                <Route path="/subsidiaries" element={<Subsidiaries />} />
                <Route path="/news" element={<News />} />
                <Route path="/contact" element={<Contact />} />
                <Route path={ADMIN_PATH} element={<Admin />} />
                <Route path="/legal/:type" element={<Legal />} />
                <Route path="/legal" element={<Legal />} />
                <Route path="*" element={
                  <section data-testid="not-found" className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
                    <span className="font-mono text-lg md:text-2xl font-bold tracking-[0.24em] uppercase text-copper">404</span>
                    <h1 className="mt-4 font-serif text-2xl md:text-4xl text-bone tracking-tight">Page not found</h1>
                  </section>
                } />
              </Routes>
            </main>
            <OnKnownRoute><Footer /><CookieBanner /></OnKnownRoute>
          </SmoothScroll>
        </BrowserRouter>
      </LanguageProvider>
      </AssetProvider>
    </div>
  );
}

export default App;
