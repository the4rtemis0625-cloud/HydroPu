'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { 
  Waves, 
  FlaskConical, 
  Thermometer, 
  Droplets, 
  Zap,
  Database,
  Cpu,
  Power,
  RotateCcw,
  Activity,
  ToggleLeft,
  ToggleRight,
  Camera,
  RefreshCw,
  Flame,
  CloudRain,
  Beaker,
  Leaf
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

interface PumpStates {
  pump1: boolean;
  pump2: boolean;
  pump3: boolean;
}

const LETTUCE_QUOTES = [
  "Lettuce is like conversation: it must be fresh and crisp.",
  "Planting a garden is to believe in tomorrow.",
  "The glory of gardening: hands in the dirt, head in the sun, heart with nature.",
  "Grow your own, it's better for the soul.",
  "Fresh lettuce is the heart of a healthy home.",
  "Gardening is the purest of human pleasures.",
  "To plant a garden is to dream of a better world.",
  "The best time to plant a tree was 20 years ago. The second best time is now."
];

export default function OnePager() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const rtdb = useDatabase();
  
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [camTimestamp, setCamTimestamp] = useState<number | null>(null);
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [quoteIndex, setQuoteIndex] = useState(0);
  
  const [pumps, setPumps] = useState<PumpStates>({
    pump1: false,
    pump2: false,
    pump3: false
  });
  
  const [heater, setHeater] = useState(false);
  const [sprinkler, setSprinkler] = useState(false);
  const [solution1, setSolution1] = useState(false);
  const [solution2, setSolution2] = useState(false);
  const [sensors, setSensors] = useState<SensorData | null>(null);

  // Timer states
  const [heaterTimeLeft, setHeaterTimeLeft] = useState<number | null>(null);
  const [sprinklerTimeLeft, setSprinklerTimeLeft] = useState<number | null>(null);
  const [solution1TimeLeft, setSolution1TimeLeft] = useState<number | null>(null);
  const [solution2TimeLeft, setSolution2TimeLeft] = useState<number | null>(null);

  useEffect(() => {
    // Avoid hydration mismatch by setting dynamic values on mount
    setCamTimestamp(Date.now());
    setCurrentYear(new Date().getFullYear());
    setQuoteIndex(Math.floor(Math.random() * LETTUCE_QUOTES.length));
  }, []);

  // Quote Slideshow Interval
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % LETTUCE_QUOTES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!rtdb) return;

    const latestRef = ref(rtdb, 'latest');
    const unsubscribeSensors = onValue(latestRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setIsLive(true);
        setSensors({
          ph: data.ph !== undefined ? Number(data.ph) : 0,
          temperature: data.temperature !== undefined ? Number(data.temperature) : 0,
          humidity: data.humidity !== undefined ? Number(data.humidity) : 0,
          tds: data.tds !== undefined ? Number(data.tds) : 0,
        });
        setLastUpdated(new Date().toLocaleTimeString());
      }
    });

    const pump1Ref = ref(rtdb, 'settings/pump1Status');
    const unsubscribePump1 = onValue(pump1Ref, (snapshot) => {
      setPumps(prev => ({ ...prev, pump1: snapshot.val() === 'on' }));
    });

    const pump2Ref = ref(rtdb, 'settings/pump2Status');
    const unsubscribePump2 = onValue(pump2Ref, (snapshot) => {
      setPumps(prev => ({ ...prev, pump2: snapshot.val() === 'on' }));
    });

    const pump3Ref = ref(rtdb, 'settings/pump3Status');
    const unsubscribePump3 = onValue(pump3Ref, (snapshot) => {
      setPumps(prev => ({ ...prev, pump3: snapshot.val() === 'on' }));
    });

    const heaterRef = ref(rtdb, 'settings/heaterStatus');
    const unsubscribeHeater = onValue(heaterRef, (snapshot) => {
      const isOn = snapshot.val() === 'on';
      setHeater(isOn);
      if (!isOn) setHeaterTimeLeft(null);
    });

    const sprinklerRef = ref(rtdb, 'settings/sprinklerStatus');
    const unsubscribeSprinkler = onValue(sprinklerRef, (snapshot) => {
      const isOn = snapshot.val() === 'on';
      setSprinkler(isOn);
      if (!isOn) setSprinklerTimeLeft(null);
    });

    const sol1Ref = ref(rtdb, 'settings/solution1Status');
    const unsubscribeSol1 = onValue(sol1Ref, (snapshot) => {
      const isOn = snapshot.val() === 'on';
      setSolution1(isOn);
      if (!isOn) setSolution1TimeLeft(null);
    });

    const sol2Ref = ref(rtdb, 'settings/solution2Status');
    const unsubscribeSol2 = onValue(sol2Ref, (snapshot) => {
      const isOn = snapshot.val() === 'on';
      setSolution2(isOn);
      if (!isOn) setSolution2TimeLeft(null);
    });

    return () => {
      unsubscribeSensors();
      unsubscribePump1();
      unsubscribePump2();
      unsubscribePump3();
      unsubscribeHeater();
      unsubscribeSprinkler();
      unsubscribeSol1();
      unsubscribeSol2();
    };
  }, [rtdb]);

  // Heater Countdown Logic
  useEffect(() => {
    if (heaterTimeLeft === null) return;
    if (heaterTimeLeft <= 0) {
      if (rtdb) set(ref(rtdb, 'settings/heaterStatus'), 'off');
      setHeaterTimeLeft(null);
      return;
    }
    const timer = setTimeout(() => setHeaterTimeLeft(heaterTimeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [heaterTimeLeft, rtdb]);

  // Sprinkler Countdown Logic
  useEffect(() => {
    if (sprinklerTimeLeft === null) return;
    if (sprinklerTimeLeft <= 0) {
      if (rtdb) set(ref(rtdb, 'settings/sprinklerStatus'), 'off');
      setSprinklerTimeLeft(null);
      return;
    }
    const timer = setTimeout(() => setSprinklerTimeLeft(sprinklerTimeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [sprinklerTimeLeft, rtdb]);

  // Solution 1 Countdown Logic
  useEffect(() => {
    if (solution1TimeLeft === null) return;
    if (solution1TimeLeft <= 0) {
      if (rtdb) set(ref(rtdb, 'settings/solution1Status'), 'off');
      setSolution1TimeLeft(null);
      return;
    }
    const timer = setTimeout(() => setSolution1TimeLeft(solution1TimeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [solution1TimeLeft, rtdb]);

  // Solution 2 Countdown Logic
  useEffect(() => {
    if (solution2TimeLeft === null) return;
    if (solution2TimeLeft <= 0) {
      if (rtdb) set(ref(rtdb, 'settings/solution2Status'), 'off');
      setSolution2TimeLeft(null);
      return;
    }
    const timer = setTimeout(() => setSolution2TimeLeft(solution2TimeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [solution2TimeLeft, rtdb]);

  const handleConnect = () => {
    if (auth) {
      initiateAnonymousSignIn(auth);
    }
  };

  const togglePump = (pumpId: 1 | 2 | 3) => {
    if (!rtdb) return;
    const pumpRef = ref(rtdb, `settings/pump${pumpId}Status`);
    const pumpKey = `pump${pumpId}` as keyof PumpStates;
    const nextStatus = pumps[pumpKey] ? 'off' : 'on';
    set(pumpRef, nextStatus);
  };

  const toggleHeater = () => {
    if (!rtdb) return;
    const nextStatus = heater ? 'off' : 'on';
    set(ref(rtdb, 'settings/heaterStatus'), nextStatus);
    if (nextStatus === 'on') {
      setHeaterTimeLeft(30);
    } else {
      setHeaterTimeLeft(null);
    }
  };

  const toggleSprinkler = () => {
    if (!rtdb) return;
    const nextStatus = sprinkler ? 'off' : 'on';
    set(ref(rtdb, 'settings/sprinklerStatus'), nextStatus);
    if (nextStatus === 'on') {
      setSprinklerTimeLeft(30);
    } else {
      setSprinklerTimeLeft(null);
    }
  };

  const toggleSolution1 = () => {
    if (!rtdb) return;
    const nextStatus = solution1 ? 'off' : 'on';
    set(ref(rtdb, 'settings/solution1Status'), nextStatus);
    if (nextStatus === 'on') {
      setSolution1TimeLeft(10);
    } else {
      setSolution1TimeLeft(null);
    }
  };

  const toggleSolution2 = () => {
    if (!rtdb) return;
    const nextStatus = solution2 ? 'off' : 'on';
    set(ref(rtdb, 'settings/solution2Status'), nextStatus);
    if (nextStatus === 'on') {
      setSolution2TimeLeft(10);
    } else {
      setSolution2TimeLeft(null);
    }
  };

  const toggleAllPumps = (targetStatus: 'on' | 'off') => {
    if (!rtdb) return;
    set(ref(rtdb, 'settings/pump1Status'), targetStatus);
    set(ref(rtdb, 'settings/pump2Status'), targetStatus);
    set(ref(rtdb, 'settings/pump3Status'), targetStatus);
  };

  const refreshCamera = () => {
    setCamTimestamp(Date.now());
  };

  const handleTriggerCapture = () => {
    if (!rtdb) return;
    set(ref(rtdb, 'settings/triggerCapture'), Date.now());
  };

  const allPumpsOn = pumps.pump1 && pumps.pump2 && pumps.pump3;

  return (
    <div className="min-h-screen bg-background flex flex-col font-body">
      <header className="sticky top-0 z-50 w-full bg-background/80 border-b border-muted/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg text-white">
              <Waves className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-headline font-bold text-primary tracking-tight">HydroPu</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#vision" className="text-sm font-medium hover:text-primary transition-colors">Vision</a>
            <a href="#hub" className="text-sm font-medium hover:text-primary transition-colors">Sensor Hub</a>
            <a href="#controls" className="text-sm font-medium hover:text-primary transition-colors">System Controls</a>
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
          <div className="space-y-6 max-w-3xl flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-full text-accent text-[10px] font-bold uppercase tracking-widest border border-accent/20">
              <Zap className="w-3 h-3" />
              Live Sensor Protocol
            </div>
            <h2 className="text-5xl lg:text-6xl font-headline font-extrabold text-primary leading-tight">
              Real-Time Monitoring
            </h2>
            
            {/* Waving line animation */}
            <div className="relative w-64 h-8 overflow-hidden mt-4">
              <div className="absolute inset-0 flex items-center">
                <svg className="w-[200%] h-full text-accent opacity-40 animate-wave" viewBox="0 0 1200 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 20C150 20 150 10 300 10C450 10 450 30 600 30C750 30 750 10 900 10C1050 10 1050 20 1200 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  <path d="M0 20C150 20 150 10 300 10C450 10 450 30 600 30C750 30 750 10 900 10C1050 10 1050 20 1200 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" transform="translate(1200, 0)" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Vision Section moved to the bottom part of main content area */}
        <section id="vision" className="py-12 bg-background">
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
                      <div className="text-muted-foreground text-sm">
                        {isLive ? `Receiving telemetry (Last Update: ${lastUpdated})` : 'Awaiting sensor hub broadcast...'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sensor Metrics */}
                <div id="hub" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="p-8 bg-background rounded-3xl border border-muted shadow-sm hover:shadow-xl transition-all group">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-primary animate-pulse group-hover:scale-110 transition-transform" /> pH Level
                    </div>
                    <div className="font-bold text-primary text-5xl tracking-tighter">
                      {sensors ? sensors.ph.toFixed(2) : '---'}
                    </div>
                    <div className="mt-3 text-[10px] text-muted-foreground uppercase font-bold tracking-tight bg-muted/50 px-2 py-1 rounded inline-block">Target: 5.5 — 6.5</div>
                  </div>

                  <div className="p-8 bg-background rounded-3xl border border-muted shadow-sm hover:shadow-xl transition-all group">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-accent animate-pulse group-hover:scale-110 transition-transform" /> Temperature
                    </div>
                    <div className="font-bold text-primary text-5xl tracking-tighter">
                      {sensors ? `${sensors.temperature.toFixed(1)}°C` : '---'}
                    </div>
                    <div className="mt-3 text-[10px] text-muted-foreground uppercase font-bold tracking-tight bg-muted/50 px-2 py-1 rounded inline-block">Target: 18 — 24°C</div>
                  </div>

                  <div className="p-8 bg-background rounded-3xl border border-muted shadow-sm hover:shadow-xl transition-all group">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-accent animate-pulse group-hover:scale-110 transition-transform" /> Humidity
                    </div>
                    <div className="font-bold text-primary text-5xl tracking-tighter">
                      {sensors ? `${sensors.humidity.toFixed(1)}%` : '---'}
                    </div>
                    <div className="mt-3 text-[10px] text-muted-foreground uppercase font-bold tracking-tight bg-muted/50 px-2 py-1 rounded inline-block">Target: 50 — 70%</div>
                  </div>

                  <div className="p-8 bg-background rounded-3xl border border-muted shadow-sm hover:shadow-xl transition-all group">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary animate-pulse group-hover:scale-110 transition-transform" /> TDS Level
                    </div>
                    <div className="font-bold text-primary text-5xl tracking-tighter">
                      {sensors ? sensors.tds : '---'}
                    </div>
                    <div className="mt-3 text-[10px] text-muted-foreground uppercase font-bold tracking-tight bg-muted/50 px-2 py-1 rounded inline-block">Target: 0 — 2000 ppm</div>
                  </div>
                </div>

                {/* Grower's Wisdom & System Controller Hub */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                  <div className="p-8 bg-primary/5 rounded-3xl border border-primary/10 flex flex-col justify-center items-center text-center">
                    <div className="bg-primary/10 p-4 rounded-full mb-6 animate-pulse">
                      <Leaf className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="font-headline font-bold text-primary mb-4 text-lg uppercase tracking-widest">
                      Grower's Wisdom
                    </h3>
                    <div className="relative min-h-[100px] flex items-center justify-center overflow-hidden">
                      <p 
                        key={quoteIndex}
                        className="text-primary/80 font-medium italic text-lg leading-relaxed px-4 animate-in fade-in slide-in-from-right-8 duration-700"
                      >
                        "{LETTUCE_QUOTES[quoteIndex]}"
                      </p>
                    </div>
                    <div className="mt-6 flex items-center justify-center gap-2">
                      <div className="w-8 h-px bg-primary/20" />
                      <span className="text-[10px] font-bold text-primary/40 uppercase tracking-tighter">HydroPu Planting Guide</span>
                      <div className="w-8 h-px bg-primary/20" />
                    </div>
                  </div>
                  
                  <div id="controls" className="p-6 bg-primary/5 rounded-3xl border border-primary/10 space-y-6">
                    <div className="flex items-center justify-between border-b border-primary/10 pb-4">
                      <h3 className="font-headline font-bold text-primary flex items-center gap-2 text-sm">
                        <RotateCcw className="w-5 h-5 text-accent" />
                        System Controller Hub
                      </h3>
                    </div>

                    {/* Pump Controls Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[1, 2, 3].map((num) => {
                        const id = num as 1 | 2 | 3;
                        const isOn = pumps[`pump${id}` as keyof PumpStates];
                        return (
                          <div key={id} className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">Pump {id}</span>
                              <div className={`w-1.5 h-1.5 rounded-full ${isOn ? 'bg-accent' : 'bg-muted-foreground/30'}`} />
                            </div>
                            <Button 
                              onClick={() => togglePump(id)}
                              className={`w-full h-10 rounded-xl text-[10px] font-bold shadow-sm transition-all active:scale-95 ${isOn ? 'bg-accent text-primary' : 'bg-muted text-muted-foreground'}`}
                            >
                              <Power className="w-3 h-3 mr-2" />
                              {isOn ? 'ON' : 'OFF'}
                            </Button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Heater and Sprinkler Controls Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-primary/10 pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Heater</span>
                          <div className={`w-1.5 h-1.5 rounded-full ${heater ? 'bg-orange-500' : 'bg-muted-foreground/30'}`} />
                        </div>
                        <Button 
                          onClick={toggleHeater}
                          className={`w-full h-10 rounded-xl text-[10px] font-bold shadow-sm transition-all active:scale-95 ${heater ? 'bg-orange-500 text-white' : 'bg-muted text-muted-foreground'}`}
                        >
                          <Flame className="w-3 h-3 mr-2" />
                          {heater ? `ON (${heaterTimeLeft ?? 0}s)` : 'OFF'}
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Sprinkler</span>
                          <div className={`w-1.5 h-1.5 rounded-full ${sprinkler ? 'bg-blue-400' : 'bg-muted-foreground/30'}`} />
                        </div>
                        <Button 
                          onClick={toggleSprinkler}
                          className={`w-full h-10 rounded-xl text-[10px] font-bold shadow-sm transition-all active:scale-95 ${sprinkler ? 'bg-blue-400 text-white' : 'bg-muted text-muted-foreground'}`}
                        >
                          <CloudRain className="w-3 h-3 mr-2" />
                          {sprinkler ? `ON (${sprinklerTimeLeft ?? 0}s)` : 'OFF'}
                        </Button>
                      </div>
                    </div>

                    {/* Solutions Controls Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-primary/10 pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Solution 1</span>
                          <div className={`w-1.5 h-1.5 rounded-full ${solution1 ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
                        </div>
                        <Button 
                          onClick={toggleSolution1}
                          className={`w-full h-10 rounded-xl text-[10px] font-bold shadow-sm transition-all active:scale-95 ${solution1 ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}
                        >
                          <Beaker className="w-3 h-3 mr-2" />
                          {solution1 ? `ON (${solution1TimeLeft ?? 0}s)` : 'OFF'}
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Solution 2</span>
                          <div className={`w-1.5 h-1.5 rounded-full ${solution2 ? 'bg-purple-500' : 'bg-muted-foreground/30'}`} />
                        </div>
                        <Button 
                          onClick={toggleSolution2}
                          className={`w-full h-10 rounded-xl text-[10px] font-bold shadow-sm transition-all active:scale-95 ${solution2 ? 'bg-purple-500 text-white' : 'bg-muted text-muted-foreground'}`}
                        >
                          <Beaker className="w-3 h-3 mr-2" />
                          {solution2 ? `ON (${solution2TimeLeft ?? 0}s)` : 'OFF'}
                        </Button>
                      </div>
                    </div>

                    {/* Master Switch */}
                    <Button 
                      onClick={() => toggleAllPumps(allPumpsOn ? 'off' : 'on')}
                      className={`w-full h-12 rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 ${allPumpsOn ? 'bg-destructive hover:bg-destructive/90 text-white' : 'bg-primary hover:bg-primary/90 text-white'}`}
                    >
                      {allPumpsOn ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      {allPumpsOn ? 'Master Kill Switch (OFF)' : 'Activate Full System (ON)'}
                    </Button>
                  </div>
                </div>

                {/* Camera Feeds Grid - MOVED TO THE BOTTOM */}
                <div className="space-y-6 pt-8 border-t border-muted">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-primary flex items-center gap-2">
                      <Camera className="w-5 h-5 text-accent" />
                      Latest Capture
                    </h4>
                    <div className="flex items-center gap-2">
                      <Button onClick={handleTriggerCapture} variant="outline" size="sm" className="text-xs gap-2 border-accent text-accent hover:bg-accent/10">
                        <Camera className="w-3 h-3" />
                        Trigger Capture
                      </Button>
                      <Button onClick={refreshCamera} variant="ghost" size="sm" className="text-xs gap-2">
                        <RefreshCw className="w-3 h-3" />
                        Refresh View
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <div key={num} className="relative aspect-video w-full rounded-3xl overflow-hidden border border-muted shadow-lg bg-black group">
                        <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-[9px] font-bold text-white uppercase tracking-wider">CAM-0{num}</span>
                        </div>
                        {camTimestamp !== null ? (
                          <Image 
                            src={`https://gjfwrphhhgodjhtgwmum.supabase.co/storage/v1/object/public/Hydro/cam${num}.jpg?t=${camTimestamp}`}
                            alt={`Hydroponics Camera Feed ${num}`}
                            fill
                            className="object-cover transition-transform group-hover:scale-[1.05] duration-500"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-muted animate-pulse" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 bg-white border-t border-muted/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Waves className="w-5 h-5 text-primary" />
            </div>
            <span className="font-headline font-bold text-primary tracking-tight text-xl">HydroPu</span>
          </div>
          <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest text-center md:text-right">
            © {currentYear || '...'} HydroPu Monitoring Framework. <br />
            <span className="text-[9px] opacity-60">High Performance Data Stream Interface</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
