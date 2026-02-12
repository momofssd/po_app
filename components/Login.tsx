import React, { useState } from "react";
import { authService } from "../services/authService";
import { User } from "../types";

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const user = await authService.login(username, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-apple-bg relative overflow-hidden">
      <div className="w-full max-w-[400px] p-6 relative z-10">
        <div className="bg-white rounded-3xl shadow-apple border border-white/50 p-10 backdrop-blur-xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-apple-text text-white mb-6 shadow-xl shadow-slate-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-apple-text tracking-tight">
              Sign in to PO Extractor
            </h2>
            <p className="text-[15px] text-apple-subtext mt-3 font-light">
              Welcome back. Please enter your details.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50/50 border border-slate-200 text-apple-text placeholder:text-apple-subtext focus:outline-none focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue transition-all"
                placeholder="Username"
                required
              />
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50/50 border border-slate-200 text-apple-text placeholder:text-apple-subtext focus:outline-none focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue transition-all"
                placeholder="Password"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600 flex items-start">
                <svg
                  className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full py-3.5 px-4 rounded-xl text-white font-medium shadow-lg shadow-blue-500/20
                transition-all duration-200 text-[15px]
                ${
                  isLoading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-apple-blue hover:bg-apple-blueHover hover:shadow-blue-500/30 active:scale-[0.98]"
                }
              `}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <div className="inline-block px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-xs text-apple-subtext">
              <span className="font-semibold text-apple-text block mb-1">
                Demo Credentials
              </span>
              <div className="space-x-1">
                <span>User:</span>
                <code className="bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono text-apple-text">
                  admin
                </code>
                <span>Pass:</span>
                <code className="bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono text-apple-text">
                  password
                </code>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-[11px] text-apple-subtext font-medium">
              WMS Extraction Portal &copy; 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
