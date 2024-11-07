import { Calendar, Home, Inbox, Search, Settings } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import UserDropdownMenu from '../session/UserDropDownMenu';

// Menu items.
const items = [
  {
    title: 'Inicio',
    url: '/dashboard',
    icon: Home,
  },
  {
    title: 'Analitycs',
    url: '/dashboard/analytics',
    icon: Inbox,
  },
  {
    title: 'Administrar productos',
    url: '/dashboard/products',
    icon: Calendar,
  },
  {
    title: 'Administrar proveedores',
    url: '/dashboard/suppliers',
    icon: Search,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <UserDropdownMenu />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
