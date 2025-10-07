
"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/firebase/auth/auth-provider";
import { useRouter } from "next/navigation";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "lucide-react";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
    if (user) {
      setDisplayName(user.displayName || "");
      setPhotoURL(user.photoURL || "");
      
      // Also fetch from firestore in case it's more up-to-date
      const fetchUserData = async () => {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setDisplayName(data.name || user.displayName || "");
          setPhotoURL(data.avatar || user.photoURL || "");
        }
      };
      fetchUserData();
    }
  }, [user, loading, router]);

  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const storageRef = ref(storage, `profile-pictures/${user.uid}`);
    
    setUploading(true);

    try {
      await uploadBytes(storageRef, file);
      const newPhotoURL = await getDownloadURL(storageRef);
      
      await updateProfile(user, { photoURL: newPhotoURL });
      
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
    if (!user) return;
    
    try {
      // Update Firebase Auth profile
      await updateProfile(user, { displayName: displayName });

      // Update Firestore document
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { name: displayName, email: user.email }, { merge: true });

      toast({ title: "Profile updated successfully!" });
      router.push('/');
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message,
      });
    }
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
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
                        <AvatarImage src={photoURL} />
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
                        <Camera className="w-5 h-5"/>
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
                 <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                 <Button type="submit">Save Changes</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
