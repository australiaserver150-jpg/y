'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp, where } from 'firebase/firestore';
import { Status, User as UserType } from '@/lib/types';
import { Loading } from '@/components/Loading';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, Edit } from 'lucide-react';
import { StatusViewer } from '@/components/status/status-viewer';
import { formatDistanceToNowStrict } from 'date-fns';

type StatusGroup = {
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  statuses: Status[];
  lastStatusTimestamp: Timestamp;
  allViewed: boolean;
};

function StatusListItem({ group, onClick }: { group: StatusGroup; onClick: () => void }) {
  const ringClass = group.allViewed
    ? 'ring-gray-300 dark:ring-gray-700'
    : 'ring-green-500 dark:ring-green-400';
  
  const lastUpdate = formatDistanceToNowStrict(group.lastStatusTimestamp.toDate(), { addSuffix: true });

  return (
    <div className="flex items-center gap-4 p-3 hover:bg-muted/50 cursor-pointer" onClick={onClick}>
      <div className={`relative p-0.5 rounded-full ring-2 ${ringClass}`}>
        <Avatar className="h-14 w-14">
          <AvatarImage src={group.user.avatar} alt={group.user.name} />
          <AvatarFallback>{group.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1">
        <h3 className="font-semibold">{group.user.name}</h3>
        <p className="text-sm text-muted-foreground">{lastUpdate}</p>
      </div>
    </div>
  );
}

export default function StatusPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const [selectedStatusGroup, setSelectedStatusGroup] = useState<StatusGroup | null>(null);

  const twentyFourHoursAgo = useMemo(() => {
    return Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000);
  }, []);

  const statusesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'statuses'),
      where('timestamp', '>=', twentyFourHoursAgo),
      orderBy('timestamp', 'desc')
    );
  }, [firestore, twentyFourHoursAgo]);

  const { data: statuses, isLoading: areStatusesLoading } = useCollection<Status>(statusesQuery);

  const statusGroups = useMemo(() => {
    if (!statuses || !user) return [];
    
    const groups: { [key: string]: StatusGroup } = {};

    statuses.forEach((status) => {
      if (!groups[status.userId]) {
        groups[status.userId] = {
          user: {
            id: status.userId,
            name: status.userName,
            avatar: status.userAvatar,
          },
          statuses: [],
          lastStatusTimestamp: status.timestamp,
          allViewed: true,
        };
      }
      groups[status.userId].statuses.push(status);
      if (status.timestamp > groups[status.userId].lastStatusTimestamp) {
        groups[status.userId].lastStatusTimestamp = status.timestamp;
      }
      // If any status is not viewed by the current user, the group is not all viewed.
      if (!status.viewers.includes(user.uid)) {
        groups[status.userId].allViewed = false;
      }
    });

    return Object.values(groups).sort((a, b) => b.lastStatusTimestamp.toMillis() - a.lastStatusTimestamp.toMillis());
  }, [statuses, user]);

  if (isUserLoading || areStatusesLoading) {
    return <Loading />;
  }

  const myStatusGroup = statusGroups.find(g => g.user.id === user?.uid);
  const recentUpdates = statusGroups.filter(g => g.user.id !== user?.uid);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x">
      <header className="flex items-center gap-4 p-4 bg-card text-card-foreground shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold font-headline">Status</h1>
      </header>
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-3">
          <StatusListItem
            group={myStatusGroup || {
                user: { id: user!.uid, name: user!.displayName || "My Status", avatar: user!.photoURL || ''},
                statuses: [],
                lastStatusTimestamp: Timestamp.now(),
                allViewed: true
            }}
            onClick={() => myStatusGroup && setSelectedStatusGroup(myStatusGroup)}
          />
        </div>
        
        {recentUpdates.length > 0 && (
          <div className="p-3 pt-0">
            <h2 className="text-sm font-semibold text-muted-foreground px-3 mb-2">RECENT UPDATES</h2>
            <div className="divide-y">
                {recentUpdates.map(group => (
                    <StatusListItem key={group.user.id} group={group} onClick={() => setSelectedStatusGroup(group)} />
                ))}
            </div>
          </div>
        )}
      </main>

      <div className="absolute bottom-24 right-4 flex flex-col gap-3">
        <Button className="rounded-full w-12 h-12 bg-muted text-foreground shadow-lg hover:bg-muted/90">
            <Edit className="w-6 h-6"/>
        </Button>
        <Button className="rounded-full w-14 h-14 bg-primary hover:bg-primary/90 shadow-lg">
            <Camera className="w-7 h-7"/>
        </Button>
      </div>

      {selectedStatusGroup && user && (
        <StatusViewer
          group={selectedStatusGroup}
          currentUserId={user.uid}
          onClose={() => setSelectedStatusGroup(null)}
        />
      )}
    </div>
  );
}