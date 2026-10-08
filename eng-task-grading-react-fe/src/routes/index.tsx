import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { appService } from '../services/app-service';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const { t } = useTranslation('home');
  const feVersion = import.meta.env.VITE_APP_VERSION;
  const [beVersion, setBeVersion] = useState<string>('⏳');

  useEffect(() => {
    fetchBackendVersion();
  }, []);

  const fetchBackendVersion = async () => {
    try {
      const tmp = await appService.getBackendVersion();
      setBeVersion(tmp);
    } catch (error) {
      console.error('Error fetching backend version:', error);
      setBeVersion('(err)');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header Section */}
      <div className="container mx-auto px-4 pt-12 pb-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto mb-12">
          {/* Login Section */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Teacher Login */}
                <div className="p-10 border-b md:border-b-0 md:border-r border-gray-200">
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <div className="inline-block p-3 bg-blue-100 rounded-lg mb-4">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold mb-3 text-gray-800">{t('teachers.title')}</h2>
                      <ul className="space-y-2 mb-6 text-gray-600 text-sm">
                        {(t('teachers.features', { returnObjects: true }) as string[]).map((f) => (
                          <li key={f} className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <a
                      href="/login"
                      className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-md hover:shadow-lg"
                    >
                      {t('teachers.login')}
                    </a>
                    <a
                      href="/register"
                      className="block w-full text-center px-6 py-2 mt-2 text-blue-600 hover:text-blue-700 transition text-sm"
                    >
                      {t('teachers.register')}
                    </a>
                  </div>
                </div>

                {/* Student Login */}
                <div className="p-10 bg-gradient-to-br from-green-50 to-white">
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <div className="inline-block p-3 bg-green-100 rounded-lg mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold mb-3 text-gray-800">{t('students.title')}</h2>
                      <ul className="space-y-2 mb-6 text-gray-600 text-sm">
                        {(t('students.features', { returnObjects: true }) as string[]).map((f) => (
                          <li key={f} className="flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <a
                      href="/studentView/login"
                      className="block w-full text-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold shadow-md hover:shadow-lg"
                    >
                      {t('students.login')}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-2">{t('warningTitle')}</h3>
            <p className="text-gray-600 text-sm">
              {t('warningText')}
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-12 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-2">{t('helpTitle')}</h3>
            <p className="text-gray-600 text-sm">
              {t('helpText')}
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 right-4 p-2 bg-gray-400 text-white text-xs rounded pointer-events-none z-50">
        v{feVersion} / v{beVersion}
      </div>
    </div>
  );
}
