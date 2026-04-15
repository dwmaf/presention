import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from "@headlessui/react";

/**
 * * Modal Component
 * * ----------------------------------------
 * * Wrapper modal berbasis Headless UI (accessible + animated)
 *
 * ? Kenapa dibuat wrapper?
 * ? - Menyatukan logic modal (show, close, animation)
 * ? - Menghindari duplikasi config Headless UI
 * ? - Mempermudah kontrol ukuran (width & height)
 *
 * ! Behavior:
 * - Menampilkan modal dengan animasi (fade + scale)
 * - Bisa ditutup dengan klik backdrop (jika closeable = true)
 * - Mendukung ukuran dinamis (maxWidth & maxHeight)
 * - Menggunakan children sebagai isi modal
 *
 * @param {ReactNode} children - Konten di dalam modal
 * @param {boolean} show - Menentukan apakah modal ditampilkan
 * @param {string} maxWidth - Ukuran lebar modal (sm | md | lg | xl | 2xl | 70% | 80% | fit)
 * @param {string} maxHeight - Ukuran tinggi modal (auto | fit | full | 70%)
 * @param {boolean} closeable - Apakah modal bisa ditutup dengan klik luar / ESC
 * @param {Function} onClose - Callback saat modal ditutup
 */
export default function Modal({
    children,
    show = false,
    maxWidth = "2xl",
    maxHeight = "auto",
    closeable = true,
    onClose = () => {},
}) {
    const close = () => {
        if (closeable) {
            onClose();
        }
    };

    const maxWidthClass = {
        sm: "sm:max-w-sm",
        md: "sm:max-w-md",
        lg: "sm:max-w-lg",
        xl: "sm:max-w-xl",
        "2xl": "sm:max-w-2xl",
        "70%": "w-[70%]",
        "80%": "w-[80%]",
        fit: "w-fit",
    }[maxWidth];

    const heightClass = {
        "70%": "h-[70%]",
        "2xl": "h-[2xl]",
        auto: "h-auto",
        fit: "h-fit",
        full: "h-full",
    }[maxHeight];

    return (
        <Transition show={show} leave="duration-200">
            <Dialog
                as="div"
                id="modal"
                className="fixed inset-0 z-50 flex transform items-center justify-center overflow-y-auto px-4 py-6 transition-all"
                onClose={close}
            >
                {/*
                 * * Backdrop Overlay
                 */}
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="absolute inset-0 bg-gray-500/75" />
                </TransitionChild>

                {/*
                 * * Modal Panel (Content)
                 */}
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                    <DialogPanel
                        className={`transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:mx-auto ${maxWidthClass} ${heightClass}`}
                    >
                        {children}
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}
