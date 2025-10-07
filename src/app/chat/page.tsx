
"use client";

import { Bell, Camera, MessageSquare, Plus, Search, Users, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const chats = [
  {
    id: 1,
    name: "Design Team",
    avatar: "https://picsum.photos/seed/1/40/40",
    lastMessage: "Yeah, that's a great idea!",
    time: "3:43 PM",
    unread: 3,
    online: true,
  },
  {
    id: 2,
    name: "John Doe",
    avatar: "https://picsum.photos/seed/2/40/40",
    lastMessage: "See you tomorrow.",
    time: "1:21 PM",
    unread: 0,
    online: false,
    status: 'read'
  },
  {
    id: 3,
    name: "Mom",
    avatar: "https://picsum.photos/seed/3/40/40",
    lastMessage: "Call me when you're free.",
    time: "11:57 AM",
    unread: 1,
    online: true,
  },
  {
    id: 4,
    name: "Project Group",
    avatar: "https://picsum.photos/seed/4/40/40",
    lastMessage: "Let's meet at 5.",
    time: "Yesterday",
    unread: 0,
    online: false,
    status: 'delivered'
  },
];

const BottomNavItem = ({ icon: Icon, label, isActive }: { icon: any, label: string, isActive?: boolean }) => (
    <div className={`flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
        <Icon className="w-6 h-6"/>
        <span className="text-xs">{label}</span>
    </div>
)

const ChatListItem = ({ chat }: { chat: (typeof chats)[0] }) => (
    <div className="flex items-center gap-4 p-3 hover:bg-muted/50 cursor-pointer">
        <Avatar className="h-12 w-12">
            <AvatarImage src={chat.avatar} alt={chat.name}/>
            <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
            {chat.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"/>}
        </Avatar>
        <div className="flex-1">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold">{chat.name}</h3>
                <p className={`text-xs ${chat.unread > 0 ? 'text-primary' : 'text-muted-foreground'}`}>{chat.time}</p>
            </div>
            <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                {chat.unread > 0 ? (
                    <Badge variant="default" className="h-5 w-5 flex items-center justify-center p-0">{chat.unread}</Badge>
                ) : (
                    chat.status && <Badge variant={chat.status as any} />
                )}
            </div>
        </div>
    </div>
)


export default function ChatPage() {
    return (
        <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x">
            {/* Header */}
            <header className="flex items-center justify-between p-4 bg-card text-card-foreground shadow-sm">
                <h1 className="text-xl font-bold">ConverseHub</h1>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon"><Camera className="w-6 h-6"/></Button>
                    <Button variant="ghost" size="icon"><Search className="w-6 h-6"/></Button>
                </div>
            </header>

            {/* Top Navigation */}
            <nav className="flex justify-around border-b">
                <Button variant="ghost" className="flex-1 rounded-none text-primary border-b-2 border-primary h-12">Chats</Button>
                <Button variant="ghost" className="flex-1 rounded-none text-muted-foreground h-12">Status</Button>
                <Button variant="ghost" className="flex-1 rounded-none text-muted-foreground h-12">Channels</Button>
                <Button variant="ghost" className="flex-1 rounded-none text-muted-foreground h-12">Calls</Button>
            </nav>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="divide-y">
                    {chats.map(chat => <ChatListItem key={chat.id} chat={chat} />)}
                </div>
            </main>
            
            {/* FAB */}
            <div className="absolute bottom-20 right-4">
                 <Button className="rounded-full w-14 h-14 bg-green-500 hover:bg-green-600 shadow-lg">
                    <Plus className="w-8 h-8"/>
                 </Button>
            </div>

            {/* Bottom Navigation */}
            <footer className="flex justify-around items-center p-2 border-t bg-card">
                 <BottomNavItem icon={MessageSquare} label="Messages" isActive/>
                 <BottomNavItem icon={Bell} label="Updates"/>
                 <BottomNavItem icon={Users} label="Communities"/>
                 <BottomNavItem icon={Video} label="Calls"/>
            </footer>

        </div>
    )
}
