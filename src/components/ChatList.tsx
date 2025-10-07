'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, onSnapshot, doc, getDoc, DocumentData, orderBy } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from './ui/skeleton';
import { User } from 'firebase/auth';
import Image from 'next/image';


type Chat = {
  id: string;
  participants: string[];
  lastMessage?: string;
  updatedAt?: any;
  otherUser?: DocumentData;
};

export function ChatList() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user || !firestore) return;
    setLoading(true);

    const chatsCol = collection(firestore, 'chats');
    const q = query(chatsCol, where('participants', 'array-contains', user.uid), orderBy('updatedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, async (snap) => {
      const chatsData: Chat[] = [];
      for (const chatDoc of snap.docs) {
        const chat = { id: chatDoc.id, ...chatDoc.data() } as Chat;
        const otherUid = chat.participants.find(uid => uid !== user.uid);
        
        if (otherUid) {
          const userDocRef = doc(firestore, 'users', otherUid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            chat.otherUser = userSnap.data();
          }
        }
        chatsData.push(chat);
      }
      setChats(chatsData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching chats:", error);
        setLoading(false);
    });

    return () => unsubscribe();

  }, [user, firestore]);

  if (loading) {
    return (
        <div className="p-3 space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    )
  }

  const handleChatClick = (otherUid: string) => {
    router.push(`/chat/${otherUid}`);
  }

  return (
    <div className="flex flex-col">
      {chats.map((chat) => (
        <div key={chat.id} className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer" onClick={() => handleChatClick(chat.otherUser?.uid || chat.participants.find(p => p !== user?.uid) || '')}>
          <div className="relative">
            {chat.otherUser ? (
              <Avatar className="h-12 w-12">
                <AvatarImage src={chat.otherUser.profilePicture || undefined} alt={chat.otherUser.name}/>
                <AvatarFallback>{chat.otherUser.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            ) : (
                <Skeleton className="h-12 w-12 rounded-full" />
            )}
          </div>
          <div className="flex-1 ml-3">
            <p className="font-semibold text-gray-800 dark:text-gray-200">{chat.otherUser?.name || 'Chat'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{chat.lastMessage}</p>
          </div>
          <div className="flex flex-col items-end">
             {chat.updatedAt && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(chat.updatedAt.toMillis()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function UserList() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [users, setUsers] = useState<DocumentData[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!firestore || !user) return;
        setLoading(true);

        const usersCol = collection(firestore, 'users');
        const unsubscribe = onSnapshot(usersCol, (snap) => {
            const usersData = snap.docs.map(d => ({uid: d.id, ...d.data()})).filter(u => u.uid !== user.uid);
            setUsers(usersData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching users:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [firestore, user]);

    if (loading) {
         return (
            <div className="p-3 space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }
    
    const handleUserClick = (uid: string) => {
        router.push(`/chat/${uid}`);
    }

    return (
        <div className="flex flex-col">
            {users.map((u) => (
                 <div key={u.uid} className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer" onClick={() => handleUserClick(u.uid)}>
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={u.profilePicture || undefined} alt={u.name}/>
                        <AvatarFallback>{u.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                     <div className="flex-1 ml-3">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{u.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{u.username}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}
