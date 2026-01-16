import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";

import { checkAuth } from "./authSlice";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Homepage from "./pages/Homepage";
import ProblemPage from "./pages/ProblemPage";

import Admin from "./pages/Admin";
import AdminPanel from "./components/AdminPanel";
import AdminVideo from "./components/AdminVideo";
import AdminDelete from "./components/AdminDelete";
import AdminUpload from "./components/AdminUpload";

function App() {
  const dispatch = useDispatch();

  // 🔒 prevents multiple auth calls (StrictMode + re-render safe)
  const authChecked = useRef(false);

  const { isAuthenticated, user, loading } = useSelector(
    (state) => state.auth
  );

  // ✅ run auth check ONLY ONCE
  useEffect(() => {
    if (!authChecked.current) {
      authChecked.current = true;
      dispatch(checkAuth());
    }
  }, [dispatch]);

  // ⏳ global loader
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <Routes>
      {/* ROOT (PROTECTED) */}
      <Route
        path="/"
        element={
          isAuthenticated ? <Homepage /> : <Navigate to="/signup" replace />
        }
      />

      {/* AUTH ROUTES */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login />
        }
      />

      <Route
        path="/signup"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Signup />
        }
      />

      {/* PUBLIC */}
      <Route path="/problem/:problemId" element={<ProblemPage />} />

      {/* ADMIN ROUTES */}
      <Route
        path="/admin"
        element={
          isAuthenticated && user?.role === "admin" ? (
            <Admin />
          ) : (
            <Navigate to="/signup" replace />
          )
        }
      />

      <Route
        path="/admin/create"
        element={
          isAuthenticated && user?.role === "admin" ? (
            <AdminPanel />
          ) : (
            <Navigate to="/signup" replace />
          )
        }
      />

      <Route
        path="/admin/delete"
        element={
          isAuthenticated && user?.role === "admin" ? (
            <AdminDelete />
          ) : (
            <Navigate to="/signup" replace />
          )
        }
      />

      <Route
        path="/admin/video"
        element={
          isAuthenticated && user?.role === "admin" ? (
            <AdminVideo />
          ) : (
            <Navigate to="/signup" replace />
          )
        }
      />

      <Route
        path="/admin/upload/:problemId"
        element={
          isAuthenticated && user?.role === "admin" ? (
            <AdminUpload />
          ) : (
            <Navigate to="/signup" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
