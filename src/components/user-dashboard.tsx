'use client';

import { Camera, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        {/* Chat list has been removed */}
      </main>

       <Button className="absolute bottom-8 right-4 h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg">
          <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
