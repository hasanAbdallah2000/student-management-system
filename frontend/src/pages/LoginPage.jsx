import React from "react";
import { useNavigate } from "react-router-dom";
import { api, endpoints } from "../api/api.js";
import { setAuth } from "../api/auth.api.js";
import Toast from "../components/common/Toast.jsx";
import { useLang } from "../i18n/lang.jsx";

export default function LoginPage() {
  const nav = useNavigate();
  const { t } = useLang();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setToast(null);
    try {
      const res = await api.post(endpoints.login, { email, password });
      // expected: { message, token, user }
      const { token, user } = res.data || {};
      setAuth({ token, user });
      nav("/");
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || t("serverError");
      setToast({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      <div className="card w-full max-w-md p-6">
        <div className="mb-6">
          <div className="text-2xl font-semibold">{t("login")}</div>
          <div className="text-sm text-slate-500 mt-1">React + Tailwind • Node/Express API</div>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <div className="label mb-1">{t("email")}</div>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@email.com" />
          </div>

          <div>
            <div className="label mb-1">{t("password")}</div>
            <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" />
          </div>

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? t("signingIn") : t("signIn")}
          </button>

          <div className="text-xs text-slate-500">
            Tip: set <b>VITE_API_BASE_URL</b> in <b>.env</b> (frontend) if your backend runs on another port.
          </div>
        </form>
      </div>
    </div>
  );
}
