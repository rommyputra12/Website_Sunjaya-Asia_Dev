import { useLang } from "../i18n/LanguageContext";

export const MAX_OFFICES = 4;
export const OFFICES_KEY = "footer.offices";

export const DEFAULT_OFFICES = [
  { label: "Head Quarter · Registered Office", line1: "68 Circular Road, #02-01", line2: "Singapore 049422 Republic of Singapore", phone: "+65 3108 0411" },
  { label: "Branch & Central Hub · Indonesia", line1: "Sunlife Tower 16th, Kawasan Mega Kuningan", line2: "Jakarta Selatan, DKI Jakarta 12950 Indonesia", phone: "+62 21 2168 9411" },
  { label: "Branch Investment Hub · United States", line1: "8 The Green, Ste A, Suite B", line2: "Dover, DE 19901, Kent County, Delaware, United States", phone: "+1 302 248 9559" },
];

export const parseOffices = (raw) => {
  try {
    const arr = JSON.parse(raw || "");
    return Array.isArray(arr) && arr.length ? arr.slice(0, MAX_OFFICES) : null;
  } catch {
    return null;
  }
};

export const telHref = (phone) => `tel:${(phone || "").replace(/[^\d+]/g, "")}`;

// Offices shown in Footer and Contact page (CMS JSON block, falls back to defaults)
export const useOffices = () => {
  const { blocks, lang } = useLang();
  const b = blocks.find((x) => x.key === OFFICES_KEY);
  const list = parseOffices(b?.value) || DEFAULT_OFFICES;
  return list.map((o) => ({ ...o, label: (lang === "id" && o.label_id) || o.label }));
};
