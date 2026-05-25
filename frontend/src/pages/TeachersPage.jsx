import React from "react";
import { api } from "../api/api.js";
import Toast from "../components/common/Toast";
import { useLang } from "../i18n/lang.jsx";

function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4">
      <div className="card w-full max-w-2xl p-5 bg-white rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">{title}</div>
          <button className="btn-ghost text-xl leading-none" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const emptyForm = {
  full_name: "",
  email: "",
  password: "",
};

export default function TeachersPage() {
  const { t } = useLang();

  const [teachers, setTeachers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");

  const [toast, setToast] = React.useState({
    show: false,
    message: "",
    type: "success",
  });

  const [openAdd, setOpenAdd] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);

  const [form, setForm] = React.useState(emptyForm);
  const [editingTeacher, setEditingTeacher] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);

  const [openAssign , setOpenAssign] = React.useState(false);
  const [assigningTeacher, setAssigningTeacher] = React.useState(null);
  const [allCourses , setAllCourses] = React.useState([]);
  const [selectedCourseIds , setSelectedCourseIds] = React.useState([]);
  const [savingAssignments , setSavingAssignments] = React.useState(false);

  function showToast(message, type = "success") {
    setToast({ show: true, message, type });
  }

  async function loadTeachers() {
  try {
    setLoading(true);

    const res = await api.get("/users/teachers");
    const teachersData = Array.isArray(res.data?.data) ? res.data.data : [];

    setTeachers(
      teachersData.map((t) => ({
        ...t,
        courses: t.courses ?? [],
      }))
    );
  } catch (err) {
    setTeachers([]);
    showToast("Failed to load teachers", "error");
  } finally {
    setLoading(false);
  }
}

  React.useEffect(() => {
    loadTeachers();
  }, []);

  const filteredTeachers = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teachers;

    return teachers.filter((teacher) => {
      const name = teacher.full_name?.toLowerCase() || "";
      const email = teacher.email?.toLowerCase() || "";
      return name.includes(q) || email.includes(q);
    });
  }, [teachers, query]);

  function openAddModal() {
    setForm(emptyForm);
    setOpenAdd(true);
  }

  async function openAssignModal(teacher) {
    try {
      setAssigningTeacher(teacher);

      const res = await api.get(`/users/teachers/${teacher.id}/courses`)
      const data = res.data?.data || {};

      setAllCourses(Array.isArray(data.courses) ? data.courses : []);
      setSelectedCourseIds(
        Array.isArray(data.assignedCourseIds) ? data.assignedCourseIds : []
      );

      setOpenAssign(true);
    }catch(err){
      const msg = err?.response?.data?.message || err?.response?.data?.error || "Failed to load teacher courses";
      showToast(msg , "error")
    }
  }

  function toggleCourse(courseId){
    setSelectedCourseIds((prev) => 
    prev.includes(courseId)
  ? prev.filter((id) => id !== courseId) : [...prev , courseId]);
  }

  async function handleSaveAssignments() {
    if (!assigningTeacher) return;
    try { 
      setSavingAssignments(true);
      await api.put(`/users/teachers/${assigningTeacher.id}/courses`,{
        courseIds: selectedCourseIds,
      });
      showToast("Teacher courses updated successfully");
      setOpenAssign(false);
      setAssigningTeacher(null);
      setAllCourses([]);
      setSelectedCourseIds([]);
      await loadTeachers();
    }catch (err){
      const msg = 
      err?.response?.data?.message || 
      err?.response?.data?.error ||
      "Failed to save teacher courses";
      showToast(msg , "error");
    }finally {
      setSavingAssignments(false);
    } 
  }

  function openEditModal(teacher) {
    setEditingTeacher(teacher);
    setForm({
      full_name: teacher.full_name || "",
      email: teacher.email || "",
      password: "",
    });
    setOpenEdit(true);
  }

  function closeModals() {
    setOpenAdd(false);
    setOpenEdit(false);
    setEditingTeacher(null);
    setForm(emptyForm);
  }

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleAddTeacher(e) {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.password) {
      showToast("Please fill all fields", "error");
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/users", {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: "teacher",
      });

      showToast("Teacher added successfully");
      closeModals();
      loadTeachers();
    } catch (err) {
      const msg = err?.response?.data?.message || 
      err?.response?.data?.message ||
      "Failed to add teacher";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditTeacher(e) {
    e.preventDefault();
    if (!editingTeacher) return;

    if (!form.full_name || !form.email) {
      showToast("Name and email are required", "error");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        full_name: form.full_name,
        email: form.email,
        role: "teacher",
      };

      if (form.password?.trim()) {
        payload.password = form.password;
      }

      await api.put(`/users/${editingTeacher.id}`, payload);

      showToast("Teacher updated successfully");
      closeModals();
      loadTeachers();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to update teacher";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteTeacher(teacher) {
    const ok = window.confirm(
      `Delete teacher "${teacher.full_name}"?`
    );
    if (!ok) return;

    try {
      await api.delete(`/users/${teacher.id}`);
      showToast("Teacher deleted successfully");
      loadTeachers();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to delete teacher";
      showToast(msg, "error");
    }
  }

  return (
    <div className="space-y-6">
      <Toast
        open={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      <div className="card p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-2xl font-semibold">Teachers</div>
            <div className="text-sm text-slate-500 mt-1">
              Manage teacher accounts and their access
            </div>
          </div>

          <button className="btn-primary" onClick={openAddModal}>
            Add Teacher
          </button>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="text-sm text-slate-600">
            Total teachers:{" "}
            <span className="font-semibold text-slate-900">
              {filteredTeachers.length}
            </span>
          </div>

          <input
            type="text"
            placeholder="Search by name or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input w-full md:w-80"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-slate-100 text-slate-700 text-sm">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">#</th>
                <th className="text-left px-4 py-3 font-semibold">Full Name</th>
                <th className="text-left px-4 py-3 font-semibold">Email</th>
                <th className="text-left px-4 py-3 font-semibold">Assigned Courses</th>
                <th className="text-left px-4 py-3 font-semibold">Role</th>
                <th className="text-left px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                    Loading teachers...
                  </td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                    No teachers found
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher, index) => (
                  <tr key={teacher.id} className="border-t border-slate-200">
                    {console.log("teacher:", teacher)}
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">
                        {teacher.full_name}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {teacher.email}
                    </td>

                 <td className="px-4 py-3 text-slate-700">
                  <div className="flex items-center justify-between gap-2">
                    
                    <span className="text-sm text-slate-600">
                      {teacher.assigned_courses > 0
                        ? `${teacher.assigned_courses} assigned`
                        : "0 assigned"}
                    </span>

                    <button
                      className="text-sm text-indigo-600 hover:underline"
                      onClick={() => openAssignModal(teacher)}
                    >
                      Assign Courses
                    </button>

                  </div>
                </td>
                

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 px-2.5 py-1 text-xs font-medium">
                        {teacher.role || "teacher"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">

                        <button
                          className="btn-ghost"
                          onClick={() => openEditModal(teacher)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn-ghost text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteTeacher(teacher)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={openAdd} title="Add Teacher" onClose={closeModals}>
        <form onSubmit={handleAddTeacher} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              className="input"
              name="full_name"
              value={form.full_name}
              onChange={onChange}
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              className="input"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="Enter email"
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              className="input"
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              placeholder="Enter password"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={closeModals}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save Teacher"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={openEdit} title="Edit Teacher" onClose={closeModals}>
        <form onSubmit={handleEditTeacher} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              className="input"
              name="full_name"
              value={form.full_name}
              onChange={onChange}
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              className="input"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="Enter email"
            />
          </div>

          <div>
            <label className="label">New Password (optional)</label>
            <input
              className="input"
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              placeholder="Leave empty to keep current password"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={closeModals}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Updating..." : "Update Teacher"}
            </button>
          </div>
        </form>
      </Modal>
      <Modal
  open={openAssign}
  title={`Assign Courses${assigningTeacher ? ` - ${assigningTeacher.full_name}` : ""}`}
  onClose={() => {
    setOpenAssign(false);
    setAssigningTeacher(null);
    setAllCourses([]);
    setSelectedCourseIds([]);
  }}
>
  <div className="space-y-4">
    <div className="text-sm text-slate-500">
      Select the courses assigned to this teacher.
    </div>

    <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-xl p-3 space-y-2">
      {allCourses.length === 0 ? (
        <div className="text-sm text-slate-500">No courses found</div>
      ) : (
        allCourses.map((course) => (
          <label
            key={course.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedCourseIds.includes(course.id)}
              onChange={() => toggleCourse(course.id)}
            />
            <span className="text-sm text-slate-800">{course.name}</span>
          </label>
        ))
      )}
    </div>

    <div className="flex justify-end gap-2 pt-2">
      <button
        type="button"
        className="btn-ghost"
        onClick={() => {
          setOpenAssign(false);
          setAssigningTeacher(null);
          setAllCourses([]);
          setSelectedCourseIds([]);
        }}
      >
        Cancel
      </button>

      <button
        type="button"
        className="btn-primary"
        onClick={handleSaveAssignments}
        disabled={savingAssignments}
      >
        {savingAssignments ? "Saving..." : "Save Assignments"}
      </button>
    </div>
  </div>
</Modal>
    </div>
  );
}