
'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Channel } from '@/lib/types';
import { Loading } from '@/components/Loading';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Hash } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

function ChannelListItem({ channel }: { channel: Channel }) {
    const router = useRouter();

    return (
        <Card className="hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/channels/${channel.id}`)}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Hash className="w-5 h-5 text-muted-foreground" />
                    <span>{channel.name}</span>
                </CardTitle>
                <CardDescription>{channel.description}</CardDescription>
            </CardHeader>
            <CardFooter>
                 <p className="text-xs text-muted-foreground">{channel.memberIds.length} members</p>
            </CardFooter>
        </Card>
    );
}

export default function ChannelsPage() {
  const firestore = useFirestore();
  const router = useRouter();

  const channelsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'channels'));
  }, [firestore]);

  const { data: channels, isLoading } = useCollection<Channel>(channelsQuery);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-background border-x">
       <header className="flex items-center gap-4 p-4 border-b bg-card">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold font-headline">Channels</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {channels && channels.length > 0 ? (
          channels.map(channel => <ChannelListItem key={channel.id} channel={channel} />)
        ) : (
          <div className="text-center text-muted-foreground py-16">
            <p>No channels found.</p>
            <p className="text-sm">Check back later or create a new one.</p>
          </div>
        )}
      </main>
    </div>
  );
}
