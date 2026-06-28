import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

export default function Toast() {
    const { flash, errors } = usePage().props;
    const [visible, setVisible] = useState(false);
    const [toast, setToast] = useState({ type: 'success', message: '' });

    useEffect(() => {
        let hasMessage = false;

        // Check for success flash message
        if (flash?.success) {
            setToast({ type: 'success', message: flash.success });
            hasMessage = true;
        } 
        // Check for error flash message
        else if (flash?.error) {
            setToast({ type: 'error', message: flash.error });
            hasMessage = true;
        } 
        // Check for validation errors
        else if (errors && Object.keys(errors).length > 0) {
            // Get the first error message
            const firstError = Object.values(errors)[0];
            setToast({ type: 'error', message: `Gagal menyimpan: ${firstError}` });
            hasMessage = true;
        }
        // Check for warning flash message
        else if (flash?.warning) {
            setToast({ type: 'warning', message: flash.warning });
            hasMessage = true;
        }

        if (hasMessage) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [flash, errors]);

    if (!visible) return null;

    const styles = {
        success: 'bg-[#e8f5e9] text-[#2e7d32] border-[#a5d6a7]',
        error: 'bg-[#ffebee] text-[#c62828] border-[#ef9a9a]',
        warning: 'bg-[#fff8e1] text-[#f57f17] border-[#ffe082]',
    };

    const icons = {
        success: 'check_circle',
        error: 'error',
        warning: 'warning',
    };

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center justify-center pointer-events-none px-4 w-full sm:w-auto">
            <div 
                className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-slide-down ${styles[toast.type]} pointer-events-auto max-w-sm w-full sm:w-auto`}
                role="alert"
            >
                <span className="material-symbols-outlined shrink-0">{icons[toast.type]}</span>
                <p className="text-sm font-semibold flex-1 leading-snug">{toast.message}</p>
                <button 
                    onClick={() => setVisible(false)}
                    className="shrink-0 rounded-full p-1 hover:bg-black/10 transition-colors -mr-1"
                >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
            </div>

            <style>{`
                @keyframes slideDown {
                    from { transform: translateY(-100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-down {
                    animation: slideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
            `}</style>
        </div>
    );
}
