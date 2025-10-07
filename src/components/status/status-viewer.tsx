
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Status as StatusType } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { X, Pause, Play, ChevronUp, MessageCircle } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import Image from 'next/image';

type StatusGroup = {
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  statuses: StatusType[];
};

interface StatusViewerProps {
  group: StatusGroup;
  currentUserId: string;
  onClose: () => void;
}

export function StatusViewer({ group, currentUserId, onClose }: StatusViewerProps) {
  const firestore = useFirestore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentStatus = group.statuses[currentIndex];

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < group.statuses.length - 1 ? prev + 1 : prev));
    if (currentIndex >= group.statuses.length - 1) {
      onClose();
    }
  }, [currentIndex, group.statuses.length, onClose]);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  useEffect(() => {
    if (!currentStatus || !firestore) return;

    // Mark status as viewed if not already
    if (!currentStatus.viewers.includes(currentUserId)) {
      const statusRef = doc(firestore, 'statuses', currentStatus.id);
      updateDoc(statusRef, {
        viewers: arrayUnion(currentUserId),
      }).catch(console.error);
    }
  }, [currentStatus, currentUserId, firestore]);

  useEffect(() => {
    setProgress(0);
    setIsPaused(false);
  }, [currentIndex]);
  
  useEffect(() => {
    if (isPaused || !currentStatus) return;

    const duration = (currentStatus.duration || 5) * 1000;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          goToNext();
          return 100;
        }
        return prev + 100 / (duration / 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, goToNext, currentStatus]);

  const handlePauseResume = (e: React.MouseEvent) => {
     e.stopPropagation();
     setIsPaused(p => !p)
  };

  if (!currentStatus) return null;

  return (
    <div 
        className="fixed inset-0 bg-black z-50 flex flex-col"
        onClick={handlePauseResume}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
    >
      {/* Progress Bars */}
      <div className="flex gap-1 p-2 absolute top-0 left-0 right-0">
        {group.statuses.map((_, index) => (
          <Progress
            key={index}
            value={index < currentIndex ? 100 : index === currentIndex ? progress : 0}
            className="h-1 bg-gray-500/50"
          />
        ))}
      </div>
      
      {/* Header */}
      <div className="flex items-center gap-3 p-4 absolute top-2 left-0 right-0">
        <Avatar>
          <AvatarImage src={group.user.avatar} />
          <AvatarFallback>{group.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <p className="font-semibold text-white">{group.user.name}</p>
        <div className="flex-grow" />
        <button onClick={e => {e.stopPropagation(); onClose()}} className="text-white">
          <X size={24} />
        </button>
      </div>

      {/* Navigation */}
      <div className="absolute left-0 top-0 bottom-20 w-1/3 z-10" onClick={e => {e.stopPropagation(); goToPrev()}} />
      <div className="absolute right-0 top-0 bottom-20 w-2/3 z-10" onClick={e => {e.stopPropagation(); goToNext()}} />


      {/* Content */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        {currentStatus.type === 'media' ? (
          <Image
            src={currentStatus.content}
            alt="Status"
            layout="fill"
            objectFit="contain"
            className="max-w-full max-h-full"
          />
        ) : (
          <div className="p-8 text-white text-3xl font-bold text-center bg-blue-500 h-full w-full flex items-center justify-center">
            <p>{currentStatus.content}</p>
          </div>
        )}
      </div>

        {/* Footer for reply */}
       <div className="p-4 flex flex-col items-center text-white" onClick={e => e.stopPropagation()}>
         {group.user.id === currentUserId ? (
            <div className="flex items-center gap-2">
                <MessageCircle size={20} />
                <span>{currentStatus.viewers.length} views</span>
            </div>
         ) : (
            <>
                <ChevronUp size={24} />
                <p>Reply</p>
            </>
         )}
      </div>
    </div>
  );
}