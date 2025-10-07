
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold font-headline">Welcome</CardTitle>
          <CardDescription>This is a minimal Next.js application.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Get started by editing <code>src/app/page.tsx</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default HomePage;
