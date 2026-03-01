import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

export function useToast() {
    return useContext(ToastContext);
}

export function ToastNotif({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = "info", duration = 3000) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`px-4 py-3 rounded shadow text-white flex items-center gap-2
                            ${toast.type === "success" ? "bg-green-500" : ""}
                            ${toast.type === "error" ? "bg-red-500" : ""}
                            ${toast.type === "info" ? "bg-blue-500" : ""}
                        `}
                    >
                        <span>{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-2 text-white/70 hover:text-white"
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
