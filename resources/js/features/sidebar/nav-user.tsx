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
    SidebarMenuButton as SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { ChevronsUpDownIcon, BadgeCheckIcon, LogOutIcon } from "lucide-react";

interface UserProps {
    user: {
        name: string;
        email: string;
        avatar: string;
    };
}

export function NavUser({ user }: UserProps) {
    const { isMobile } = useSidebar();

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
                            <AvatarFallback>UPA</AvatarFallback>
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
                        className="min-w-(--anchor-width) rounded-lg"
                        side="bottom"
                        align="start"
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
                                        <AvatarFallback>UPA</AvatarFallback>
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
