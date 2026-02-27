import ApplicationLogo from "@/Components/ApplicationLogo";
import { Link } from "@inertiajs/react";

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/">
                    {/* <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" /> */}
                </Link>
            </div>

            <div className="mt-6 overflow-hidden bg-white shadow-lg rounded-xl h-max-[30rem]">
                {children}
            </div>
        </div>
    );
}
