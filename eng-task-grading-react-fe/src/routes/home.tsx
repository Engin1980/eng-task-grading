import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/home')({
    component: Home,
});

function Home (){
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Our React App</h1>
            <p className="text-lg text-gray-600 mb-6">
                This is the home page. Explore the app and enjoy your stay!
            </p>
            <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Get Started
            </button>
        </div>
    );
};

