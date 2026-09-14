import { useState, useEffect } from "react";

const STORAGE_KEY = "sunjaya_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ all: true, date: new Date().toISOString() }));
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ all: false, date: new Date().toISOString() }));
    setVisible(false);
  };

  const handleSaveSettings = (prefs) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prefs, date: new Date().toISOString() }));
    setVisible(false);
    setShowSettings(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] px-4 pb-4 md:pb-6 animate-fade-up">
      <div className="mx-auto max-w-3xl rounded-xl border border-copper/30 bg-obsidian/95 backdrop-blur-xl shadow-2xl overflow-hidden">
        {!showSettings ? (
          <div className="p-5 md:p-6">
            <h3 className="font-serif text-lg md:text-xl text-bone tracking-tight">We Value Your Privacy</h3>
            <p className="mt-2 text-bone/70 text-xs md:text-sm leading-relaxed">
              Sunjaya Asia Group Limited uses cookies and related technologies to enhance site navigation, analyze site usage, and support our strategic communication initiatives. By clicking "Accept All", you consent to the use of all cookies. You may also manage your preferences by clicking "Cookie Settings".
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <button
                onClick={handleAcceptAll}
                className="px-5 py-2.5 rounded-full bg-gradient-to-br from-copper-hi to-copper text-obsidian font-mono text-[10px] md:text-[11px] tracking-[0.18em] uppercase font-bold shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                Accept All
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="px-5 py-2.5 rounded-full border border-bone/30 text-bone font-mono text-[10px] md:text-[11px] tracking-[0.18em] uppercase font-bold hover:bg-bone/10 transition-all duration-300 cursor-pointer"
              >
                Cookie Settings
              </button>
              <button
                onClick={handleReject}
                className="px-5 py-2.5 rounded-full border border-bone/20 text-bone/60 font-mono text-[10px] md:text-[11px] tracking-[0.18em] uppercase font-bold hover:bg-bone/5 hover:text-bone/80 transition-all duration-300 cursor-pointer"
              >
                Reject Non-Essential
              </button>
            </div>
          </div>
        ) : (
          <CookieSettings onSave={handleSaveSettings} onBack={() => setShowSettings(false)} />
        )}
      </div>
    </div>
  );
}

function CookieSettings({ onSave, onBack }) {
  const [essential, setEssential] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  return (
    <div className="p-5 md:p-6">
      <h3 className="font-serif text-lg md:text-xl text-bone tracking-tight">Cookie Settings</h3>
      <p className="mt-2 text-bone/60 text-xs leading-relaxed">
        Manage your cookie preferences below. Essential cookies cannot be disabled as they are required for the site to function.
      </p>

      <div className="mt-4 space-y-3">
        <CookieToggle label="Essential" desc="Required for basic site functionality." checked={essential} disabled />
        <CookieToggle label="Analytics" desc="Help us understand how visitors use our site." checked={analytics} onChange={setAnalytics} />
        <CookieToggle label="Marketing" desc="Used to deliver relevant content and communications." checked={marketing} onChange={setMarketing} />
      </div>

      <div className="mt-5 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
        <button
          onClick={() => onSave({ essential, analytics, marketing })}
          className="px-5 py-2.5 rounded-full bg-gradient-to-br from-copper-hi to-copper text-obsidian font-mono text-[10px] md:text-[11px] tracking-[0.18em] uppercase font-bold shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
        >
          Save Preferences
        </button>
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-full border border-bone/30 text-bone font-mono text-[10px] md:text-[11px] tracking-[0.18em] uppercase font-bold hover:bg-bone/10 transition-all duration-300 cursor-pointer"
        >
          Back
        </button>
      </div>
    </div>
  );
}

function CookieToggle({ label, desc, checked, onChange, disabled }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-bone/10 last:border-0">
      <div className="flex-1">
        <div className="font-mono text-xs tracking-wide uppercase text-bone font-bold">{label}</div>
        <div className="text-bone/50 text-[11px] mt-0.5 leading-relaxed">{desc}</div>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative shrink-0 w-10 h-5 rounded-full transition-colors duration-300 ${
          checked ? "bg-copper" : "bg-bone/20"
        } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-bone transition-transform duration-300 ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    </div>
  );
}
