// import React from 'react';
import { Outlet, Link } from '@tanstack/react-router';

export const Root = () => {
    return (
        <div>
            <nav className="p-4 bg-gray-100">
                <Link to="/" className="mr-4 text-blue-600">Home</Link>
                <Link to="/login" className="text-blue-600">Login</Link>
            </nav>
            <div className="p-4">
                <Outlet /> {/* This renders child routes */}
            </div>
        </div>
    );
};