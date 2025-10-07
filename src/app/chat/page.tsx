"use client";

import { useEffect, useState, useCallback } from "react";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp } from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { Loading } from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFirebase } from "@/firebase/provider";
import { suggestReplies, SmartReplyInput } from "@/ai/flows/smart-reply-suggestions";

// Type for a message from Firestore
interface FirestoreMessage {
  id: string;
  text: string;
  uid: string;
  displayName: string;
  photoURL: string;
  createdAt: Timestamp | null;
}

function ChatPageContent() {
  const { auth, firestore: db } = useFirebase();
  const [user, loading] = useAuthState(auth!);
  const [messages, setMessages] = useState<FirestoreMessage[]>([]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Google Sign-In
  const handleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };
  
  // Send message function
  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !user || !db) return;
    await addDoc(collection(db, "messages"), {
      text: messageText,
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
    });
  };

  // Form submission handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
    setInput("");
    setSuggestions([]); // Clear suggestions after sending a message
  };

  // Handle clicking a suggestion
  const handleSuggestionClick = async (suggestion: string) => {
    await sendMessage(suggestion);
    setSuggestions([]);
  };

  // Debounced function to get smart replies
  const getSmartReplies = useCallback(async (currentMessages: FirestoreMessage[]) => {
    if (!user || isGenerating || currentMessages.length === 0) return;

    // Only generate replies if the last message is not from the current user
    const lastMessage = currentMessages[currentMessages.length - 1];
    if (lastMessage.uid === user.uid) {
        setSuggestions([]);
        return;
    }

    setIsGenerating(true);
    try {
      const history: SmartReplyInput['history'] = currentMessages.slice(-5).map(msg => ({
        text: msg.text,
        isFromCurrentUser: msg.uid === user.uid,
      }));

      const result = await suggestReplies({ history });
      setSuggestions(result.suggestions || []);
    } catch (error) {
      console.error("Error fetching smart replies:", error);
      setSuggestions([]); // Clear suggestions on error
    } finally {
      setIsGenerating(false);
    }
  }, [user, isGenerating]);


  // Load messages in realtime and trigger smart replies
  useEffect(() => {
    if (!user || !db) return;
    const q = query(collection(db, "messages"), orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreMessage));
      setMessages(newMessages);
      getSmartReplies(newMessages);
    });
    return unsubscribe;
  }, [user, db, getSmartReplies]);


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

            <div className="border-t pt-4">
                {suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {suggestions.map((suggestion, index) => (
                        <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuggestionClick(suggestion)}
                            disabled={isGenerating}
                        >
                            {suggestion}
                        </Button>
                        ))}
                    </div>
                )}
                <form onSubmit={handleFormSubmit} className="flex gap-2">
                    <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    />
                    <Button type="submit">Send</Button>
                </form>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}


export default function ChatPage() {
  const { auth } = useFirebase();
  
  return auth ? <ChatPageContent /> : <Loading />;
}
