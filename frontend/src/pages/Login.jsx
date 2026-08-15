import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthProvider";
import { BASE_URL } from "../api/base";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { setIsAuthenticated } = useContext(AuthContext);
  const nav = useNavigate();

  const onChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/token/`, {
        username: form.username,
        password: form.password,
      });

      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);

      setIsAuthenticated(true);
      nav("/profile", { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-start justify-center px-6 pt-20 sm:pt-24">
      <section
        aria-labelledby="login-heading"
        className="w-full max-w-[480px] rounded-b-lg border-x border-b border-gray-200 bg-white px-8 pb-11 pt-6 shadow-md"
      >
        <h2
          id="login-heading"
          className="mb-6 text-[32px] font-bold leading-tight text-[#14295d]"
        >
          Sign In
        </h2>

        <form onSubmit={onSubmit} className="space-y-5">
          <label className="block text-[13px] font-semibold text-black">
            Username
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={onChange}
              autoComplete="username"
              required
              className="mt-5 block h-8 w-full rounded-lg border border-black bg-white px-3 text-sm outline-none focus:border-[#14295d] focus:ring-1 focus:ring-[#14295d]"
            />
          </label>

          <label className="block text-[13px] font-semibold text-black">
            Password
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={onChange}
              autoComplete="current-password"
              required
              className="mt-5 block h-8 w-full rounded-lg border border-black bg-white px-3 text-sm outline-none focus:border-[#14295d] focus:ring-1 focus:ring-[#14295d]"
            />
          </label>

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-xs font-semibold text-[#14295d] hover:underline"
          >
            {showPassword ? "Hide password" : "Show password"}
          </button>

          <button
            type="submit"
            className="h-8 w-full rounded-lg bg-[#14295d] text-xs font-semibold text-white transition hover:bg-[#10224e]"
          >
            Login
          </button>
        </form>

        <a
          href="/register"
          className="mt-6 inline-block text-xs font-semibold text-[#14295d] hover:underline"
        >
          Don’t have an account yet?
        </a>
      </section>
    </main>
  );
}