
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Waves, 
  FlaskConical, 
  Thermometer, 
  Droplets, 
  Zap,
  Clock,
  Database,
  Cpu,
  Power,
  RotateCcw,
  Activity
} from "lucide-react";
import { useUser, useAuth, useDatabase } from "@/firebase";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { ref, onValue, set } from "firebase/database";

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
  const [isPumpOn, setIsPumpOn] = useState(false);
  
  // Initialize with null to ensure hydration matches server (server renders null/loading state)
  const [sensors, setSensors] = useState<SensorData | null>(null);

  useEffect(() => {
    if (!rtdb) return;

    // Listen to real-time sensor data at history/latest
    const latestRef = ref(rtdb, 'history/latest');
    const unsubscribeSensors = onValue(latestRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setIsLive(true);
        // Map the specific keys provided: humidity, ph, tds, temperature
        setSensors({
          ph: data.ph !== undefined ? Number(data.ph) : 0,
          temperature: data.temperature !== undefined ? Number(data.temperature) : 0,
          humidity: data.humidity !== undefined ? Number(data.humidity) : 0,
          tds: data.tds !== undefined ? Number(data.tds) : 0,
        });
        setLastUpdated(new Date().toLocaleTimeString());
      }
    });

    // Listen to pump status settings
    const pumpRef = ref(rtdb, 'settings/pumpStatus');
    const unsubscribePump = onValue(pumpRef, (snapshot) => {
      const status = snapshot.val();
      setIsPumpOn(status === 'on');
    });

    return () => {
      unsubscribeSensors();
      unsubscribePump();
    };
  }, [rtdb]);

  const handleConnect = () => {
    initiateAnonymousSignIn(auth);
  };

  const handleTogglePump = () => {
    if (!rtdb) return;
    const pumpRef = ref(rtdb, 'settings/pumpStatus');
    const nextStatus = isPumpOn ? 'off' : 'on';
    set(pumpRef, nextStatus);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-body">
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
            <a href="#hub" className="text-sm font-medium hover:text-primary transition-colors">Sensor Hub</a>
            <a href="#simulation" className="text-sm font-medium hover:text-primary transition-colors">Simulation</a>
          </nav>

          <div className="flex items-center gap-4">
            {!user ? (
              <Button onClick={handleConnect} disabled={isUserLoading} variant="outline" size="sm" className="gap-2 rounded-xl">
                <Database className="w-4 h-4" />
                Connect Cloud
              </Button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Cloud Sync Active</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full max-w-7xl mx-auto px-6 py-16 flex flex-col items-center text-center">
          <div className="space-y-6 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-full text-accent text-[10px] font-bold uppercase tracking-widest border border-accent/20">
              <Zap className="w-3 h-3" />
              Live Sensor Protocol
            </div>
            <h2 className="text-5xl lg:text-6xl font-headline font-extrabold text-primary leading-tight">
              Real-Time <br />
              <span className="text-accent underline decoration-primary/10">Hydroponic Monitoring</span>
            </h2>
          </div>
        </section>

        {/* Real-Time Hub */}
        <section id="hub" className="py-12 bg-background">
          <div className="max-w-7xl mx-auto px-6">
            <div className="p-10 bg-white rounded-[3rem] border border-muted shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-[100px] -mr-40 -mt-40" />
              
              <div className="relative z-10 space-y-10">
                <div className="flex items-center justify-between border-b border-muted pb-8">
                  <div>
                    <h3 className="text-3xl font-headline font-bold text-primary flex items-center gap-3">
                      <Cpu className="w-8 h-8 text-accent" />
                      Live Controller Hub
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-accent animate-pulse' : 'bg-muted-foreground'}`} />
                      <span className="text-muted-foreground text-sm">
                        {isLive ? `Receiving telemetry (Last: ${lastUpdated})` : 'Awaiting sensor hub broadcast...'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* pH Balance Card */}
                  <div className="p-8 bg-background rounded-3xl border border-muted shadow-sm hover:shadow-xl transition-all group">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" /> pH Balance
                    </div>
                    <div className="font-bold text-primary text-5xl tracking-tighter">
                      {sensors ? sensors.ph : '---'}
                    </div>
                    <div className="mt-3 text-[10px] text-muted-foreground uppercase font-bold tracking-tight bg-muted/50 px-2 py-1 rounded inline-block">Target: 5.5 — 6.5</div>
                  </div>

                  {/* Temperature Card */}
                  <div className="p-8 bg-background rounded-3xl border border-muted shadow-sm hover:shadow-xl transition-all group">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" /> Temperature
                    </div>
                    <div className="font-bold text-primary text-5xl tracking-tighter">
                      {sensors ? `${sensors.temperature}°C` : '---'}
                    </div>
                    <div className="mt-3 text-[10px] text-muted-foreground uppercase font-bold tracking-tight bg-muted/50 px-2 py-1 rounded inline-block">Target: 18 — 24°C</div>
                  </div>

                  {/* Humidity Card */}
                  <div className="p-8 bg-background rounded-3xl border border-muted shadow-sm hover:shadow-xl transition-all group">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" /> Humidity
                    </div>
                    <div className="font-bold text-primary text-5xl tracking-tighter">
                      {sensors ? `${sensors.humidity}%` : '---'}
                    </div>
                    <div className="mt-3 text-[10px] text-muted-foreground uppercase font-bold tracking-tight bg-muted/50 px-2 py-1 rounded inline-block">Target: 50 — 70%</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                  <div className="p-6 bg-muted/20 rounded-3xl border border-muted shadow-sm">
                    <h3 className="font-headline font-bold text-primary mb-4 flex items-center gap-2 text-sm">
                      <Activity className="w-5 h-5 text-accent" />
                      Health Metrics
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">TDS/Nutrients</span>
                        <span className="font-bold text-primary">{sensors ? `${sensors.tds} ppm` : '---'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Gateway Protocol</span>
                        <span className="font-bold text-accent uppercase tracking-tighter">Websocket Active</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Simulation Hub */}
                  <div id="simulation" className="p-6 bg-primary/5 rounded-3xl border border-primary/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-headline font-bold text-primary flex items-center gap-2 text-sm">
                        <RotateCcw className="w-5 h-5 text-accent" />
                        Pump Controller
                      </h3>
                      <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${isPumpOn ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-muted border-muted-foreground/20 text-muted-foreground'}`}>
                        {isPumpOn ? 'Active' : 'Idle'}
                      </div>
                    </div>
                    <Button 
                      onClick={handleTogglePump}
                      className={`w-full h-12 rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95 ${isPumpOn ? 'bg-destructive hover:bg-destructive/90 text-white' : 'bg-accent hover:bg-accent/90 text-primary'}`}
                    >
                      <Power className="w-3 h-3 mr-2" />
                      {isPumpOn ? 'Turn Pump OFF' : 'Turn Pump ON'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-12 bg-white border-t border-muted/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Waves className="w-5 h-5 text-primary" />
            </div>
            <span className="font-headline font-bold text-primary tracking-tight text-xl">AquaSense</span>
          </div>
          <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest text-center md:text-right">
            © {new Date().getFullYear()} AquaSense Monitoring Framework. <br />
            <span className="text-[9px] opacity-60">High Performance Data Stream Interface</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
