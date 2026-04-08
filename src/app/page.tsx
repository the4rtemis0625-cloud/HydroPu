
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Waves, 
  Activity, 
  Cloud, 
  FlaskConical, 
  Thermometer, 
  Droplets, 
  Zap,
  Clock,
  Database,
  Cpu
} from "lucide-react";
import Image from "next/image";
import { useUser, useAuth, useDatabase } from "@/firebase";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { ref, onValue } from "firebase/database";
import { HistoricalCharts } from "@/components/dashboard/historical-charts";
import { AIOptimizer } from "@/components/dashboard/ai-optimizer";
import { PlaceHolderImages } from "@/lib/placeholder-images";

interface SensorData {
  ph: number;
  temperature: number;
  humidity: number;
  tds: number;
}

export default function OnePager() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const rtdb = useDatabase();
  
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  
  const [sensors, setSensors] = useState<SensorData>({
    ph: 6.2,
    temperature: 22.4,
    humidity: 64,
    tds: 1.8,
  });

  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-hydroponics');

  useEffect(() => {
    if (!rtdb) return;

    // Monitoring the history/latest path as requested
    const latestRef = ref(rtdb, 'history/latest');
    
    const unsubscribe = onValue(latestRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setIsLive(true);
        // Mapping exactly to the keys reported: humidity, ph, tds, temperature
        setSensors({
          ph: data.ph !== undefined ? Number(data.ph) : 6.2,
          temperature: data.temperature !== undefined ? Number(data.temperature) : 22.4,
          humidity: data.humidity !== undefined ? Number(data.humidity) : 64,
          tds: data.tds !== undefined ? Number(data.tds) : 0,
        });
        setLastUpdated(new Date().toLocaleTimeString());
      }
    });

    return () => unsubscribe();
  }, [rtdb]);

  const handleConnect = () => {
    initiateAnonymousSignIn(auth);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full bg-background/80 border-b border-muted/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg text-white">
              <Waves className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-headline font-bold text-primary tracking-tight">AquaSense</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#monitor" className="text-sm font-medium hover:text-primary transition-colors">Monitoring</a>
            <a href="#insights" className="text-sm font-medium hover:text-primary transition-colors">AI Insights</a>
            <a href="#hub" className="text-sm font-medium hover:text-primary transition-colors">System Hub</a>
          </nav>

          <div className="flex items-center gap-4">
            {!user ? (
              <Button onClick={handleConnect} disabled={isUserLoading} variant="outline" size="sm" className="gap-2">
                <Cloud className="w-4 h-4" />
                Connect Cloud
              </Button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-bold text-primary uppercase">Connected</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full max-w-7xl mx-auto px-6 pt-12 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl lg:text-7xl font-headline font-extrabold text-primary leading-tight">
                Live Sensor <br />
                <span className="text-accent">Intelligence.</span>
              </h2>
              <div className="text-xl text-muted-foreground max-w-xl">
                Streaming your real-time hydroponics data from <code className="bg-muted px-1 rounded">history/latest</code>.
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8" asChild>
                <a href="#monitor">View Live Trends</a>
              </Button>
            </div>
          </div>

          <div className="relative h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
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
        </section>

        {/* Monitoring Section */}
        <section id="monitor" className="py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-headline font-bold text-primary">Real-Time Monitoring</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="text-muted-foreground text-sm">Visualizing data stream from your sensor hub</div>
                  {lastUpdated && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-primary/60 uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded">
                      <Clock className="w-3 h-3" />
                      Updated: {lastUpdated}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-full border border-accent/20">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isLive ? 'bg-accent' : 'bg-muted-foreground'} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-accent' : 'bg-muted-foreground'}`}></span>
                </span>
                <span className="text-xs font-bold text-accent uppercase tracking-tighter">
                  {isLive ? 'Live Stream Active' : 'Waiting for Data'}
                </span>
              </div>
            </div>

            <HistoricalCharts />
          </div>
        </section>

        {/* AI Insights Section */}
        <section id="insights" className="py-24">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-xs font-bold uppercase">
                <Zap className="w-3 h-3" />
                AI Optimization
              </div>
              <h2 className="text-4xl font-headline font-bold text-primary leading-tight">
                Dynamic Growth Recommendation
              </h2>
              <div className="text-lg text-muted-foreground">
                Analyzing your current sensor values against optimal growth curves.
              </div>
              {sensors.ph < 4.0 && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-start gap-3">
                  <Activity className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-destructive">Low pH Detected</h4>
                    <div className="text-sm text-destructive/80">Current pH: {sensors.ph}. Please adjust your nutrient solution.</div>
                  </div>
                </div>
              )}
            </div>
            <AIOptimizer />
          </div>
        </section>

        {/* Real-Time Hub */}
        <section id="hub" className="py-24 bg-white/50 border-t border-muted">
          <div className="max-w-7xl mx-auto px-6">
            <div className="p-12 bg-background rounded-[2.5rem] border border-muted shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32" />
              
              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-headline font-bold text-primary flex items-center gap-3">
                    <Cpu className="w-8 h-8 text-accent" />
                    Live System Hub
                  </h3>
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-xl border border-muted">
                    <Database className="w-4 h-4 text-primary/60" />
                    <span className="text-xs font-bold text-primary/80 uppercase tracking-tight">RTDB Stream</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-6 bg-white rounded-2xl border border-muted shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-2 font-headline">
                      <FlaskConical className="w-4 h-4 text-primary" /> pH Level
                    </div>
                    <div className="font-bold text-primary text-4xl tracking-tighter">{sensors.ph}</div>
                    <div className="mt-2 text-[10px] text-muted-foreground uppercase font-bold">Optimal: 5.5 - 6.5</div>
                  </div>

                  <div className="p-6 bg-white rounded-2xl border border-muted shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-2 font-headline">
                      <Thermometer className="w-4 h-4 text-accent" /> Temperature
                    </div>
                    <div className="font-bold text-primary text-4xl tracking-tighter">{sensors.temperature}°C</div>
                    <div className="mt-2 text-[10px] text-muted-foreground uppercase font-bold">Optimal: 18 - 24°C</div>
                  </div>

                  <div className="p-6 bg-white rounded-2xl border border-muted shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-2 font-headline">
                      <Droplets className="w-4 h-4 text-accent" /> Humidity
                    </div>
                    <div className="font-bold text-primary text-4xl tracking-tighter">{sensors.humidity}%</div>
                    <div className="mt-2 text-[10px] text-muted-foreground uppercase font-bold">Optimal: 50 - 70%</div>
                  </div>

                  <div className="p-6 bg-white rounded-2xl border border-muted shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-2 font-headline">
                      <Activity className="w-4 h-4 text-primary" /> Nutrient TDS
                    </div>
                    <div className="font-bold text-primary text-4xl tracking-tighter">{sensors.tds}</div>
                    <div className="mt-2 text-[10px] text-muted-foreground uppercase font-bold">PPM Value</div>
                  </div>
                </div>

                <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-1">
                    <div className="font-bold text-primary">Controller Status</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-accent' : 'bg-muted-foreground'}`} />
                      {isLive ? 'Active connection to Sensor Hub' : 'Awaiting sensor hub handshake...'}
                    </div>
                  </div>
                  <div className="text-xs font-medium text-muted-foreground bg-white px-4 py-2 rounded-lg border border-muted">
                    Listening at: history/latest
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-12 bg-white border-t border-muted">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Waves className="w-5 h-5 text-primary" />
            <span className="font-headline font-bold text-primary">AquaSense</span>
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            © {new Date().getFullYear()} AquaSense Monitoring Hub.
          </div>
        </div>
      </footer>
    </div>
  );
}
