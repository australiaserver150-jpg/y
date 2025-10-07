"use client";

import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import React from "react";

interface SettingsItemProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  onClick?: () => void;
  className?: string;
}

export function SettingsItem({ icon: Icon, title, subtitle, onClick, className }: SettingsItemProps) {
  const content = (
    <div className={cn("flex items-center p-4 cursor-pointer hover:bg-muted/50", className)}>
      <Icon className="w-6 h-6 mr-4 text-muted-foreground" />
      <div className="flex-grow">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        {content}
      </button>
    );
  }

  return <div>{content}</div>;
}
