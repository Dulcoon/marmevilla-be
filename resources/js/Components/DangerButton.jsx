export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center gap-2 rounded-lg bg-error px-5 py-2.5 text-sm font-semibold text-on-error transition-colors hover:bg-error/90 focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 ${
                    disabled && 'opacity-50'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
