export default function PrimaryButton({
    className = "",
    disabled,
    children,
    icon = null,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center gap-2 rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-800 transition duration-150 ease-in-out hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
                    disabled && "opacity-25"
                } ` + className
            }
            disabled={disabled}
        >
            {icon}
            {children}
        </button>
    );
}
