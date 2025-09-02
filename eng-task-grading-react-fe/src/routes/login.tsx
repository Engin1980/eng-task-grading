import { createFileRoute } from '@tanstack/react-router'
import toast from 'react-hot-toast';
import { useAuth } from "../hooks/use-auth";
import { useLogger } from "../hooks/use-logger";

export const Route = createFileRoute('/login')({
    component: Login,
})

import { useState } from 'react';

function Login() {
  const { handleLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const logger = useLogger("LoginPage");

  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault();
    logger.debug("Pokus o přihlášení", { email });
    try {
      await handleLogin(email, password);
      logger.info("Úspěšné přihlášení", { email });
      toast.success("Přihlášeno");
    } catch (ex) {
      logger.error("Přihlášení selhalo", { email, error: ex });
      toast.error("Přihlášení selhalo: " + ex);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Log In
          </button>
        </form>
        <p className="text-center text-gray-500 text-sm mt-4">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-500 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}