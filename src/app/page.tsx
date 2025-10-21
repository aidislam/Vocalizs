import VocalizeClient from '@/components/vocalize/vocalize';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-headline font-bold text-foreground tracking-tight">
            Vocalize
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Bring your text to life. Enter your text, choose a voice, and press
            play.
          </p>
        </header>
        <VocalizeClient />
      </div>
    </main>
  );
}
