'use client';
import { UserNav } from './layout/user-nav';
import { ChatList } from './ChatList';
import { FriendsSidebar } from './FriendsSidebar';

export function UserDashboard() {
  return (
    <div className="flex h-screen max-w-4xl mx-auto bg-background border-x">
      <FriendsSidebar />
      <div className="flex flex-col flex-1 border-l">
        <header className="flex items-center justify-between p-4 border-b sticky top-0 z-10 bg-background">
          <h1 className="text-xl font-bold font-headline">ConnectNow</h1>
          <div className="flex items-center gap-2">
            <UserNav />
          </div>
        </header>
        <main className="flex-1 flex flex-col overflow-y-auto">
          <ChatList />
        </main>
      </div>
    </div>
  );
}
