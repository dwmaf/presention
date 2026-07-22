/**
 * ============================================================================
 * Component   : NavUser
 * Layer       : Feature (Sidebar)
 *
 * Description:
 * Menampilkan detail profil admin UPA PKK di footer sidebar beserta dropdown
 * untuk manajemen biometrik dan logout (Inertia post).
 * ============================================================================
 */

import { router } from "@inertiajs/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { ChevronsUpDownIcon, BadgeCheckIcon, LogOutIcon } from "lucide-react";

/**
 * Data profil pengguna yang diterima oleh komponen NavUser.
 */
export interface NavUserData {
    /** Nama pengguna. */
    name: string;
    /** Email atau role pengguna. */
    email: string;
    /** URL foto avatar pengguna. */
    avatar: string;
}

/**
 * Properti untuk komponen NavUser.
 */
export interface NavUserProps {
    /** Detail profil pengguna yang sedang login. */
    user: NavUserData;
}

/**
 * Memformat inisial nama pengguna untuk fallback avatar.
 *
 * @param name Nama pengguna.
 * @returns 2 huruf inisial kapital.
 */
function getInitials(name: string): string {
    if (!name) return "UP";
    const initials = name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
    return initials.slice(0, 2) || "UP";
}

/**
 * Komponen footer sidebar untuk menampilkan profil pengguna dan menu dropdown akun.
 *
 * @param props Properti komponen NavUser.
 * @returns Elemen menu profil pengguna sidebar.
 */
export function NavUser({ user }: NavUserProps) {
    const { isMobile } = useSidebar();
    const initials = getInitials(user.name);

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <SidebarMenuButton
                                size="lg"
                                className="aria-expanded:bg-muted"
                            />
                        }
                    >
                        <Avatar>
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>

                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">
                                {user.name}
                            </span>
                            <span className="text-muted-foreground truncate text-xs">
                                {user.email}
                            </span>
                        </div>

                        <ChevronsUpDownIcon className="ml-auto size-4" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        className="w-(--anchor-width) min-w-52 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <Avatar>
                                        <AvatarImage
                                            src={user.avatar}
                                            alt={user.name}
                                        />

                                        <AvatarFallback>
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">
                                            {user.name}
                                        </span>

                                        <span className="text-muted-foreground truncate text-xs">
                                            {user.email}
                                        </span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onClick={() =>
                                router.get(route("profile.fingerprint"))
                            }
                        >
                            <BadgeCheckIcon />
                            Kelola Biometrik
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onClick={() => router.post(route("logout"))}
                            variant="destructive"
                            className="text-destructive focus:text-destructive cursor-pointer"
                        >
                            <LogOutIcon />
                            Keluar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
