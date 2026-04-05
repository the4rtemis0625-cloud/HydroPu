
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Leaf, Waves, Activity, LogIn, Cloud, Send, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useUser, useFirestore, useAuth } from "@/firebase";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { doc, serverTimestamp } from "firebase/firestore";
import { useState } from "react";

export default function LandingPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-hydroponics');

  const handleConnect = () => {
    initiateAnonymousSignIn(auth);
  };

  const handlePushSample = () => {
    if (!user || !db) return;
    setSyncing(true);
    
    const sampleId = "sample-system-001";
    const systemRef = doc(db, "users", user.uid, "hydroponicsSystems", sampleId);
    
    setDocumentNonBlocking(systemRef, {
      id: sampleId,
      name: "Demo Hydroponics System",
      description: "Sample system created to verify cloud connection",
      location: "Virtual Garden",
      userId: user.uid,
      cropTypeId: "lettuce-001",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    // Simulate feedback
    setTimeout(() => {
      setSyncing(false);
      setSynced(true);
      setTimeout(() => setSynced(false), 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <header className="w-full max-w-7xl px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg text-white">
            <Waves className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-headline font-bold text-primary tracking-tight">AquaSense</h1>
        </div>
        <div className="flex items-center gap-4">
          {!user ? (
            <Button onClick={handleConnect} disabled={isUserLoading} variant="outline" className="gap-2">
              <Cloud className="w-4 h-4" />
              Connect to Cloud
            </Button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold text-primary uppercase">Connected</span>
            </div>
          )}
          <Link href="/dashboard">
            <Button variant="ghost" className="gap-2">
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      <main className="w-full max-w-7xl px-6 flex flex-col lg:flex-row items-center gap-12 py-12 lg:py-24">
        <div className="flex-1 space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl lg:text-7xl font-headline font-extrabold text-primary leading-tight">
              Precision Hydroponics <br />
              <span className="text-accent">Simplified.</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-xl">
              Monitor, optimize, and scale your hydroponic systems with real-time data visualization and AI-powered growth insights.
            </p>
          </div>
          
          {user && (
            <Card className="bg-primary text-primary-foreground border-none shadow-xl max-w-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Cloud className="w-5 h-5" />
                  Cloud Connection Active
                </CardTitle>
                <CardDescription className="text-primary-foreground/70">
                  Verify your database connection by pushing a sample record.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handlePushSample} 
                  disabled={syncing}
                  className="w-full bg-accent hover:bg-accent/90 text-primary font-bold"
                >
                  {syncing ? "Syncing..." : synced ? "Synced Successfully!" : "Push Sample Collection"}
                  {synced ? <CheckCircle2 className="w-4 h-4 ml-2" /> : <Send className="w-4 h-4 ml-2" />}
                </Button>
                <p className="mt-2 text-[10px] text-center opacity-60">
                  This will create a 'users' collection in your Firestore console.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
                Go to Dashboard
              </Button>
            </Link>
            <Button size="lg" variant="ghost" className="text-lg">
              Learn More
            </Button>
          </div>
        </div>

        <div className="flex-1 w-full relative h-[400px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
        </div>
      </main>

      <section className="w-full bg-white/50 py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader>
              <Activity className="w-12 h-12 text-accent mb-4" />
              <CardTitle className="text-primary">Real-time Dashboard</CardTitle>
              <CardDescription>Visualize pH, temperature, and nutrient levels in a sleek, responsive interface.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader>
              <Waves className="w-12 h-12 text-accent mb-4" />
              <CardTitle className="text-primary">Water Quality Alerts</CardTitle>
              <CardDescription>Instant notifications when parameters fall outside your custom defined thresholds.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader>
              <Leaf className="w-12 h-12 text-accent mb-4" />
              <CardTitle className="text-primary">Growth Optimization</CardTitle>
              <CardDescription>Leverage AI to receive tailored recommendations for your specific crop types.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
      
      <footer className="w-full py-8 text-center text-muted-foreground text-sm border-t border-muted">
        © {new Date().getFullYear()} AquaSense Hydroponics Monitoring. All rights reserved.
      </footer>
    </div>
  );
}
