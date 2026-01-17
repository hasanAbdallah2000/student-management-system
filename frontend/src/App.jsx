import React from "react";
import { Routes, Route } from "react-router-dom";
import RequireAuth from "./components/common/RequireAuth";
import Layout from "./components/layout/layout.jsx";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import CoursesPage from "./pages/CoursesPage";
import EnrollmentsPage from "./pages/EnrollmentsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="enrollments" element={<EnrollmentsPage />} />
      </Route>

      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
}
