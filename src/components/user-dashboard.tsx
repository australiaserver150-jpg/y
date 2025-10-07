'use client';
import { Camera, Search } from 'lucide-react';
import { UserNav } from './layout/user-nav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatList, UserList } from './ChatList';
import { useRouter } from 'next/navigation';

export function UserDashboard() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x">
      <header className="flex items-center justify-between p-4 border-b sticky top-0 z-10 bg-background">
        <h1 className="text-xl font-bold">BestU ChaT</h1>
        <div className="flex items-center gap-4">
          <UserNav />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <Tabs defaultValue="chats" className="w-full">
          <TabsList className="w-full grid grid-cols-3 rounded-none bg-background border-b">
            <TabsTrigger value="chats" className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Chats</TabsTrigger>
            <TabsTrigger value="users" className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Users</TabsTrigger>
            <TabsTrigger value="settings" onClick={() => router.push('/settings')} className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="chats">
            <ChatList />
          </TabsContent>
          <TabsContent value="users">
            <UserList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
