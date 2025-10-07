'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, onSnapshot, doc, getDoc, DocumentData, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare } from 'lucide-react';
import { CallButton } from './CallButton';


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
    const q = query(chatsCol, where('participants', 'array-contains', user.uid));
    
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
      
      // Sort chats on the client-side
      chatsData.sort((a, b) => {
        const dateA = a.updatedAt?.toMillis() || 0;
        const dateB = b.updatedAt?.toMillis() || 0;
        return dateB - dateA;
      });

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
            {[...Array(5)].map((_, i) => (
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
  
  if(chats.length === 0) {
    return <p className="text-center text-muted-foreground p-4">No chats yet. Start a conversation with a friend!</p>
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
                <AvatarImage src={chat.otherUser.profilePicture || undefined} alt={chat.otherUser.displayName}/>
                <AvatarFallback>{chat.otherUser.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            ) : (
                <Skeleton className="h-12 w-12 rounded-full" />
            )}
          </div>
          <div className="flex-1 ml-3">
            <p className="font-semibold text-gray-800 dark:text-gray-200">{chat.otherUser?.displayName || 'Chat'}</p>
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

export function useUserList() {
    const { user: currentUser } = useUser();
    const firestore = useFirestore();
    const [users, setUsers] = useState<DocumentData[]>([]);
    const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (!firestore) return;
        
        const usersCol = collection(firestore, 'users');
        const unsubscribeUsers = onSnapshot(usersCol, (snap) => {
            const usersData = snap.docs.map(d => ({uid: d.id, ...d.data()})).filter(u => u.uid !== currentUser?.uid);
            setUsers(usersData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching users:", error);
            setLoading(false);
        });

        let unsubProfile = () => {};
        if (currentUser) {
            const currentUserDoc = doc(firestore, 'users', currentUser.uid);
            unsubProfile = onSnapshot(currentUserDoc, (snap) => {
                setCurrentUserProfile(snap.data());
            });
        } else {
           setCurrentUserProfile(null);
        }

        return () => {
          unsubscribeUsers();
          unsubProfile();
        }
    }, [firestore, currentUser]);

    const sendFriendRequest = async (targetUid: string) => {
        if (!currentUser || !firestore) return;
        
        const currentUserRef = doc(firestore, 'users', currentUser.uid);
        const targetUserRef = doc(firestore, 'users', targetUid);

        try {
            await updateDoc(currentUserRef, { sentRequests: arrayUnion(targetUid) });
            await updateDoc(targetUserRef, { friendRequests: arrayUnion(currentUser.uid) });
            toast({title: 'Friend request sent!'});
        } catch (error) {
            console.error(error);
            toast({variant: 'destructive', title: 'Error sending request'});
        }
    }

    return { users, loading, currentUser, currentUserProfile, sendFriendRequest };
}


export function UserList() {
    const { users, loading, currentUserProfile, sendFriendRequest } = useUserList();
    const router = useRouter();
    
    const getButtonState = (otherUser: any) => {
        if (!currentUserProfile) {
            return <Button disabled>Loading...</Button>;
        }
        if (currentUserProfile.friends?.includes(otherUser.uid)) {
            return <Button disabled>Friends</Button>
        }
        if (currentUserProfile.sentRequests?.includes(otherUser.uid)) {
            return <Button disabled>Request Sent</Button>
        }
        if (currentUserProfile.friendRequests?.includes(otherUser.uid)) {
             return <Button onClick={() => router.push('/#requests')}>Accept Request</Button>
        }
        return <Button onClick={() => sendFriendRequest(otherUser.uid)}>Add Friend</Button>
    }

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
    
    return (
        <div className="flex flex-col">
            {users.map((u) => (
                 <div key={u.uid} className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={u.profilePicture || undefined} alt={u.displayName}/>
                        <AvatarFallback>{u.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                     <div className="flex-1 ml-3">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{u.displayName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">@{u.username}</p>
                    </div>
                    {getButtonState(u)}
                </div>
            ))}
        </div>
    )
}

function FriendActions({ friend }: { friend: DocumentData }) {
    const router = useRouter();

    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => router.push(`/chat/${friend.uid}`)}>
                <MessageSquare className="h-4 w-4" />
                <span className="sr-only">Chat</span>
            </Button>
            <CallButton otherUid={friend.uid} />
        </div>
    );
}

export function FriendList() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [friends, setFriends] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user || !firestore) return;

    const unsub = onSnapshot(doc(firestore, 'users', user.uid), async (snap) => {
      const userData = snap.data();
      if (userData?.friends) {
        if (userData.friends.length === 0) {
            setFriends([]);
            setLoading(false);
            return;
        }
        const friendPromises = userData.friends.map((friendId: string) => getDoc(doc(firestore, 'users', friendId)));
        const friendDocs = await Promise.all(friendPromises);
        const friendsData = friendDocs.map(d => ({uid: d.id, ...d.data()}));
        setFriends(friendsData);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [user, firestore]);

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
    );
  }

  if (friends.length === 0) {
    return <p className="text-center text-muted-foreground p-4">You have no friends yet. Find some in the Users tab!</p>
  }

  return (
    <div className="flex flex-col">
      {friends.map((f) => (
        <div key={f.uid} className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800">
          <Avatar className="h-12 w-12">
            <AvatarImage src={f.profilePicture || undefined} alt={f.displayName}/>
            <AvatarFallback>{f.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 ml-3">
            <p className="font-semibold text-gray-800 dark:text-gray-200">{f.displayName}</p>
             <p className={`text-sm ${f.onlineStatus ? 'text-green-500' : 'text-muted-foreground'}`}>{f.onlineStatus ? 'Online' : 'Offline'}</p>
          </div>
          <FriendActions friend={f} />
        </div>
      ))}
    </div>
  )
}

export function RequestList() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [requests, setRequests] = useState<DocumentData[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (!user || !firestore) return;
        setLoading(true);

        const unsub = onSnapshot(doc(firestore, 'users', user.uid), async (snap) => {
            const userData = snap.data();
            if (userData?.friendRequests && userData.friendRequests.length > 0) {
                const requestPromises = userData.friendRequests.map((uid: string) => getDoc(doc(firestore, 'users', uid)));
                const requestDocs = await Promise.all(requestPromises);
                const requestData = requestDocs.filter(d => d.exists()).map(d => ({uid: d.id, ...d.data()}));
                setRequests(requestData);
            } else {
                setRequests([]);
            }
            setLoading(false);
        });

        return () => unsub();

    }, [user, firestore]);

    const handleRequest = async (targetUid: string, action: 'accept' | 'decline') => {
        if (!user || !firestore) return;
        const currentUserRef = doc(firestore, 'users', user.uid);
        const targetUserRef = doc(firestore, 'users', targetUid);

        try {
            if (action === 'accept') {
                await updateDoc(currentUserRef, { 
                    friends: arrayUnion(targetUid), 
                    friendRequests: arrayRemove(targetUid) 
                });
                await updateDoc(targetUserRef, { 
                    friends: arrayUnion(user.uid), 
                    sentRequests: arrayRemove(user.uid) 
                });
                toast({ title: 'Friend request accepted!' });
            } else {
                await updateDoc(currentUserRef, { friendRequests: arrayRemove(targetUid) });
                await updateDoc(targetUserRef, { sentRequests: arrayRemove(user.uid) });
                toast({ title: 'Friend request declined' });
            }
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error handling request' });
        }
    }
    
    if (loading) {
         return (
            <div className="p-3 space-y-4">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2"> <Skeleton className="h-4 w-3/4" /> </div>
                    </div>
                ))}
            </div>
        )
    }

    if (requests.length === 0) {
      return <p className="text-center text-muted-foreground p-4">No new friend requests.</p>
    }

    return (
        <div className="flex flex-col">
            {requests.map((u) => (
                 <div key={u.uid} className="flex items-center p-3">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={u.profilePicture || undefined} alt={u.displayName}/>
                        <AvatarFallback>{u.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                     <div className="flex-1 ml-3">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{u.displayName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">@{u.username}</p>
                    </div>
                    <div className='flex gap-2'>
                        <Button size="sm" onClick={() => handleRequest(u.uid, 'accept')}>Accept</Button>
                        <Button size="sm" variant="outline" onClick={() => handleRequest(u.uid, 'decline')}>Decline</Button>
                    </div>
                </div>
            ))}
        </div>
    )
}
