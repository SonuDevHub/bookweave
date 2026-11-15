import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import logo from "../assets/bookweave-logo.png";
import { API_URL, parseJsonSafe } from "../config/api";
import {
  clearAdminSession,
  getAdminToken,
  isSafeAdminRedirect,
  setAdminSession,
} from "../utils/adminAuth";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const requestedPath = location.state?.from?.pathname;
  const redirectTarget = isSafeAdminRedirect(requestedPath) ? requestedPath : "/admin";

  useEffect(() => {
    const existingToken = getAdminToken();
    if (!existingToken) return;

    const controller = new AbortController();

    fetch(`${API_URL}/admin/verify`, {
      headers: { Authorization: `Bearer ${existingToken}` },
      signal: controller.signal,
    })
      .then((response) => {
        if (response.ok) {
          navigate(redirectTarget, { replace: true });
        } else if (response.status === 401 || response.status === 403) {
          clearAdminSession();
        }
      })
      .catch(() => {
        // Ignore network errors while already on login page
      });

    return () => controller.abort();
  }, [navigate, redirectTarget]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await parseJsonSafe(response);

      if (!response.ok || !result.success || !result.token) {
        throw new Error(result.message || "Login failed");
      }

      setAdminSession(result.token, result.admin);

      toast.success("Login successful");
      navigate(redirectTarget, { replace: true });
    } catch (error) {
      toast.error(
        error.message === "Failed to fetch"
          ? "Backend connection failed"
          : error.message,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen min-h-[100dvh] place-items-center bg-cream px-4 py-5 text-text">
      <Link
        to="/"
        aria-label="Back to website"
        className="absolute left-5 top-5 grid size-10 place-items-center rounded-full border border-border text-text transition hover:bg-background"
      >
        <ArrowLeft size={19} strokeWidth={1.7} />
      </Link>

      <section className="w-full max-w-sm rounded-2xl border border-border bg-surface px-7 py-8 shadow-sm sm:px-9">
        <img
          src={logo}
          alt="BookWeave"
          className="mx-auto mb-5 block h-auto max-h-16 w-full max-w-48 object-contain"
        />

        <h1 className="mb-7 text-center font-serif text-2xl font-normal tracking-tight">
          Admin Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="admin-email"
              className="mb-2 block text-sm font-medium"
            >
              Email
            </label>

            <input
              id="admin-email"
              type="email"
              placeholder="Enter email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-lg border border-border bg-background px-3.5 py-3 text-sm text-text outline-none transition placeholder:text-text-muted focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="mb-2 block text-sm font-medium"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-lg border border-border bg-background px-3.5 py-3 pr-12 text-sm text-text outline-none transition placeholder:text-text-muted focus:border-primary"
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-text-muted transition hover:text-text"
              >
                {showPassword ? (
                  <EyeOff size={18} strokeWidth={1.7} />
                ) : (
                  <Eye size={18} strokeWidth={1.7} />
                )}
              </button>
            </div>
          </div>
          <div className="text-right">
            <Link
              to="/admin/forgot-password"
              className="text-sm text-primary transition hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-3.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
