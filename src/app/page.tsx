
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
  RotateCcw
} from "lucide-react";
import { useUser, useAuth, useDatabase } from "@/firebase";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { ref, onValue, set } from "firebase/database";
import { HistoricalCharts } from "@/components/dashboard/historical-charts";
import { AIOptimizer } from "@/components/dashboard/ai-optimizer";

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
  
  const [sensors, setSensors] = useState<SensorData>({
    ph: 6.2,
    temperature: 22.4,
    humidity: 64,
    tds: 0,
  });

  useEffect(() => {
    if (!rtdb) return;

    // Listen to real-time sensor data
    const latestRef = ref(rtdb, 'history/latest');
    const unsubscribeSensors = onValue(latestRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setIsLive(true);
        setSensors({
          ph: data.ph !== undefined ? Number(data.ph) : 6.2,
          temperature: data.temperature !== undefined ? Number(data.temperature) : 22.4,
          humidity: data.humidity !== undefined ? Number(data.humidity) : 64,
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
            <a href="#monitor" className="text-sm font-medium hover:text-primary transition-colors">Monitoring</a>
            <a href="#insights" className="text-sm font-medium hover:text-primary transition-colors">AI Insights</a>
            <a href="#hub" className="text-sm font-medium hover:text-primary transition-colors">System Hub</a>
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
        <section className="relative w-full max-w-7xl mx-auto px-6 py-20 flex flex-col items-center text-center">
          <div className="space-y-6 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-full text-accent text-[10px] font-bold uppercase tracking-widest border border-accent/20">
              <Zap className="w-3 h-3" />
              Real-Time Hydroponic Intelligence
            </div>
            <h2 className="text-5xl lg:text-7xl font-headline font-extrabold text-primary leading-tight">
              Grow Smarter with <br />
              <span className="text-accent underline decoration-primary/10">Precision Data.</span>
            </h2>
            <div className="flex justify-center gap-4 pt-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-sm px-8 h-12 rounded-2xl shadow-xl shadow-primary/20" asChild>
                <a href="#monitor">View Live Trends</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Monitoring Section */}
        <section id="monitor" className="py-20 bg-muted/30 border-y border-muted/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-headline font-bold text-primary tracking-tight">System Monitoring</h2>
                <div className="flex items-center gap-3 mt-2">
                  <div className="text-muted-foreground text-sm">Real-time telemetry from your sensor hub</div>
                  {lastUpdated && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary/60 uppercase tracking-widest bg-primary/5 px-2 py-1 rounded-lg border border-primary/10">
                      <Clock className="w-3 h-3" />
                      Last sync: {lastUpdated}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-2xl border border-accent/20">
                <div className="relative flex h-2 w-2">
                  <div className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isLive ? 'bg-accent' : 'bg-muted-foreground'} opacity-75`}></div>
                  <div className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-accent' : 'bg-muted-foreground'}`}></div>
                </div>
                <span className="text-[10px] font-bold text-accent uppercase tracking-tighter">
                  {isLive ? 'Live Stream Connected' : 'Connecting...'}
                </span>
              </div>
            </div>

            <HistoricalCharts />
          </div>
        </section>

        {/* AI Insights Section */}
        <section id="insights" className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-[10px] font-bold uppercase tracking-widest">
                  <Zap className="w-3 h-3" />
                  Smart Optimization
                </div>
                <h2 className="text-4xl font-headline font-bold text-primary leading-tight">
                  Dynamic Growth Recommendations
                </h2>
                <div className="text-lg text-muted-foreground leading-relaxed">
                  Our AI engine analyzes your real-time sensor data against historical growth curves to provide instant, actionable insights.
                </div>
              </div>

              {sensors.ph < 5.0 && (
                <div className="p-5 bg-destructive/5 border border-destructive/20 rounded-3xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="bg-destructive/10 p-2 rounded-xl">
                    <FlaskConical className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <h4 className="font-bold text-destructive text-sm">Critical pH Level</h4>
                    <div className="text-xs text-destructive/80 mt-1">Current pH is {sensors.ph}. High acidity detected. Please check the reservoir immediately.</div>
                  </div>
                </div>
              )}

              {/* Pump Control Hub */}
              <div className="p-8 bg-muted/20 rounded-[2.5rem] border border-muted/50 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline font-bold text-primary flex items-center gap-2">
                    <RotateCcw className="w-5 h-5 text-accent" />
                    System Simulation
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${isPumpOn ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-muted border-muted-foreground/20 text-muted-foreground'}`}>
                    Pump: {isPumpOn ? 'Active' : 'Idle'}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Test your system triggers by manually overriding the water circulation pump. This state is synchronized across all connected clients.
                </p>
                <Button 
                  onClick={handleTogglePump}
                  className={`w-full h-14 rounded-2xl text-sm font-bold shadow-lg transition-all active:scale-95 ${isPumpOn ? 'bg-destructive hover:bg-destructive/90 text-white' : 'bg-accent hover:bg-accent/90 text-primary'}`}
                >
                  <Power className="w-4 h-4 mr-2" />
                  {isPumpOn ? 'Turn Pump OFF' : 'Turn Pump ON'}
                </Button>
              </div>
            </div>
            
            <AIOptimizer />
          </div>
        </section>

        {/* Real-Time Hub */}
        <section id="hub" className="py-24 bg-muted/10 border-t border-muted/50">
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
                    <div className="text-muted-foreground text-sm mt-1">Direct stream from local hardware hub</div>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-muted/30 rounded-2xl border border-muted/50">
                    <Database className="w-4 h-4 text-primary/40" />
                    <span className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">RTDB Protocol</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="p-8 bg-background rounded-3xl border border-muted shadow-sm hover:shadow-xl transition-all group">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" /> pH Balance
                    </div>
                    <div className="font-bold text-primary text-5xl tracking-tighter">{sensors.ph}</div>
                    <div className="mt-3 text-[10px] text-muted-foreground uppercase font-bold tracking-tight bg-muted/50 px-2 py-1 rounded inline-block">Target: 5.5 — 6.5</div>
                  </div>

                  <div className="p-8 bg-background rounded-3xl border border-muted shadow-sm hover:shadow-xl transition-all group">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" /> Thermal Status
                    </div>
                    <div className="font-bold text-primary text-5xl tracking-tighter">{sensors.temperature}°C</div>
                    <div className="mt-3 text-[10px] text-muted-foreground uppercase font-bold tracking-tight bg-muted/50 px-2 py-1 rounded inline-block">Target: 18 — 24°C</div>
                  </div>

                  <div className="p-8 bg-background rounded-3xl border border-muted shadow-sm hover:shadow-xl transition-all group">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" /> Humidity
                    </div>
                    <div className="font-bold text-primary text-5xl tracking-tighter">{sensors.humidity}%</div>
                    <div className="mt-3 text-[10px] text-muted-foreground uppercase font-bold tracking-tight bg-muted/50 px-2 py-1 rounded inline-block">Target: 50 — 70%</div>
                  </div>
                </div>

                <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="font-bold text-primary text-sm">Controller Gateway Status</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-accent animate-pulse' : 'bg-muted-foreground'}`} />
                      <div>{isLive ? 'Secured websocket connection to Sensor Hub' : 'Awaiting handshake protocol...'}</div>
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-muted-foreground bg-white px-4 py-2 rounded-xl border border-muted uppercase tracking-widest">
                    Node: history/latest
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
