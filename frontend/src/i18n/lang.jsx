import React from "react";
import { dictionary } from "./i18n";

const LangContext = React.createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = React.useState(() => localStorage.getItem("lang") || "en");
  React.useEffect(() => localStorage.setItem("lang", lang), [lang]);

  const t = React.useCallback((key) => {
    const pack = dictionary[lang] || dictionary.en;
    return pack[key] || key;
  }, [lang]);

  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <LangContext.Provider value={{ lang, setLang, t, dir }}>
      <div dir={dir} className="min-h-screen">
        {children}
      </div>
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = React.useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
