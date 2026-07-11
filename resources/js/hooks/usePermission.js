import { usePage } from '@inertiajs/react';

/**
 * usePermission – hook terpusat untuk cek permission di frontend.
 *
 * Gunakan:
 *   const { can } = usePermission();
 *   can('edit villas')  → true/false
 */
export function usePermission() {
    const { auth } = usePage().props;
    const permissions = auth?.user?.permissions ?? [];

    const can = (permission) => {
        return Array.isArray(permissions)
            ? permissions.includes(permission)
            : permissions?.indexOf?.(permission) !== -1;
    };

    return { can };
}
