import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearAuth, getUser } from "../../api/auth.api.js";
import { useLang } from "../../i18n/lang.jsx";

export default function Layout() {
  const nav = useNavigate();
  const { lang, setLang, t } = useLang();
  const user = getUser();
  const role = user?.role || "admin";

  function logout() {
    clearAuth();
    nav("/login");
  }

  const linkClass = ({ isActive }) =>
    "block w-full px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap overflow-hidden text-ellipsis " +
    (isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100");

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[260px_1fr]">
      <aside className="w-[260px] shrink-0 border-r border-slate-200 bg-white">
        <div className="p-4 border-b border-slate-200">
          <div className="text-sm font-semibold">{t("app")}</div>
          <div className="text-xs text-slate-500 mt-1">
            {role.toUpperCase()} PANEL
          </div>
        </div>

        <nav className="p-3 flex flex-col gap-1">
          <NavLink to="/" className={linkClass}>{t("dashboard")}</NavLink>

          {role === "admin" && (
            <>
              <NavLink to="/users" className={linkClass}>{t("users")}</NavLink>
              <NavLink to="/courses" className={linkClass}>{t("courses")}</NavLink>
              <NavLink to="/enrollments" className={linkClass}>{t("enrollments")}</NavLink>
            </>
          )}

          {role === "teacher" && (
            <>
              <NavLink to="/courses" className={linkClass}>{t("courses")}</NavLink>
              <NavLink to="/enrollments" className={linkClass}>{t("enrollments")}</NavLink>
            </>
          )}

          {role === "student" && (
            <>
              <NavLink to="/courses" className={linkClass}>{t("courses")}</NavLink>
              {/* إذا عندك صفحة الطالب لاحقًا:
              <NavLink to="/my-courses" className={linkClass}>My Courses</NavLink>
              */}
            </>
          )}
        </nav>
      </aside>

      <main className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200">
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <div className="text-sm text-slate-600">
              {user?.full_name ? (
                <span className="font-medium text-slate-900">{user.full_name}</span>
              ) : (
                "User"
              )}{" "}
              <span className="text-slate-400">•</span>{" "}
              <span className="uppercase text-xs tracking-wide">{role}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs text-slate-500">{t("language")}:</span>
                <button
                  className={"btn-ghost " + (lang === "en" ? "bg-slate-100" : "")}
                  onClick={() => setLang("en")}
                >
                  {t("english")}
                </button>
                <button
                  className={"btn-ghost " + (lang === "ar" ? "bg-slate-100" : "")}
                  onClick={() => setLang("ar")}
                >
                  {t("arabic")}
                </button>
              </div>

              <button className="btn-ghost" onClick={logout}>
                {t("logout")}
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
