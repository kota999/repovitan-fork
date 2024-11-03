"use client";

import {
  useClerk,
  useOrganization,
  useOrganizationList,
  useUser,
} from "@clerk/nextjs";
import { ChevronsUpDown, PlusIcon, SettingsIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const { isLoaded: userIsLoaded, user } = useUser();
  const { isLoaded: organizationIsLoaded, organization } = useOrganization();
  const {
    isLoaded: organizationListIsLoaded,
    userMemberships,
    setActive,
  } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });
  const { openOrganizationProfile, openCreateOrganization } = useClerk();

  if (
    !userIsLoaded ||
    !organizationIsLoaded ||
    !organizationListIsLoaded ||
    !user?.id
  ) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <Skeleton className="size-8 rounded-lg" />
            <div className="grid flex-1 gap-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {organization ? (
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage
                    src={organization.imageUrl}
                    alt={organization.name}
                  />
                  <AvatarFallback className="rounded-lg"></AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {organization.name}
                  </span>
                  <span className="truncate text-xs">{organization.slug}</span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage src={user.imageUrl} alt={user.username ?? ""} />
                  <AvatarFallback className="rounded-lg"></AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    Personal account
                  </span>
                  <span className="truncate text-xs">{user.username}</span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            {organization && (
              <>
                <DropdownMenuItem
                  className="gap-2 p-2"
                  onClick={() => openOrganizationProfile()}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <SettingsIcon className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">
                    Manage
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setActive({ organization: null })}
                  className="gap-2 p-2"
                >
                  <Avatar className="rounded-s, size-6">
                    <AvatarImage
                      src={user.imageUrl}
                      alt={user.username ?? ""}
                    />
                    <AvatarFallback className="rounded-lg"></AvatarFallback>
                  </Avatar>
                  Personal account
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Teams
            </DropdownMenuLabel>
            {userMemberships.data
              .filter(
                ({ organization: { id: orgId } }) => orgId !== organization?.id,
              )
              .map(({ id, organization }, index) => (
                <DropdownMenuItem
                  key={id}
                  onClick={() => setActive({ organization: organization.id })}
                  className="gap-2 p-2"
                >
                  <Avatar className="rounded-s, size-6">
                    <AvatarImage
                      src={organization.imageUrl}
                      alt={organization.name}
                    />
                    <AvatarFallback className="rounded-lg"></AvatarFallback>
                  </Avatar>
                  {organization.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => openCreateOrganization()}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <PlusIcon className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Create organization
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
