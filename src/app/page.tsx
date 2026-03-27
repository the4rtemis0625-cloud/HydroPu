
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Leaf, Waves, Activity, LogIn } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-hydroponics');

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <header className="w-full max-w-7xl px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg text-white">
            <Waves className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-headline font-bold text-primary tracking-tight">AquaSense</h1>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="gap-2">
            <LogIn className="w-4 h-4" />
            Sign In
          </Button>
        </Link>
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
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
                Get Started
              </Button>
            </Link>
            <Button size="lg" variant="ghost" className="text-lg">
              Learn More
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-muted">
            <div className="space-y-1">
              <p className="text-3xl font-bold text-primary">24/7</p>
              <p className="text-sm text-muted-foreground uppercase tracking-widest">Monitoring</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-primary">AI</p>
              <p className="text-sm text-muted-foreground uppercase tracking-widest">Optimized</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-primary">100%</p>
              <p className="text-sm text-muted-foreground uppercase tracking-widest">Real-time</p>
            </div>
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
