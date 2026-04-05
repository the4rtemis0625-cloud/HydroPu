
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Waves, 
  Activity, 
  Cloud, 
  Send, 
  CheckCircle2, 
  FlaskConical, 
  Thermometer, 
  Droplets, 
  Zap,
  Clock,
  AlertTriangle
} from "lucide-react";
import Image from "next/image";
import { useUser, useFirestore, useAuth, useDatabase } from "@/firebase";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { doc } from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import { SensorCard } from "@/components/dashboard/sensor-card";
import { HistoricalCharts } from "@/components/dashboard/historical-charts";
import { AIOptimizer } from "@/components/dashboard/ai-optimizer";
import { PlaceHolderImages } from "@/lib/placeholder-images";

interface SensorData {
  ph: number;
  waterTemp: number;
  airTemp: number;
  humidity: number;
  tds: number;
}

export default function OnePager() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const rtdb = useDatabase();
  
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  
  const [sensors, setSensors] = useState<SensorData>({
    ph: 6.2,
    waterTemp: 22.4,
    airTemp: 24.5,
    humidity: 64,
    tds: 1.8,
  });

  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-hydroponics');

  useEffect(() => {
    if (!rtdb) return;

    // Listen to the specific path: history/latest
    // Mapping: humidity, ph, tds, temperature
    const sensorsRef = ref(rtdb, 'history/latest');
    
    const unsubscribe = onValue(sensorsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setIsLive(true);
        setSensors({
          ph: data.ph !== undefined ? Number(data.ph) : (data.pH !== undefined ? Number(data.pH) : 6.2),
          waterTemp: data.temperature !== undefined ? Number(data.temperature) : (data.temp !== undefined ? Number(data.temp) : 22.4),
          airTemp: data.temperature !== undefined ? Number(data.temperature) : (data.temp !== undefined ? Number(data.temp) : 24.5),
          humidity: data.humidity !== undefined ? Number(data.humidity) : 64,
          tds: data.tds !== undefined ? Number(data.tds) : (data.ec !== undefined ? Number(data.ec) : 1.8),
        });
        setLastUpdated(new Date().toLocaleTimeString());
      }
    });

    return () => unsubscribe();
  }, [rtdb]);

  const handleConnect = () => {
    initiateAnonymousSignIn(auth);
  };

  const handlePushSample = () => {
    if (!user || !db) return;
    setSyncing(true);
    
    const sampleId = "sample-system-" + Date.now();
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

    setTimeout(() => {
      setSyncing(false);
      setSynced(true);
      setTimeout(() => setSynced(false), 3000);
    }, 1000);
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
            <a href="#system" className="text-sm font-medium hover:text-primary transition-colors">System Hub</a>
          </nav>

          <div className="flex items-center gap-4">
            {!user ? (
              <Button onClick={handleConnect} disabled={isUserLoading} variant="outline" size="sm" className="gap-2">
                <Cloud className="w-4 h-4" />
                Connect to Cloud
              </Button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-bold text-primary uppercase">Cloud Connected</span>
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
                Precision Hydroponics <br />
                <span className="text-accent">Simplified.</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-xl">
                Monitor, optimize, and scale your hydroponic systems with real-time data from your sensor hub.
              </p>
            </div>
            
            <div className="flex gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8" asChild>
                <a href="#monitor">View Live Data</a>
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

        {/* Monitoring Dashboard Section */}
        <section id="monitor" className="py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-headline font-bold text-primary">Live Controller Hub</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-muted-foreground text-sm">Real-time data from hub sensors</p>
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
                  {isLive ? 'Streaming Live' : 'Waiting for Data'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
              <SensorCard 
                label="pH Level"
                value={sensors.ph}
                unit="pH"
                icon={<FlaskConical className="w-4 h-4" />}
                min={5.5}
                max={6.5}
              />
              <SensorCard 
                label="Water Temp"
                value={sensors.waterTemp}
                unit="°C"
                icon={<Waves className="w-4 h-4" />}
                min={18}
                max={24}
              />
              <SensorCard 
                label="Air Temp"
                value={sensors.airTemp}
                unit="°C"
                icon={<Thermometer className="w-4 h-4" />}
                min={20}
                max={28}
              />
              <SensorCard 
                label="Humidity"
                value={sensors.humidity}
                unit="%"
                icon={<Droplets className="w-4 h-4" />}
                min={50}
                max={70}
              />
              <SensorCard 
                label="Nutrient TDS"
                value={sensors.tds}
                unit="ppm"
                icon={<Activity className="w-4 h-4" />}
                min={1.2}
                max={2000}
              />
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
                Intelligence Layer
              </div>
              <h2 className="text-4xl font-headline font-bold text-primary leading-tight">
                AI Powered Growth Analysis
              </h2>
              <p className="text-lg text-muted-foreground">
                Analyzing your real-time data against optimal parameters.
              </p>
              {sensors.ph < 5.5 && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-destructive">Critical pH Alert</h4>
                    <p className="text-sm text-destructive/80">Your pH ({sensors.ph}) is significantly below the target range. Root damage may occur.</p>
                  </div>
                </div>
              )}
            </div>
            <AIOptimizer />
          </div>
        </section>

        {/* System Health Hub */}
        <section id="system" className="py-24 bg-white/50 border-t border-muted">
          <div className="max-w-7xl mx-auto px-6">
            <div className="p-12 bg-background rounded-[2.5rem] border border-muted shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32" />
              
              <div className="relative z-10 grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h3 className="text-3xl font-headline font-bold text-primary flex items-center gap-3">
                    <Activity className="w-8 h-8 text-accent" />
                    System Status
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-2xl border border-muted shadow-sm">
                      <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Hub Connection</div>
                      <div className="font-bold text-primary flex items-center gap-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-accent' : 'bg-muted-foreground'}`} />
                        {isLive ? 'Live Stream Active' : 'Offline'}
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-muted shadow-sm">
                      <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Auth Status</div>
                      <div className="font-bold text-primary flex items-center gap-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${user ? 'bg-primary' : 'bg-muted-foreground'}`} />
                        {user ? 'Authenticated' : 'Not Connected'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-6">
                  <div className="bg-primary p-8 rounded-[2rem] text-primary-foreground shadow-xl">
                    <h4 className="text-lg font-bold flex items-center gap-2 mb-4">
                      <Cloud className="w-5 l-5" />
                      Firestore Console Sync
                    </h4>
                    <p className="text-sm text-primary-foreground/70 mb-6">
                      Verify your connection by pushing a sample system configuration to your Firestore database.
                    </p>
                    <Button 
                      onClick={handlePushSample} 
                      disabled={syncing || !user}
                      className="w-full bg-accent hover:bg-accent/90 text-primary font-bold"
                    >
                      {syncing ? "Syncing..." : synced ? "Record Pushed!" : "Push Sample Record"}
                      {synced ? <CheckCircle2 className="w-4 h-4 ml-2" /> : <Send className="w-4 h-4 ml-2" />}
                    </Button>
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
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AquaSense Hydroponics Monitoring.
          </p>
        </div>
      </footer>
    </div>
  );
}

