
'use client';

import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { CallLog, ChatParticipant } from '@/lib/types';
import { Loading } from '@/components/Loading';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Video, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { cn } from '@/lib/utils';


function getOtherParticipant(log: CallLog, currentUserId: string): ChatParticipant | undefined {
    return log.participantInfo.find(p => p.userId !== currentUserId);
}

function CallLogItem({ log, currentUserId }: { log: CallLog, currentUserId: string }) {
    const otherParticipant = getOtherParticipant(log, currentUserId);

    if (!otherParticipant) {
        return null; // Or some fallback UI for group calls
    }

    const isMissed = log.status === 'Missed';
    const isOutgoing = log.direction === 'Outgoing';
    
    const callTime = format(log.startTime.toDate(), 'p');
    const callDate = formatDistanceToNowStrict(log.startTime.toDate(), { addSuffix: true });
    
    const statusColor = isMissed ? 'text-red-500' : 'text-muted-foreground';

    const handleCallBack = () => {
        // Placeholder for call back functionality
        console.log(`Calling back ${otherParticipant.name}`);
    }

    return (
        <div className="flex items-center gap-4 p-3 hover:bg-muted/50">
            <Avatar className="h-12 w-12">
                <AvatarImage src={otherParticipant.avatar} />
                <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <h3 className={cn("font-semibold", isMissed && "text-red-500")}>{otherParticipant.name}</h3>
                <div className={cn("flex items-center gap-1 text-sm", statusColor)}>
                    {isOutgoing ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                    <span>{callDate}</span>
                </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleCallBack}>
                {log.callType === 'Video' ? <Video className="w-6 h-6 text-primary" /> : <Phone className="w-6 h-6 text-primary" />}
            </Button>
        </div>
    );
}


export default function CallsPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const callLogsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, "callLogs"),
            where("participantIds", "array-contains", user.uid),
            orderBy("startTime", "desc")
        );
    }, [firestore, user]);

    const { data: callLogs, isLoading: areCallsLoading } = useCollection<CallLog>(callLogsQuery);

    if (isUserLoading || areCallsLoading) {
        return <Loading />;
    }

    return (
        <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x">
             <header className="flex items-center gap-4 p-4 border-b bg-card">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft />
                </Button>
                <h1 className="text-xl font-bold font-headline">Call History</h1>
            </header>
            <main className="flex-1 overflow-y-auto">
                <div className="divide-y">
                     {callLogs && callLogs.length > 0 ? (
                        callLogs.map(log => user && <CallLogItem key={log.id} log={log} currentUserId={user.uid} />)
                    ) : (
                        <div className="text-center text-muted-foreground py-16">
                            <p>No recent calls.</p>
                            <p className="text-sm">You can start a call from a chat.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
