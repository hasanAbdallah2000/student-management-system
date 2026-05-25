import React from "react";
import { api, endpoints } from "../api/api.js";
import Toast from "../components/common/Toast";
import { useLang } from "../i18n/lang.jsx";

export default function EnrollmentsPage() {
  const { t } = useLang();
  const [items, setItems] = React.useState([]);
  const [toast, setToast] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const [addOpen, setAddOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);

  const [students, setStudents] = React.useState([]);
  const [courses, setCourses] = React.useState([]);

  const [studentId, setStudentId] = React.useState("");
  const [courseId, setCourseId] = React.useState("");
  
  const [deleteId, setDeleteId] = React.useState(null);
  const [deleting, setDeleting] = React.useState(false);

  const [editingId, setEditingId] = React.useState(null);
 const [gradeDraft, setGradeDraft] = React.useState("");
  const [savingGrade, setSavingGrade] = React.useState(false);


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

  async function loadFormData() {
  try {
    const [usersRes, coursesRes] = await Promise.all([
      api.get(endpoints.users),
      api.get(endpoints.courses),
    ]);

    const usersPayload = usersRes.data;
    const usersList = usersPayload?.data ?? usersPayload?.users ?? usersPayload ?? [];
    const onlyStudents = Array.isArray(usersList)
      ? usersList.filter((u) => u.role === "student")
      : [];

    const coursesPayload = coursesRes.data;
    const coursesList = coursesPayload?.data ?? coursesPayload?.courses ?? coursesPayload ?? [];

    setStudents(onlyStudents);
    setCourses(Array.isArray(coursesList) ? coursesList : []);
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      t("serverError");
    setToast({ type: "error", message: msg });
  }
}

async function createEnrollment(e) {
  e.preventDefault();
  if (!studentId || !courseId) {
    setToast({ type: "error", message: "Select student and course" });
    return;
  }

  setCreating(true);
  try {
    await api.post(endpoints.enrollments, {
      student_id: Number(studentId),
      course_id: Number(courseId),
    });

    setToast({ type: "success", message: "Enrollment created" });
    setAddOpen(false);
    setStudentId("");
    setCourseId("");
    load();
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      t("serverError");
    setToast({ type: "error", message: msg });
  } finally {
    setCreating(false);
  }
}
function handleDelete(id) {
  setDeleteId(id);
}

function startEditGrade(enrollment) {
  setEditingId(enrollment.id);
  const current = enrollment.grade ?? "";
  setGradeDraft(current === null ? "" : String(current));
}

function cancelEditGrade() {
  setEditingId(null);
  setGradeDraft("");
}

async function saveGrade(enrollmentId) {
  // validation (0-100)
  const value = gradeDraft.trim();

  if (value === "") {
    setToast({ type: "error", message: "Grade is required" });
    return;
  }

  const num = Number(value);
  if (!Number.isFinite(num) || num < 0 || num > 100) {
    setToast({ type: "error", message: "Grade must be between 0 and 100" });
    return;
  }

  setSavingGrade(true);
  try {
    await api.patch(`${endpoints.enrollments}/${enrollmentId}/grade`, {
      grade: num,
    });

    setToast({ type: "success", message: "Grade updated" });
    cancelEditGrade();
    load();
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      t("serverError");
    setToast({ type: "error", message: msg });
  } finally {
    setSavingGrade(false);
  }
}

async function confirmDelete() {
  if (!deleteId) return;

  setDeleting(true);
  try {
    await api.delete(`${endpoints.enrollments}/${deleteId}`);
    setToast({ type: "success", message: "Enrollment deleted" });
    setDeleteId(null);
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


async function load() {
  setLoading(true);
  try {
    const res = await api.get(endpoints.enrollments);
    const payload = res.data;
    const list = payload?.data ?? payload?.enrollments ?? payload ?? [];
    setItems(Array.isArray(list) ? list : []);
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      t("unauthorized");
    setToast({ type: "error", message: msg });
  } finally {
    setLoading(false);
  }
}
  React.useEffect(() => {
    load();
    loadFormData();
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
    className="btn-primary"
    type="button"
    onClick={async () => {
      setAddOpen(true);
      await loadFormData();
    }}
  >
    Add enrollment
  </button>

  <button
    className="btn-ghost"
    type="button"
    onClick={() => load()}
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
                <th className="p-3 text-right">Actions</th>
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
                    {(() => {
                    const sid = e.student_id ?? e.studentId;
                    const s = students.find((x) => String(x.id) === String(sid));
                    return s ? (s.full_name || s.fullName || s.email) : (sid ?? "-");
                      })()}
                      </td>

                    <td className="p-3 text-slate-700">
                       {(() => {
                      const cid = e.course_id ?? e.courseId;
                      const c = courses.find((x) => String(x.id) === String(cid));
                      return c ? (c.title || c.name || `Course #${c.id}`) : (cid ?? "-");
                          })()}
                      </td>
                    <td className="p-3">
                    {editingId === e.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          className="input w-24"
                          value={gradeDraft}
                          onChange={(ev) => setGradeDraft(ev.target.value)}
                          type="number"
                          min="0"
                          max="100"
                          onKeyDown={(ev) => {
                            if (ev.key === "Enter") saveGrade(e.id);
                            if (ev.key === "Escape") cancelEditGrade();
                          }}
                          disabled={savingGrade}
                          autoFocus
                        />

                        <button
                          type="button"
                          className="btn-primary"
                          disabled={savingGrade}
                          onClick={() => saveGrade(e.id)}
                        >
                          {savingGrade ? "Saving..." : "Save"}
                        </button>

                        <button
                          type="button"
                          className="btn-ghost"
                          disabled={savingGrade}
                          onClick={cancelEditGrade}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-slate-100 text-slate-700 hover:bg-slate-200"
                        onClick={() => startEditGrade(e)}
                        title="Click to edit grade"
                      > 
                        {e.grade ?? "-"}
                      </button>
                    )}
                  </td>
                    <td className="p-3 text-right">
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(e.id)}
                    >
                      Delete
                    </button>
                  </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
  open={addOpen}
  title="Add Enrollment"
  onClose={() => {
    if (!creating) setAddOpen(false);
  }}
>
  <form className="space-y-3" onSubmit={createEnrollment}>
    <div>
      <div className="label mb-1">Student</div>
      <select
        className="input"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        required
      >
        <option value="">Select student</option>
        {students.map((s) => (
          <option key={s.id} value={s.id}>
            {s.full_name || s.fullName || s.email}
          </option>
        ))}
      </select>
    </div>

    <div>
      <div className="label mb-1">Course</div>
      <select
        className="input"
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        required
      >
        <option value="">Select course</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title || c.name || `Course #${c.id}`}
          </option>
        ))}
      </select>
    </div>

    <div className="flex items-center justify-end gap-2 pt-2">
      <button
        type="button"
        className="btn-ghost"
        disabled={creating}
        onClick={() => setAddOpen(false)}
      >
        Cancel
      </button>
      <button className="btn-primary" type="submit" disabled={creating}>
        {creating ? "Creating..." : "Create"}
      </button>
    </div>
  </form>
</Modal>
<Modal
  open={deleteId !== null}
  title="Confirm Delete"
  onClose={() => !deleting && setDeleteId(null)}
>
  <div className="space-y-4">
    <p className="text-sm text-slate-600">
      Are you sure you want to delete this enrollment?
    </p>

    <div className="flex justify-end gap-2">
      <button
        type="button"
        className="btn-ghost"
        disabled={deleting}
        onClick={() => setDeleteId(null)}
      >
        Cancel
      </button>

      <button
        type="button"
        className="btn-danger"
        disabled={deleting}
        onClick={confirmDelete}
      >
        {deleting ? "Deleting..." : "Delete"}
      </button>
    </div>
  </div>
</Modal>
      {/* small hint (short + professional) */}
      <p className="text-xs text-slate-500">
        Tip: Use the Courses and Users sections to manage related data.
      </p>
    </div>
  );
}

