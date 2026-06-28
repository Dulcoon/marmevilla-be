import { useState } from 'react';
import AdminSidebar from '@/Components/AdminSidebar';
import AdminHeader from '@/Components/AdminHeader';
import Toast from '@/Components/Toast';

export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#F9F7F2] font-sans antialiased text-on-surface flex">
            {/* Global Toast Notifications */}
            <Toast />

            {/* Sidebar navigation */}
            <AdminSidebar 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
            />

            {/* Main content page layout container */}
            <div className="flex-1 flex flex-col min-h-screen lg:pl-sidebar-width transition-all duration-300">
                {/* Header/Appbar */}
                <AdminHeader 
                    onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
                />

                {/* Sub-view Content slot */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
