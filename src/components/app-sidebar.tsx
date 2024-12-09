"use client";

import {
  BookmarkIcon,
  FrameIcon,
  LifeBuoyIcon,
  ListChecksIcon,
  ListIcon,
  MapIcon,
  PackageIcon,
  PieChartIcon,
  SendIcon,
  Settings2Icon,
  TagIcon,
} from "lucide-react";
import * as React from "react";
import { NavMain } from "~/components/nav-main";
import { NavProjects } from "~/components/nav-projects";
import { NavSecondary } from "~/components/nav-secondary";
import { NavUser } from "~/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "~/components/ui/sidebar";
import { TeamSwitcher } from "./team-switcher";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Bookmarks",
      url: "/dashboard/bookmarks",
      icon: BookmarkIcon,
    },
    {
      title: "Bookmark Lists",
      url: "/dashboard/bookmark-lists",
      icon: ListIcon,
    },
    {
      title: "Bookmark Tags",
      url: "/dashboard/bookmark-tags",
      icon: TagIcon,
    },
    {
      title: "NPM Packages",
      url: "/dashboard/npm-packages",
      icon: PackageIcon,
    },
    {
      title: "Data Table",
      url: "/dashboard/data-table",
      icon: ListChecksIcon,
    },
    {
      title: "Settings",
      url: "/dashboard/settings/appearance",
      icon: Settings2Icon,
      isActive: true,
      items: [
        {
          title: "Appearance",
          url: "/dashboard/settings/appearance",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: FrameIcon,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChartIcon,
    },
    {
      name: "Travel",
      url: "#",
      icon: MapIcon,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoyIcon,
    },
    {
      title: "Feedback",
      url: "#",
      icon: SendIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
