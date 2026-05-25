import React from "react";
import { api, endpoints } from "../api/api.js";
import Toast from "../components/common/Toast";
import { useLang } from "../i18n/lang";

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

export default function UsersPage() {
  const { t } = useLang();
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  const [open, setOpen] = React.useState(false);
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState("student");
  const [avatarUrl, setAvatarUrl] = React.useState("");

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [deleting, setDeleting] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [editId, setEditId] = React.useState(null);

  const [editFullName, setEditFullName] = React.useState("");
  const [editEmail, setEditEmail] = React.useState("");
  const [editRole, setEditRole] = React.useState("student");
  const [editAvatarUrl, setEditAvatarUrl] = React.useState("");


  async function load() {
    setLoading(true);
    try {
      const res = await api.get(endpoints.users);
      // expected: { users: [...] } or directly array
      const payload = res.data;
      const list = payload?.data ?? payload?.users ?? payload ?? [];
      setItems(Array.isArray(list) ? list : []);
      console.log("USERS RESPONSE:", res.data);
    } catch (err) {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    t("unauthorized");
      console.log("ERROR:", err?.response?.data);
  setToast({ type: "error", message: msg });
  } finally{
    setLoading(false);
  }
  }

  React.useEffect(() => { load(); }, []);

  async function createUser(e) {
    e.preventDefault();
    setToast(null);
    try {
      await api.post(endpoints.users, {
        fullName,
        email,
        password,
        role,
        avatarUrl: avatarUrl || null
      });
      setOpen(false);
      setFullName(""); setEmail(""); setPassword(""); setRole("student"); setAvatarUrl("");
      setToast({ type: "success", message: "Created successfully" });
      load();
    } catch (err) {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    t("serverError");

  setToast({ type: "error", message: msg });
}
  }

  async function updateUser(e) {
  e.preventDefault();
  if (!editId) return;

  setEditing(true);
  setToast(null);

  try {
    await api.patch(`${endpoints.users}/${editId}`, {
      fullName: editFullName,
      email: editEmail,
      role: editRole,
      avatarUrl: editAvatarUrl || null,
    });

    setToast({ type: "success", message: "Updated successfully" });
    setEditOpen(false);
    load();
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      t("serverError");
    setToast({ type: "error", message: msg });
  } finally {
    setEditing(false);
  }
}

  function openEdit(u) {
  setEditId(u.id);
  setEditFullName(u.full_name || "");
  setEditEmail(u.email || "");
  setEditRole(u.role || "student");
  setEditAvatarUrl(u.avatar_url || "");
  setEditOpen(true);
}

async function del(id) {
  if (!id) return;
  setDeleting(true);

  try {
    await api.delete(`${endpoints.users}/${id}`);
    setToast({ type: "success", message: "Deleted" });

    setConfirmOpen(false);
    setSelectedUser(null);

    load();
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      t("serverError");
    setToast({ type: "error", message: msg });
  } finally {
    setDeleting(false);
  }
}

  return (
    <div className="space-y-4">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{t("users")}</div>
          <div className="text-sm text-slate-500">/users (admin only)</div>
        </div>
        <button className="btn-primary" onClick={() => setOpen(true)}>{t("addUser")}</button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left">
                <th className="p-3">{t("fullName")}</th>
                <th className="p-3">{t("email")}</th>
                <th className="p-3">{t("role")}</th>
                <th className="p-3">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="p-4 text-slate-500" colSpan="4">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="p-4 text-slate-500" colSpan="4">No data</td></tr>
              ) : items.map(u => (
                <tr key={u.id} className="border-b border-slate-100">
                  <td className="p-3">{u.full_name || "-"}</td>
                  <td className="p-3">{u.email || "-"}</td>
                  <td className="p-3">{u.role || "-"}</td>
                  <td className="p-3">
                  <button className="btn-ghost" onClick={() => openEdit(u)}>
                    Edit
                  </button>
                  <button className={`btn-ghost ${u.role === "admin" ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={u.role === "admin"}
                    onClick={() => {
                    setSelectedUser(u);
                    setConfirmOpen(true);
                    }}>
                    {t("delete")}
                  </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={confirmOpen} title={t("confirmDelete") || "Confirm delete"} onClose={() => {
      if (!deleting) {
      setConfirmOpen(false);
      setSelectedUser(null);
    }
  }}
>
  <div className="space-y-4">
    <div className="text-slate-700">
      {t("deleteUserConfirm") || "Are you sure you want to delete this user?"}
      {selectedUser?.email ? (
        <div className="mt-2 text-sm text-slate-500">
          {selectedUser.email}
        </div>
      ) : null}
    </div>

    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        className="btn-ghost"
        disabled={deleting}
        onClick={() => {
          setConfirmOpen(false);
          setSelectedUser(null);
        }}
      >
        {t("cancel")}
      </button>

      <button
        type="button"
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        disabled={deleting}
        onClick={() => del(selectedUser?.id)}
      >
        {deleting ? (t("deleting") || "Deleting...") : t("delete")}
      </button>
    </div>
  </div>
</Modal>

      <Modal open={open} title={t("addUser")} onClose={() => setOpen(false)}>
        <form className="space-y-3" onSubmit={createUser}>
          <div>
            <div className="label mb-1">{t("fullName")}</div>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <div className="label mb-1">{t("email")}</div>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <div className="label mb-1">{t("password")}</div>
            <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </div>
          <div>
            <div className="label mb-1">{t("role")}</div>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">student</option>
              <option value="teacher">teacher</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div>
            <div className="label mb-1">Avatar URL (optional)</div>
            <input className="input" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>{t("cancel")}</button>
            <button className="btn-primary" type="submit">{t("create")}</button>
          </div>
        </form>
      </Modal>

      <Modal open={editOpen} title="Edit User" onClose={() => !editing && setEditOpen(false)}>
  <form className="space-y-3" onSubmit={updateUser}>
    <div>
      <div className="label mb-1">{t("fullName")}</div>
      <input
        className="input"
        value={editFullName}
        onChange={(e) => setEditFullName(e.target.value)}
        required
      />
    </div>

    <div>
      <div className="label mb-1">{t("email")}</div>
      <input
        className="input"
        value={editEmail}
        onChange={(e) => setEditEmail(e.target.value)}
        required
      />
    </div>

    <div>
      <div className="label mb-1">{t("role")}</div>
      <select
        className="input"
        value={editRole}
        onChange={(e) => setEditRole(e.target.value)}
        disabled={editRole === "admin"} // optional
      >
        <option value="student">student</option>
        <option value="teacher">teacher</option>
        <option value="admin">admin</option>
      </select>

      {/* optional: منع تغيير admin */}
      {editRole === "admin" && (
        <div className="text-xs text-slate-500 mt-1">Admin role is locked.</div>
      )}
    </div>

    <div>
      <div className="label mb-1">Avatar URL (optional)</div>
      <input
        className="input"
        value={editAvatarUrl}
        onChange={(e) => setEditAvatarUrl(e.target.value)}
      />
    </div>

    <div className="flex items-center justify-end gap-2 pt-2">
      <button type="button" className="btn-ghost" onClick={() => setEditOpen(false)} disabled={editing}>
        {t("cancel")}
      </button>
      <button className="btn-primary" type="submit" disabled={editing}>
        {editing ? "Saving..." : "Save"}
      </button>
    </div>
  </form>
</Modal>

    </div>
  );
}
