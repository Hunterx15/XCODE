import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";

import { registerUser } from "../authSlice";

/* ---------------- VALIDATION SCHEMA ---------------- */
const signupSchema = z.object({
  firstName: z
    .string()
    .min(3, "Minimum character should be 3"),
  emailId: z.string().email("Invalid Email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

/* ---------------- COMPONENT ---------------- */
function Signup() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(
    (state) => state.auth
  );

  const [showPassword, setShowPassword] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = (data) => {
    dispatch(registerUser(data));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-3xl mb-6">
            XCODE
          </h2>

          {/* ---------------- ERROR ---------------- */}
          {error && (
            <div className="alert alert-error mb-4 text-sm">
              {error}
            </div>
          )}

          {/* ---------------- FORM ---------------- */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* FIRST NAME */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  First Name
                </span>
              </label>
              <input
                type="text"
                placeholder="John"
                className={`input input-bordered w-full ${
                  errors.firstName
                    ? "input-error"
                    : ""
                }`}
                {...register("firstName")}
              />
              {errors.firstName && (
                <span className="text-error text-sm mt-1">
                  {errors.firstName.message}
                </span>
              )}
            </div>

            {/* EMAIL */}
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">
                  Email
                </span>
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                className={`input input-bordered w-full ${
                  errors.emailId
                    ? "input-error"
                    : ""
                }`}
                {...register("emailId")}
              />
              {errors.emailId && (
                <span className="text-error text-sm mt-1">
                  {errors.emailId.message}
                </span>
              )}
            </div>

            {/* PASSWORD */}
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">
                  Password
                </span>
              </label>

              <div className="relative">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="••••••••"
                  className={`input input-bordered w-full pr-10 ${
                    errors.password
                      ? "input-error"
                      : ""
                  }`}
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              {errors.password && (
                <span className="text-error text-sm mt-1">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* SUBMIT */}
            <div className="form-control mt-8">
              <button
                type="submit"
                className={`btn btn-primary w-full ${
                  loading
                    ? "loading btn-disabled"
                    : ""
                }`}
                disabled={loading}
              >
                {loading
                  ? "Signing Up..."
                  : "Sign Up"}
              </button>
            </div>
          </form>

          {/* LOGIN LINK */}
          <div className="text-center mt-6">
            <span className="text-sm">
              Already have an account?{" "}
              <NavLink
                to="/login"
                className="link link-primary"
              >
                Login
              </NavLink>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
