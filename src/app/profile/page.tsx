"use client";

import { useState, useEffect, useRef } from "react";
import { useFirebase } from "@/firebase/provider";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "lucide-react";
import { Loading } from "@/components/Loading";

function ProfilePageContent() {
  const { auth, db, storage } = useFirebase();
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
    if (user && db) {
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setDisplayName(data.name || user.displayName || "");
            setPhotoURL(data.avatar || user.photoURL || "");
          } else {
            setDisplayName(user.displayName || user.email?.split('@')[0] || '');
            setPhotoURL(user.photoURL || "");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setInitialLoading(false);
        }
      };
      fetchUserData();
    } else if (!authLoading) {
      setInitialLoading(false);
    }
  }, [user, authLoading, router, db]);

  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0 || !storage || !db) return;

    const file = e.target.files[0];
    const storageRef = ref(storage, `profile-pictures/${user.uid}`);
    
    setUploading(true);

    try {
      await uploadBytes(storageRef, file);
      const newPhotoURL = await getDownloadURL(storageRef);
      
      if(auth?.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: newPhotoURL });
      }
      
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { avatar: newPhotoURL }, { merge: true });

      setPhotoURL(newPhotoURL);
      toast({ title: "Profile picture updated!" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  };
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !auth) return;
    
    try {
      if(auth.currentUser){
        await updateProfile(auth.currentUser, { displayName: displayName });
      }

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { name: displayName }, { merge: true });

      toast({ title: "Profile updated successfully!" });
      router.push('/chat');
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message,
      });
    }
  }

  if (authLoading || initialLoading) {
    return <Loading />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate}>
            <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                    <Avatar className="w-32 h-32 text-lg">
                        <AvatarImage src={photoURL} alt={displayName} />
                        <AvatarFallback>
                        {displayName?.charAt(0) || user?.email?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <Button 
                        type="button"
                        variant="outline"
                        size="icon"
                        className="absolute bottom-1 right-1 rounded-full"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        {uploading ? "..." : <Camera className="w-5 h-5"/>}
                    </Button>
                    <Input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handlePictureUpload}
                        className="hidden" 
                        accept="image/png, image/jpeg"
                    />
                </div>

              <div className="w-full space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Name"
                />
              </div>
               <div className="w-full space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                />
              </div>

              <div className="flex justify-end w-full space-x-2">
                 <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                 <Button type="submit">Save Changes</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
    return (
        <ProfilePageContent />
    )
}
