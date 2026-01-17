import React from "react";
import { api, endpoints } from "../api/api.js";
import Toast from "../components/common/Toast.jsx";
import { useLang } from "../i18n/lang.jsx";
import { getUser } from "../api/auth.api.js"; // فوق مع imports


const role = getUser()?.role || "student";
const canManage = role === "admin" || role === "teacher";
  

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4">
      <div className="card w-full max-w-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">{title}</div>
          <button className="btn-ghost" onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const { t } = useLang();
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);

  const [code, setCode] = React.useState("");
  const [name, setName] = React.useState("");
  const [credits, setCredits] = React.useState(3);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get(endpoints.courses);
      const data = res.data?.courses || res.data || [];
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err?.response?.data?.error || t("serverError");
      setToast({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setCode(""); setName(""); setCredits(3);
    setOpen(true);
  }

  function openEdit(c) {
    setEditing(c);
    setCode(c.code || "");
    setName(c.name || "");
    setCredits(c.credits ?? 3);
    setOpen(true);
  }

  async function saveCourse(e) {
    e.preventDefault();
    setToast(null);
    try {
      if (editing?.id) {
        await api.put(`${endpoints.courses}/${editing.id}`, { code, name, credits: Number(credits) });
        setToast({ type: "success", message: "Updated" });
      } else {
        await api.post(endpoints.courses, { code, name, credits: Number(credits) });
        setToast({ type: "success", message: "Created" });
      }
      setOpen(false);
      load();
    } catch (err) {
      const msg = err?.response?.data?.error || t("serverError");
      setToast({ type: "error", message: msg });
    }
  }

  async function del(id) {
    if (!confirm("Delete this course?")) return;
    try {
      await api.delete(`${endpoints.courses}/${id}`);
      setToast({ type: "success", message: "Deleted" });
      load();
    } catch (err) {
      const msg = err?.response?.data?.error || t("serverError");
      setToast({ type: "error", message: msg });
    }
  }

  return (
    <div className="space-y-4">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{t("courses")}</div>
          <div className="text-sm text-slate-500">/courses</div>
        </div>
        {canManage && (
  <button className="btn-primary" onClick={openCreate}>{t("addCourse")}</button>
)}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left">
                <th className="p-3">{t("code")}</th>
                <th className="p-3">{t("name")}</th>
                <th className="p-3">{t("credits")}</th>
                {canManage && <th className="p-3">{t("actions")}</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="p-4 text-slate-500" colSpan={canManage ? 4 : 3}>Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="p-4 text-slate-500" colSpan={canManage ? 4 : 3}>No data</td></tr>
              ) : items.map(c => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="p-3">{c.code}</td>
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.credits}</td>
                  {canManage && (
                  <td className="p-3">
                  <button className="btn-ghost" onClick={() => openEdit(c)}>{t("edit")}</button>
                  <button className="btn-ghost" onClick={() => del(c.id)}>{t("delete")}</button>
                   </td>
                  )}

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={open} title={editing ? `${t("edit")} ${t("courses")}` : t("addCourse")} onClose={() => setOpen(false)}>
        <form className="space-y-3" onSubmit={saveCourse}>
          <div>
            <div className="label mb-1">{t("code")}</div>
            <input className="input" value={code} onChange={(e) => setCode(e.target.value)} required />
          </div>
          <div>
            <div className="label mb-1">{t("name")}</div>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <div className="label mb-1">{t("credits")}</div>
            <input className="input" type="number" value={credits} onChange={(e) => setCredits(e.target.value)} min="0" />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>{t("cancel")}</button>
            <button className="btn-primary" type="submit">{t("save")}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
