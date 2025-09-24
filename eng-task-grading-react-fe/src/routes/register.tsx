import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { teacherService } from '../services/teacher-service';
import type { TeacherRegisterDto } from '../model/teacher-dto';
import { useNavigate } from '@tanstack/react-router';
import toast from 'react-hot-toast';

export const Route = createFileRoute('/register')({
  component: RouteComponent,
})

function RouteComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (value: string) => {
    return value.endsWith('@osu.cz');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      toast.error('Email musí končit na @osu.cz');
      return;
    }
    if (!password || password.length < 8) {
      toast.error('Heslo musí mít alespoň 8 znaků.');
      return;
    }
    setLoading(true);
    try {
      const data: TeacherRegisterDto = {
        email,
        password
      };
      await teacherService.register(data);
      toast.success('Registrace byla úspěšná. Nyní se můžete přihlásit.');
      setEmail('');
      setPassword('');
      navigate({ to: '/login' });
    } catch (err) {
      toast.error('Chyba při registraci.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">Registrace učitele</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ucitel@osu.cz"
              required
              disabled={loading}
            />
          </div>
          <div className="text-xs text-gray-500 mt-2">Lze použít novou (xxx##@osu.cz) i starou (jmeno.prijmeni@osu.cz) formu.</div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Heslo</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Zadejte heslo"
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            Registrovat
          </button>
          <div className="mt-4 text-center text-sm text-gray-500">
            Nebo se můžete <a href="/login" className="text-blue-600 hover:underline">přihlásit</a>.
          </div>
        </form>
      </div>
    </div>
  );
}
