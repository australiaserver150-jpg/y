'use client';
import { Search, X } from 'lucide-react';
import { UserNav } from './layout/user-nav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatList, UserList, FriendList, RequestList, useUserList } from './ChatList';
import { useRouter } from 'next/navigation';
import { Input } from './ui/input';
import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, DocumentData } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

function SearchResults({ results, getButtonState }: { results: DocumentData[], getButtonState: (user: any) => JSX.Element }) {
    if (results.length === 0) {
        return <p className="text-center text-muted-foreground p-4">No users found.</p>
    }
    return (
        <div className="flex flex-col">
            {results.map((u) => (
                 <div key={u.uid} className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={u.profilePicture || undefined} alt={u.name}/>
                        <AvatarFallback>{u.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                     <div className="flex-1 ml-3">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{u.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">@{u.username}</p>
                    </div>
                    {getButtonState(u)}
                </div>
            ))}
        </div>
    )
}


export function UserDashboard() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DocumentData[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const { currentUser, currentUserProfile, sendFriendRequest } = useUserList();
  
  const getButtonState = (otherUser: any) => {
    if (!currentUserProfile) return <Button disabled>Loading...</Button>;

    if (currentUserProfile.friends?.includes(otherUser.uid)) {
        return <Button disabled>Friends</Button>
    }
    if (currentUserProfile.sentRequests?.includes(otherUser.uid)) {
        return <Button disabled>Request Sent</Button>
    }
    if (currentUserProfile.friendRequests?.includes(otherUser.uid)) {
         return <Button onClick={() => { /* handleRequest is not exported */ }}>Accept Request</Button>
    }
    return <Button onClick={() => sendFriendRequest(otherUser.uid)}>Add Friend</Button>
  }


  const handleSearch = async () => {
    if (!searchQuery.trim()) {
        setHasSearched(false);
        setSearchResults([]);
        return;
    }
    if (!firestore || !currentUser) return;
    setIsSearching(true);
    setHasSearched(true);
    
    try {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('username', '==', searchQuery.trim()));
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs
            .map(doc => ({ uid: doc.id, ...doc.data() }))
            .filter(user => user.uid !== currentUser.uid);
        setSearchResults(users);
    } catch (error) {
        console.error("Error searching users:", error);
        toast({ variant: 'destructive', title: 'Search failed' });
    } finally {
        setIsSearching(false);
    }
  }

  const clearSearch = () => {
    setSearchQuery('');
    setHasSearched(false);
    setSearchResults([]);
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x">
      <header className="flex items-center justify-between p-4 border-b sticky top-0 z-10 bg-background">
        <h1 className="text-xl font-bold font-headline">ConnectNow</h1>
        <div className="flex items-center gap-2">
          <UserNav />
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-4 border-b">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search for users by username..." 
                    className="pl-10 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearch();
                    }}
                />
                {searchQuery && (
                    <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={clearSearch}>
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
        
        {hasSearched ? (
            isSearching ? <p className="text-center p-4">Searching...</p> : <SearchResults results={searchResults} getButtonState={getButtonState} />
        ) : (
            <Tabs defaultValue="chats" className="w-full flex flex-col flex-1">
                <TabsList className="grid w-full grid-cols-4 rounded-none">
                    <TabsTrigger value="chats">Chats</TabsTrigger>
                    <TabsTrigger value="friends">Friends</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="settings" onClick={() => router.push('/settings')}>Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="chats" className="flex-1 overflow-y-auto">
                    <ChatList />
                </TabsContent>
                <TabsContent value="friends" className="flex-1 overflow-y-auto">
                    <FriendList />
                </TabsContent>
                <TabsContent value="users" className="flex-1 overflow-y-auto">
                    <Tabs defaultValue='all_users' className='w-full'>
                    <TabsList className='grid w-full grid-cols-2 rounded-none'>
                        <TabsTrigger value="all_users">All Users</TabsTrigger>
                        <TabsTrigger value="requests">Requests</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all_users">
                        <UserList />
                    </TabsContent>
                    <TabsContent value="requests">
                        <RequestList />
                    </TabsContent>
                    </Tabs>
                </TabsContent>
            </Tabs>
        )}
      </main>
    </div>
  );
}
