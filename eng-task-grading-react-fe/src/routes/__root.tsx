// import React from 'react';
import { Outlet, } from '@tanstack/react-router';
import { createRootRoute } from '@tanstack/react-router'
import { Toaster } from 'react-hot-toast';
import TopMenu from '../components/global/top-menu';

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
    component: Root
})