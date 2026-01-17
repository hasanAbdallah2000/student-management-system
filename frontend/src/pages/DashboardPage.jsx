import React from "react";
import { api } from "../api/api.js";
import { useLang } from "../i18n/lang.jsx";
import { getUser } from "../api/auth.api.js";


function StatCard({ title, value, subtitle }) {
  return (
    <div className="card p-5">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useLang();
  const user = getUser();
  const role = user?.role;

  const [health, setHealth] = React.useState("...");
  const [stats, setStats] = React.useState(null);

  React.useEffect(() => {
    api.get("/health")
      .then(r => setHealth(r.data?.status || "ok"))
      .catch(() => setHealth("down"));

    api.get("/dashboard/stats")
      .then(r => setStats(r.data))
      .catch(() => setStats(null));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-5">
        <div className="text-lg font-semibold">{t("dashboard")}</div>
        <div className="text-sm text-slate-600 mt-1">
          System status:{" "}
          <span className={"font-medium " + (health === "ok" ? "text-green-600" : "text-red-600")}>
            {health}
          </span>
        </div>
      </div>

      {/* ADMIN DASHBOARD */}
      {role === "admin" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title={t("users")} value={stats?.users ?? "..."} subtitle="Total users" />
          <StatCard title={t("courses")} value={stats?.courses ?? "..."} subtitle="Total courses" />
          <StatCard title={t("enrollments")} value={stats?.enrollments ?? "..."} subtitle="Total enrollments" />
        </div>
      )}

      {/* TEACHER DASHBOARD */}
      {role === "teacher" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard title={t("courses")} value={stats?.myCourses ?? "..."} subtitle="My courses" />
          <StatCard title={t("enrollments")} value={stats?.myEnrollments ?? "..."} subtitle="My students" />
        </div>
      )}

      {/* STUDENT DASHBOARD */}
      {role === "student" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard title={t("courses")} value={stats?.myCourses ?? "..."} subtitle="Enrolled courses" />
          <StatCard title={t("enrollments")} value={stats?.myEnrollments ?? "..."} subtitle="My enrollments" />
        </div>
      )}
    </div>
  );
}
