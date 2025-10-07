"use client";

import { useEffect, useState } from "react";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { Loading } from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFirebase } from "@/firebase/provider";

function ChatPageContent() {
  const { auth, firestore: db } = useFirebase();
  const [user, loading] = useAuthState(auth!);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  // Google Sign-In
  const handleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  // Load messages in realtime
  useEffect(() => {
    if (!user || !db) return;
    const q = query(collection(db, "messages"), orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [user, db]);

  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !db) return;
    await addDoc(collection(db, "messages"), {
      text: input,
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
    });
    setInput("");
  };

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-[450px]">
                <CardHeader className="text-center">
                <CardTitle>Welcome to ConnectNow</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Button onClick={handleSignIn}>Sign in with Google</Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl h-[90vh] flex flex-col">
        <CardHeader>
          <CardTitle className="text-center">Realtime Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
            <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-start gap-3 ${msg.uid === user.uid ? 'justify-end' : ''}`}>
                         {msg.uid !== user.uid && (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={msg.photoURL} />
                                <AvatarFallback>{msg.displayName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                         )}
                        <div className={`p-3 rounded-lg max-w-xs ${msg.uid === user.uid ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                            <p className="text-xs text-muted-foreground font-semibold mb-1">{msg.displayName}</p>
                            <p>{msg.text}</p>
                        </div>
                        {msg.uid === user.uid && (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.photoURL || undefined} />
                                <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                         )}
                    </div>
                ))}
                </div>
            </ScrollArea>
          <form onSubmit={sendMessage} className="flex gap-2 border-t pt-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
            />
            <Button type="submit">Send</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


export default function ChatPage() {
  const { auth } = useFirebase();
  
  return auth ? <ChatPageContent /> : <Loading />;
}

    