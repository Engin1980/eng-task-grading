// import React from 'react';
import { Outlet } from '@tanstack/react-router';
import { createRootRoute } from '@tanstack/react-router'
import { Toaster } from 'react-hot-toast';
import TopMenu from '../components/global/top-menu';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <div className="text-red-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Něco se pokazilo</h3>
          <p className="text-gray-500 mb-4">Došlo k neočekávané chybě. Prosím zkuste to znovu.</p>

          {process.env.NODE_ENV === 'development' && (
            <details className="text-left mt-4 p-3 bg-gray-100 rounded-md">
              <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                Technické detaily
              </summary>
              <pre className="text-xs text-red-600 mt-2 whitespace-pre-wrap">
                {error.message}
                {error.stack && '\n\n' + error.stack}
              </pre>
            </details>
          )}

          <div className="mt-6 flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Obnovit stránku
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Zpět
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Root() {
  return (
    <div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '8px',
            background: '#333',
            color: '#fff',
          },
          duration: 4000,
        }}
      />

      <div>
        <TopMenu />
        <div className="flex-1 p-4">
          <div>
            <Outlet /> {/* This renders child routes */}
          </div>
        </div>
      </div>
    </div>
  );
};


export const Route = createRootRoute({
  component: Root,
  errorComponent: ErrorFallback
})