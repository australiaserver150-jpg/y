'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FriendList, RequestList, UserList, useUserList } from './ChatList';
import { Input } from './ui/input';
import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { useFirestore, useUser } from '@/firebase';
import { DocumentData, collection, getDocs, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useRouter } from 'next/navigation';


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


function UserSearch() {
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DocumentData[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const { currentUserProfile, sendFriendRequest } = useUserList();

  const getButtonState = (otherUser: any) => {
    if (!currentUserProfile) return <Button disabled>Loading...</Button>;

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
        const q = query(usersRef, where('username', '>=', searchQuery.trim()), where('username', '<=', searchQuery.trim() + '\uf8ff'));
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
        <div>
            <div className="p-4 border-b">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search by username..." 
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
                <UserList />
            )}
        </div>
    )
}

export function FriendsSidebar() {

  return (
    <div className="w-96 flex flex-col h-full">
        <header className="p-4 border-b border-r">
            <h2 className="text-xl font-bold">Friends</h2>
        </header>
        <div className="flex-1 overflow-y-auto border-r">
            <Accordion type="multiple" className="w-full" defaultValue={['friends', 'requests']}>
                <AccordionItem value="friends">
                    <AccordionTrigger className="p-4 text-lg font-semibold">Friends</AccordionTrigger>
                    <AccordionContent>
                        <FriendList />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="requests">
                    <AccordionTrigger className="p-4 text-lg font-semibold">Requests</AccordionTrigger>
                    <AccordionContent>
                        <RequestList />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="find_users">
                    <AccordionTrigger className="p-4 text-lg font-semibold">Find Users</AccordionTrigger>
                    <AccordionContent>
                        <UserSearch />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    </div>
  );
}
