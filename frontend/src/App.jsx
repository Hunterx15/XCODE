import { Routes, Route, Navigate } from "react-router";
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

function App() {
  const dispatch = useDispatch();

  const { isAuthenticated, user, loading } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  const Loader = () => (
    <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  );

  return (
    <Routes>
      {/* ROOT (PROTECTED) */}
      <Route
        path="/"
        element={
          loading ? (
            <Loader />
          ) : isAuthenticated ? (
            <Homepage />
          ) : (
            <Navigate to="/signup" replace />
          )
        }
      />

      {/* AUTH (PUBLIC) */}
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
          loading ? (
            <Loader />
          ) : isAuthenticated && user?.role === "admin" ? (
            <Admin />
          ) : (
            <Navigate to="/signup" replace />
          )
        }
      />

      <Route
        path="/admin/create"
        element={
          loading ? (
            <Loader />
          ) : isAuthenticated && user?.role === "admin" ? (
            <AdminPanel />
          ) : (
            <Navigate to="/signup" replace />
          )
        }
      />

      <Route
        path="/admin/delete"
        element={
          loading ? (
            <Loader />
          ) : isAuthenticated && user?.role === "admin" ? (
            <AdminDelete />
          ) : (
            <Navigate to="/signup" replace />
          )
        }
      />

      <Route
        path="/admin/video"
        element={
          loading ? (
            <Loader />
          ) : isAuthenticated && user?.role === "admin" ? (
            <AdminVideo />
          ) : (
            <Navigate to="/signup" replace />
          )
        }
      />

      <Route
        path="/admin/upload/:problemId"
        element={
          loading ? (
            <Loader />
          ) : isAuthenticated && user?.role === "admin" ? (
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
