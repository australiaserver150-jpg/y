
'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { MessageSquare, Phone, Users } from 'lucide-react';
import { Logo } from '@/components/icons';
import { UserNav } from './user-nav';
import { usePathname } from 'next/navigation';

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo className="w-6 h-6" />
          <h1 className="text-lg font-semibold">Chat App</h1>
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              href="/chats"
              isActive={pathname.startsWith('/chats')}
            >
              <MessageSquare />
              Chats
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              href="/calls"
              isActive={pathname.startsWith('/calls')}
            >
              <Phone />
              Calls
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <div className="mt-auto p-2">
        <UserNav />
      </div>
    </Sidebar>
  );
}
