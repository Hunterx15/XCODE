import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

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

// ---------- PROTECTED ROUTE ----------
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) return null; // block navigation
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// ---------- ADMIN ROUTE ----------
function AdminRoute({ children }) {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  if (loading) return null;
  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const dispatch = useDispatch();
  const { loading, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Global loading screen (ONLY once)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <Routes>
      {/* ---------- PUBLIC ROUTES ---------- */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />

      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />}
      />

      {/* ---------- PROTECTED ROUTES ---------- */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Homepage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/problem/:problemId"
        element={
          <ProtectedRoute>
            <ProblemPage />
          </ProtectedRoute>
        }
      />

      {/* ---------- ADMIN ROUTES ---------- */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/create"
        element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/delete"
        element={
          <AdminRoute>
            <AdminDelete />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/video"
        element={
          <AdminRoute>
            <AdminVideo />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/upload/:problemId"
        element={
          <AdminRoute>
            <AdminUpload />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

export default App;
