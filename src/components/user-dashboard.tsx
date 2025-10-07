'use client';
import { Search } from 'lucide-react';
import { UserNav } from './layout/user-nav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatList, UserList } from './ChatList';
import { useRouter } from 'next/navigation';
import { Input } from './ui/input';

export function UserDashboard() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x">
      <header className="flex items-center justify-between p-4 border-b sticky top-0 z-10 bg-background">
        <h1 className="text-xl font-bold font-headline">ConnectNow</h1>
        <div className="flex items-center gap-2">
          <UserNav />
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-4 border-b">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search" className="pl-10 w-full" />
            </div>
        </div>
        <Tabs defaultValue="chats" className="w-full flex flex-col flex-1">
          <TabsList className="grid w-full grid-cols-3 rounded-none">
            <TabsTrigger value="chats">Chats</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings" onClick={() => router.push('/settings')}>Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="chats" className="flex-1 overflow-y-auto">
            <ChatList />
          </TabsContent>
          <TabsContent value="users" className="flex-1 overflow-y-auto">
            <UserList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
