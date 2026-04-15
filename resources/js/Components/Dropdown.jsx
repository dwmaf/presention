import { Transition } from "@headlessui/react";
import { Link } from "@inertiajs/react";
import { createContext, useContext, useState } from "react";

/**
 * * Context untuk sharing state dropdown
 */
const DropDownContext = createContext();

/**
 * * Dropdown Root Component
 * * ----------------------------------------
 * * Wrapper utama dropdown (state container)
 *
 * ? Kenapa pakai Context?
 * ? - Agar Trigger & Content bisa komunikasi tanpa prop drilling
 *
 * ! Responsibility:
 * - Menyimpan state open/close
 * - Menyediakan fungsi toggle
 *
 * @param {ReactNode} children - isi dropdown (Trigger + Content)
 */
const Dropdown = ({ children }) => {
    const [open, setOpen] = useState(false);

    /**
     * * Toggle state dropdown
     * * ----------------------------------------
     * * Kenapa pakai callback state?
     * * - Menghindari stale state saat update async
     */
    const toggleOpen = () => {
        setOpen((previousState) => !previousState);
    };

    return (
        <DropDownContext.Provider value={{ open, setOpen, toggleOpen }}>
            <div className="relative">{children}</div>
        </DropDownContext.Provider>
    );
};

/**
 * * Trigger Component
 * * ----------------------------------------
 * * Area yang diklik untuk membuka dropdown
 *
 * ! Behavior:
 * - Klik → toggle dropdown
 * - Klik di luar → close dropdown
 *
 * @param {ReactNode} children - elemen trigger (button, icon, dll)
 */
const Trigger = ({ children }) => {
    const { open, setOpen, toggleOpen } = useContext(DropDownContext);

    return (
        <>
            <div onClick={toggleOpen}>{children}</div>

            {open && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpen(false)}
                ></div>
            )}
        </>
    );
};

/**
 * * Content Component
 * * ----------------------------------------
 * * Container isi dropdown (menu)
 *
 * ? Kenapa dipisah?
 * ? - Bisa reuse untuk berbagai dropdown menu
 *
 * ! Features:
 * - Animasi open/close (Headless UI)
 * - Alignment (left/right)
 * - Custom width
 *
 * @param {"left"|"right"} align - posisi dropdown (default: right)
 * @param {string} width - lebar dropdown (default: "48")
 * @param {string} contentClasses - styling tambahan
 * @param {ReactNode} children - isi menu dropdown
 */
const Content = ({
    align = "right",
    width = "48",
    contentClasses = "py-1 bg-white",
    children,
}) => {
    const { open, setOpen } = useContext(DropDownContext);

    let alignmentClasses = "origin-top";

    if (align === "left") {
        alignmentClasses = "ltr:origin-top-left rtl:origin-top-right start-0";
    } else if (align === "right") {
        alignmentClasses = "ltr:origin-top-right rtl:origin-top-left end-0";
    }

    let widthClasses = "";

    if (width === "48") {
        widthClasses = "w-48";
    }

    return (
        <>
            <Transition
                show={open}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <div
                    className={`absolute z-50 mt-2 rounded-md shadow-lg ${alignmentClasses} ${widthClasses}`}
                    onClick={() => setOpen(false)}
                >
                    <div
                        className={
                            `rounded-md ring-1 ring-black ring-opacity-5 ` +
                            contentClasses
                        }
                    >
                        {children}
                    </div>
                </div>
            </Transition>
        </>
    );
};

/**
 * * Dropdown Link Item
 * * ----------------------------------------
 * * Item menu dropdown berbasis Link (Inertia)
 *
 * ! Kenapa dipisah?
 * - Konsisten styling untuk semua item dropdown
 * - Mudah reuse
 *
 * @param {string} className - tambahan class styling
 * @param {ReactNode} children - isi link (text/icon)
 * @param {object} props - props dari Inertia Link (href, method, dll)
 */
const DropdownLink = ({ className = "", children, ...props }) => {
    return (
        <Link
            {...props}
            className={
                "block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none " +
                className
            }
        >
            {children}
        </Link>
    );
};

/**
 * * Attach sub-components
 * * ----------------------------------------
 * * Usage:
 * * <Dropdown>
 * *   <Dropdown.Trigger />
 * *   <Dropdown.Content />
 * * </Dropdown>
 */
Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;
