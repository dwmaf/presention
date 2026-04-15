import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { usePage } from "@inertiajs/react";
import { useState } from "react";
import Sidebar from "@/Components/Sidebar";

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="flex min-h-screen bg-gray-100 pl-80">
            <Sidebar />

            <main className="flex-1">{children}</main>
        </div>
    );
}
