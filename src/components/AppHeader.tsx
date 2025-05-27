import { Trophy } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="py-6 px-4 md:px-8 border-b border-border">
      <div className="container mx-auto flex items-center gap-3">
        <Trophy className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-primary">競馬エース</h1>
      </div>
    </header>
  );
}
