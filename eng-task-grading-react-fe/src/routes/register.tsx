import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { teacherService } from '../services/teacher-service';
import type { TeacherRegisterDto } from '../model/teacher-dto';
import { useNavigate } from '@tanstack/react-router';
import { useToast } from '../hooks/use-toast';
import { Trans, useTranslation } from 'react-i18next';

export const Route = createFileRoute('/register')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const tst = useToast();

  const validateEmail = (value: string) => {
    return value.endsWith('@osu.cz');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      tst.error(tst.ERR.EMAIL_MUST_END_WITH_OSU_CZ);
      return;
    }
    if (!password || password.length < 8) {
      tst.error(tst.ERR.PASSWORD_MIN_LENGTH);
      return;
    }
    setLoading(true);
    try {
      const data: TeacherRegisterDto = {
        email,
        password
      };
      await teacherService.register(data);
      tst.success(tst.SUC.REGISTRATION_SUCCESS);
      setEmail('');
      setPassword('');
      navigate({ to: '/login' });
    } catch (err) {
      tst.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">{t('register.title')}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">{t('register.email')}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('register.emailPlaceholder')}
              required
              disabled={loading}
            />
          </div>
          <div className="text-xs text-gray-500 mt-2">{t('register.emailHint')}</div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">{t('register.password')}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('register.passwordPlaceholder')}
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {t('register.submit')}
          </button>
          <div className="mt-4 text-center text-sm text-gray-500">
            <Trans
              t={t}
              i18nKey="register.haveAccount"
              components={{ a: <a href="/login" className="text-blue-600 hover:underline" /> }}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
