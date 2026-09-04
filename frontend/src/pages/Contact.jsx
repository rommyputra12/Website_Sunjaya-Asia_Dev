import React, { useState } from "react";
import axios from "axios";
import { Reveal, LineReveal } from "../components/motion/Reveal";
import { useLang } from "../i18n/LanguageContext";
import { toast, Toaster } from "sonner";

const API = `${import.meta.env.VITE_BACKEND_URL}/api`;

export default function Contact() {
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", subject: "", message: "", inquiry_type: "general" });

  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/contact`, form);
      setOk(true);
      toast.success(t("contact.success"));
      setForm({ name: "", email: "", company: "", subject: "", message: "", inquiry_type: "general" });
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Transmission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="contact-page" className="pt-32 pb-24 section-light">
      <Toaster theme="light" position="bottom-right" />
      <div className="max-w-[1600px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-16">
          <div className="md:col-span-6">
            <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-copper">Contact</span>
            <h1 className="font-serif text-2xl md:text-4xl leading-[1.1] tracking-[-0.02em] text-bone mt-3">
              <LineReveal text={t("contact.title")} />
            </h1>
            <p className="mt-6 text-bone/80 text-lg leading-relaxed max-w-md">{t("contact.sub")}</p>

            <div className="mt-16 space-y-8">
              <div className="border-t border-white/10 pt-6">
                <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-copper">Singapore · Headquarters</div>
                <p className="text-bone text-base mt-2 max-w-sm">{t("footer.addr_sg")}</p>
              </div>
              <div className="border-t border-white/10 pt-6">
                <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-copper">Jakarta · Operations</div>
                <p className="text-bone text-base mt-2 max-w-sm">{t("footer.addr_id")}</p>
              </div>
              <div className="border-t border-white/10 pt-6 space-y-1">
                <span className="block text-bone text-lg font-mono lowercase">info@sunjayaasia.com</span>
                <a href="tel:+622121689411" className="block text-bone text-lg font-mono">+62 21 2168 9411</a>
              </div>
            </div>
          </div>

          <Reveal className="md:col-span-6" delay={0.15}>
            <form onSubmit={submit} data-testid="contact-form" className="border border-white/10 p-8 md:p-10 bg-ink">
              <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-copper mb-8">Transmission Form</div>

              <div className="space-y-6">
                <Field label={t("contact.name")} value={form.name} onChange={upd("name")} required id="name" />
                <Field label={t("contact.email")} type="email" value={form.email} onChange={upd("email")} required id="email" />
                <Field label={t("contact.company")} value={form.company} onChange={upd("company")} id="company" />

                <div>
                  <label className="block font-mono text-[10px] tracking-[0.22em] uppercase text-ash mb-2">{t("contact.type")}</label>
                  <select
                    value={form.inquiry_type}
                    onChange={upd("inquiry_type")}
                    data-testid="contact-type"
                    className="w-full h-12 bg-obsidian border border-white/15 px-4 font-mono text-sm text-bone focus:border-copper focus:outline-none transition-colors"
                  >
                    {["general", "partnership", "investment", "procurement", "media"].map((k) => (
                      <option key={k} value={k}>{t(`contact.types.${k}`)}</option>
                    ))}
                  </select>
                </div>

                <Field label={t("contact.subject")} value={form.subject} onChange={upd("subject")} required id="subject" />

                <div>
                  <label className="block font-mono text-[10px] tracking-[0.22em] uppercase text-ash mb-2">{t("contact.message")}</label>
                  <textarea
                    value={form.message}
                    onChange={upd("message")}
                    rows={6}
                    required
                    data-testid="contact-message"
                    className="w-full bg-obsidian border border-white/15 px-4 py-3 font-mono text-sm text-bone focus:border-copper focus:outline-none resize-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  data-testid="contact-submit"
                  className="group relative w-full h-14 bg-copper text-obsidian font-mono text-[11px] tracking-[0.24em] uppercase overflow-hidden disabled:opacity-60"
                >
                  <span className="relative z-10">{loading ? "Transmitting…" : t("contact.submit")}</span>
                  <span className="absolute inset-0 bg-copper-hi origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </button>

                {ok && (
                  <div data-testid="contact-success" className="border border-copper/50 bg-copper/10 p-4 font-mono text-xs text-copper tracking-wide">
                    ✓ {t("contact.success")}
                  </div>
                )}
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

const Field = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block font-mono text-[10px] tracking-[0.22em] uppercase text-ash mb-2">{label}</label>
    <input
      id={id}
      data-testid={`contact-${id}`}
      {...props}
      className="w-full h-12 bg-obsidian border border-white/15 px-4 font-mono text-sm text-bone focus:border-copper focus:outline-none transition-colors"
    />
  </div>
);
