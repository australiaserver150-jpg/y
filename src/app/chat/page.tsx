
"use client";

import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, Timestamp } from "firebase/firestore";
import { Bell, Camera, MessageSquare, Plus, Search, Users, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Chat } from "@/lib/types";
import { Loading } from "@/components/Loading";

const BottomNavItem = ({ icon: Icon, label, isActive }: { icon: any, label: string, isActive?: boolean }) => (
    <div className={`flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
        <Icon className="w-6 h-6"/>
        <span className="text-xs">{label}</span>
    </div>
)

const ChatListItem = ({ chat, currentUserId }: { chat: Chat, currentUserId: string }) => {
    const otherParticipant = chat.participantInfo.find(p => p.userId !== currentUserId);
    if (!otherParticipant) return null;

    // Convert Firestore Timestamp to JavaScript Date
    const lastMessageTime = chat.timestamp instanceof Timestamp 
        ? chat.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : "Invalid date";


    return (
        <div className="flex items-center gap-4 p-3 hover:bg-muted/50 cursor-pointer">
            <Avatar className="h-12 w-12">
                <AvatarImage src={otherParticipant.avatar} alt={otherParticipant.name}/>
                <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
                {/* Online status can be implemented later */}
            </Avatar>
            <div className="flex-1">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{otherParticipant.name}</h3>
                    <p className='text-xs text-muted-foreground'>{lastMessageTime}</p>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                    {/* Unread count can be implemented later */}
                </div>
            </div>
        </div>
    )
}


export default function ChatPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const chatsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, "chats"), where("participants", "array-contains", user.uid));
    }, [firestore, user]);

    const { data: chats, isLoading: areChatsLoading } = useCollection<Chat>(chatsQuery);

    if (isUserLoading || areChatsLoading) {
        return <Loading />;
    }

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
                    {chats && user ? (
                        chats.map(chat => <ChatListItem key={chat.id} chat={chat} currentUserId={user.uid} />)
                    ) : (
                        <p className="p-4 text-center text-muted-foreground">No chats found.</p>
                    )}
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

    