import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9F7F2] p-4 sm:p-6 select-none font-sans">
            {/* Logo/Brand Header */}
            <div className="mb-8 text-center">
                <Link href="/" className="inline-block group focus:outline-none">
                    <h1 className="text-headline-xl font-headline-xl font-bold text-primary group-hover:text-[#c2a26b] transition-colors">
                        Marme Villa
                    </h1>
                </Link>
                <p className="font-label-md text-label-md text-on-surface-variant/70 uppercase tracking-widest mt-1">
                    Back Office Admin
                </p>
            </div>

            {/* Login card container - optimized to expand on mobile, constraint on desktop */}
            <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 ghost-border ambient-shadow transition-all duration-300">
                {children}
            </div>
        </div>
    );
}
