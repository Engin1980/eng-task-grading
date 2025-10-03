import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/home')({
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Vítejte v systému hodnocení</h1>
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center justify-center border-r md:border-r-2 border-gray-200 pr-0 md:pr-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">Učitel</h2>
          <a href="/login" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium">Přihlášení učitele</a>
        </div>
        <div className="flex flex-col items-center justify-center pl-0 md:pl-8">
          <h2 className="text-xl font-semibold mb-4 text-green-700">Student</h2>
          <a href="/studentView/login" className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-medium">Přihlášení studenta</a>
        </div>
      </div>
    </div>
  );
};

