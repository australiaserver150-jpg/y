'use client';
import { Camera, Search, Plus, MessageCircle, GitBranch, Users, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserNav } from './layout/user-nav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatList } from './ChatList';

export function UserDashboard() {
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
          <TabsList className="w-full grid grid-cols-4 rounded-none bg-primary text-primary-foreground">
            <TabsTrigger value="chats" className="text-primary-foreground/60 data-[state=active]:text-primary-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary-foreground rounded-none">Chats</TabsTrigger>
            <TabsTrigger value="status" className="text-primary-foreground/60 data-[state=active]:text-primary-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary-foreground rounded-none">Status</TabsTrigger>
            <TabsTrigger value="channels" className="text-primary-foreground/60 data-[state=active]:text-primary-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary-foreground rounded-none">Channels</TabsTrigger>
            <TabsTrigger value="calls" className="text-primary-foreground/60 data-[state=active]:text-primary-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary-foreground rounded-none">Calls</TabsTrigger>
          </TabsList>
          <TabsContent value="chats">
            <ChatList />
          </TabsContent>
          <TabsContent value="status">
            <div className="flex items-center justify-center h-full text-gray-500">Status Feature Coming Soon</div>
          </TabsContent>
           <TabsContent value="channels">
            <div className="flex items-center justify-center h-full text-gray-500">Channels Feature Coming Soon</div>
          </TabsContent>
          <TabsContent value="calls">
            <div className="flex items-center justify-center h-full text-gray-500">Calls Feature Coming Soon</div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="grid grid-cols-4 items-center justify-items-center p-2 bg-gray-100 dark:bg-gray-900 sticky bottom-0">
          <Button variant="ghost" className="flex flex-col h-auto items-center text-gray-600 dark:text-gray-400">
            <MessageCircle className="h-6 w-6" />
            <span className="text-xs">Messages</span>
          </Button>
          <Button variant="ghost" className="flex flex-col h-auto items-center text-gray-600 dark:text-gray-400">
            <GitBranch className="h-6 w-6" />
            <span className="text-xs">Updates</span>
          </Button>
          <Button variant="ghost" className="flex flex-col h-auto items-center text-gray-600 dark:text-gray-400">
            <Users className="h-6 w-6" />
            <span className="text-xs">Communities</span>
          </Button>
          <Button variant="ghost" className="flex flex-col h-auto items-center text-gray-600 dark:text-gray-400">
            <Phone className="h-6 w-6" />
            <span className="text-xs">Calls</span>
          </Button>
      </footer>
       <Button className="absolute bottom-24 right-4 h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg">
          <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
