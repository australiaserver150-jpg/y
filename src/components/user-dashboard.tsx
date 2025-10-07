'use client';

import { Camera, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatList } from './ChatList';
import { UserNav } from './layout/user-nav';

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
          <TabsList className="grid w-full grid-cols-4 rounded-none bg-primary text-primary-foreground">
            <TabsTrigger value="chats" className="data-[state=active]:border-b-2 data-[state=active]:border-primary-foreground rounded-none">Chats</TabsTrigger>
            <TabsTrigger value="status" className="data-[state=active]:border-b-2 data-[state=active]:border-primary-foreground rounded-none">Status</TabsTrigger>
            <TabsTrigger value="channels" className="data-[state=active]:border-b-2 data-[state=active]:border-primary-foreground rounded-none">Channels</TabsTrigger>
            <TabsTrigger value="calls" className="data-[state=active]:border-b-2 data-[state=active]:border-primary-foreground rounded-none">Calls</TabsTrigger>
          </TabsList>
          <TabsContent value="chats">
            <ChatList />
          </TabsContent>
          <TabsContent value="status">
            <div className="flex items-center justify-center h-full">
                <p>Status updates will appear here.</p>
            </div>
          </TabsContent>
          <TabsContent value="channels">
            <div className="flex items-center justify-center h-full">
                <p>Channels will appear here.</p>
            </div>
          </TabsContent>
          <TabsContent value="calls">
            <div className="flex items-center justify-center h-full">
                <p>Call history will appear here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

       <Button className="absolute bottom-8 right-4 h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg">
          <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
