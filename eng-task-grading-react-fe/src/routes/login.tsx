import { createFileRoute } from '@tanstack/react-router'
import toast from 'react-hot-toast';
import { useAuth } from "../hooks/use-auth";
import { useLogger } from "../hooks/use-logger";
import { useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/login')({
  component: Login,
})

import { useState } from 'react';

function Login() {
  const { handleLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const logger = useLogger("LoginPage");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    logger.debug("Pokus o přihlášení", { email });
    try {
      await handleLogin(email, password);
      logger.info("Úspěšné přihlášení", { email });
      toast.success("Přihlášeno");
      //navigate({ to: '/courses' });
    } catch (ex) {
      logger.error("Přihlášení selhalo", { email, error: ex });
      toast.error("Přihlášení selhalo: " + ex);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">Přihlášení učitele</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
              Zaměstnanecký email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="email@osu.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="password">
              Heslo
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Log In
          </button>
        </form>
        <p className="text-center text-gray-500 text-sm mt-4">
          Nemáte účet?{" "}
          <a href="/register" className="text-blue-500 hover:underline">
            Zaregistrujte se
          </a>.
        </p>
      </div>
    </div>
  );
}