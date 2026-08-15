import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../api/base";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Validate fields
    if (
      !form.username ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    // Validate password confirmation
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      console.log("Sending registration request...");

      const response = await axios.post(
        `${BASE_URL}/api/register/`,
        {
          username: form.username,
          email: form.email,
          password: form.password,
        }
      );

      console.log("Registration successful:", response.data);

      setSuccess("Account created successfully!");

      // Clear form
      setForm({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      // Redirect to login
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      console.error("Registration error:", err);

      // Django responded with an error
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Server response:", err.response.data);

        const data = err.response.data;

        // Username error
        if (data.username) {
          setError(
            Array.isArray(data.username)
              ? data.username.join(" ")
              : data.username
          );
        }

        // Email error
        else if (data.email) {
          setError(
            Array.isArray(data.email)
              ? data.email.join(" ")
              : data.email
          );
        }

        // Password error
        else if (data.password) {
          setError(
            Array.isArray(data.password)
              ? data.password.join(" ")
              : data.password
          );
        }

        // Detail error
        else if (data.detail) {
          setError(data.detail);
        }

        // Other Django error
        else {
          setError(
            `Registration failed (${err.response.status}).`
          );
        }
      }

      // Request was sent but Django didn't respond
      else if (err.request) {
        console.error(
          "No response received from Django:",
          err.request
        );

        setError(
          "Django did not respond. Make sure the Django server is running."
        );
      }

      // Axios/request configuration error
      else {
        console.error("Request error:", err.message);

        setError(`Request error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-start justify-center px-6 pt-16 sm:pt-20">
      <section
        aria-labelledby="register-heading"
        className="w-full max-w-[394px] rounded-b-lg border-x border-b border-gray-200 bg-white px-5 pb-6 pt-5 shadow-md sm:px-5"
      >
        <h2
          id="register-heading"
          className="mb-4 text-[32px] font-bold leading-tight text-[#14295d]"
        >
          Sign Up
        </h2>

        <form
          onSubmit={handleRegister}
          className="space-y-3.5"
        >
          {/* Username */}
          <label className="block text-[13px] font-semibold text-black">
            Username

            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              className="mt-3 block h-8 w-full rounded-lg border border-black bg-white px-3 text-sm outline-none focus:border-[#14295d] focus:ring-1 focus:ring-[#14295d]"
            />
          </label>

          {/* Email */}
          <label className="block text-[13px] font-semibold text-black">
            Email

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              className="mt-3 block h-8 w-full rounded-lg border border-black bg-white px-3 text-sm outline-none focus:border-[#14295d] focus:ring-1 focus:ring-[#14295d]"
            />
          </label>

          {/* Password */}
          <label className="block text-[13px] font-semibold text-black">
            Password

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              className="mt-3 block h-8 w-full rounded-lg border border-black bg-white px-3 text-sm outline-none focus:border-[#14295d] focus:ring-1 focus:ring-[#14295d]"
            />
          </label>

          {/* Confirm Password */}
          <label className="block text-[13px] font-semibold text-black">
            Confirm Password

            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              className="mt-3 block h-8 w-full rounded-lg border border-black bg-white px-3 text-sm outline-none focus:border-[#14295d] focus:ring-1 focus:ring-[#14295d]"
            />
          </label>

          {/* Error message */}
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="rounded-lg bg-green-50 px-3 py-2 text-xs text-green-600">
              {success}
            </div>
          )}

          {/* Register button */}
          <button
            type="submit"
            disabled={loading}
            className="h-8 w-full rounded-lg bg-[#14295d] text-xs font-semibold text-white transition hover:bg-[#10224e] focus:outline-none focus:ring-2 focus:ring-[#14295d] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        {/* Login link */}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="mt-4 inline-block text-xs font-semibold text-[#14295d] hover:underline"
        >
          I already have an account.
        </button>
      </section>
    </main>
  );
}

export default Register;