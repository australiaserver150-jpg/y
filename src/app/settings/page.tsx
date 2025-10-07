
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const router = useRouter();

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>Manage your application settings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p>This is the settings page. More options will be available here in the future.</p>
                        <Button onClick={() => router.back()}>Go Back</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
