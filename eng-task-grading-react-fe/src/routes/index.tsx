import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header Section */}
      <div className="container mx-auto px-4 pt-12 pb-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Systém hodnocení a docházky
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Platforma pro správu kurzů, hodnocení studentů a evidenci docházky
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
                      <h2 className="text-2xl font-bold mb-3 text-gray-800">Pro učitele</h2>
                      <ul className="space-y-2 mb-6 text-gray-600 text-sm">
                        <li className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          Správa kurzů a studentů
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          Vytváření úkolů a zadávání známek
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          Evidence a správa docházky
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          Přehledy a statistiky výsledků
                        </li>
                      </ul>
                    </div>
                    <a
                      href="/login"
                      className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-md hover:shadow-lg"
                    >
                      Přihlásit se jako učitel
                    </a>
                    <a
                      href="/register"
                      className="block w-full text-center px-6 py-2 mt-2 text-blue-600 hover:text-blue-700 transition text-sm"
                    >
                      Registrace nového učitele
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
                      <h2 className="text-2xl font-bold mb-3 text-gray-800">Pro studenty</h2>
                      <ul className="space-y-2 mb-6 text-gray-600 text-sm">
                        <li className="flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          Přehled všech vašich kurzů
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          Sledování známek a hodnocení
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          Přehled docházky
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          Ověření vaší identity a výsledků
                        </li>
                      </ul>
                    </div>
                    <a
                      href="/studentView/login"
                      className="block w-full text-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold shadow-md hover:shadow-lg"
                    >
                      Přihlásit se jako student
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
            <h3 className="font-semibold text-gray-800 mb-2">💡 Pozor</h3>
            <p className="text-gray-600 text-sm">
              Ve večerních hodinách (23:00 - 05:00) může docházet k omezené dostupnosti systému z důvodu údržby.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-12 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-2">💡 Nápověda</h3>
            <p className="text-gray-600 text-sm">
              Pokud nemáte přístupové údaje, kontaktujte svého učitele nebo administrátora systému (Marek Vajgl).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
