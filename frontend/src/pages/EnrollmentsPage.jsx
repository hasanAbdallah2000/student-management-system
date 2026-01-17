import React from "react";
import { api, endpoints } from "../api/api.js";
import Toast from "../components/common/Toast";
import { useLang } from "../i18n/lang.jsx";

export default function EnrollmentsPage() {
  const { t } = useLang();
  const [items, setItems] = React.useState([]);
  const [toast, setToast] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get(endpoints.enrollments);
      const data = res.data?.enrollments || res.data || [];
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err?.response?.data?.error || t("unauthorized");
      setToast({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {t("enrollments")}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View and manage student enrollments.
          </p>
        </div>

        <button
          className="btn-ghost"
          onClick={load}
          disabled={loading}
          title="Refresh"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="text-sm font-medium text-slate-900">Enrollments</div>
          <div className="text-xs text-slate-500">
            {loading ? "Loading..." : `${items.length} records`}
          </div>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-600">
                <th className="p-3">ID</th>
                <th className="p-3">Student</th>
                <th className="p-3">Course</th>
                <th className="p-3">Grade</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="p-4 text-slate-500" colSpan="4">
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="p-10 text-center text-slate-500" colSpan="4">
                    <div className="text-sm font-medium">No enrollments yet</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Once students enroll in courses, they will appear here.
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-900">{e.id}</td>
                    <td className="p-3 text-slate-700">
                      {e.student_id ?? e.studentId ?? "-"}
                    </td>
                    <td className="p-3 text-slate-700">
                      {e.course_id ?? e.courseId ?? "-"}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-slate-100 text-slate-700">
                        {e.grade ?? "-"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* small hint (short + professional) */}
      <p className="text-xs text-slate-500">
        Tip: Use the Courses and Users sections to manage related data.
      </p>
    </div>
  );
}

