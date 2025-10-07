'use client';
import { Camera, Search, Plus, MessageCircle, GitBranch, Users, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserNav } from './layout/user-nav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatList, UserList } from './ChatList';
import { useRouter } from 'next/navigation';

export function UserDashboard() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white dark:bg-black">
      <header className="flex items-center justify-between p-4 bg-primary text-primary-foreground sticky top-0 z-10">
        <h1 className="text-xl font-bold">ConverseHub</h1>
        <div className="flex items-center gap-4">
          <Camera />
          <Search />
          <UserNav />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <Tabs defaultValue="chats" className="w-full">
          <TabsList className="w-full grid grid-cols-2 rounded-none bg-primary text-primary-foreground">
            <TabsTrigger value="chats" className="text-primary-foreground/60 data-[state=active]:text-primary-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary-foreground rounded-none">Chats</TabsTrigger>
            <TabsTrigger value="users" className="text-primary-foreground/60 data-[state=active]:text-primary-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary-foreground rounded-none">Users</TabsTrigger>
          </TabsList>
          <TabsContent value="chats">
            <ChatList />
          </TabsContent>
          <TabsContent value="users">
            <UserList />
          </TabsContent>
        </Tabs>
      </main>

       <Button 
        onClick={() => router.push('/#')}
        className="absolute bottom-6 right-4 h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg">
          <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  );
}
