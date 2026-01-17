import React from "react";

export default function Toast({ message, type = "info", onClose }) {
  if (!message) return null;
  const base = "fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg border text-sm";
  const styles = {
    info: "bg-white border-slate-200 text-slate-800",
    success: "bg-emerald-50 border-emerald-200 text-emerald-900",
    error: "bg-rose-50 border-rose-200 text-rose-900",
  };
  return (
    <div className={`${base} ${styles[type] || styles.info}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1">{message}</div>
        <button className="text-slate-500 hover:text-slate-900" onClick={onClose}>×</button>
      </div>
    </div>
  );
}
