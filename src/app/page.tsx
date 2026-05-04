'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
  Flame,
  CloudRain,
  Beaker,
  Leaf,
  Clock,
  Timer,
  Settings2,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useUser, useAuth, useDatabase } from "@/firebase";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { ref, onValue, set } from "firebase/database";

interface SensorData {
  ph: number;
  temperature: number;
  humidity: number;
  tds: number;
  waterLevel: string;
}

interface PumpStates {
  pump1: boolean;
  pump2: boolean;
  pump3: boolean;
}

interface PumpEnabledStates {
  p1: boolean;
  p2: boolean;
  p3: boolean;
}

interface CamAnalysisData {
  healthyCount: number;
  notHealthyCount: number;
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

  const [pumpEnabled, setPumpEnabled] = useState<PumpEnabledStates>({
    p1: false,
    p2: false,
    p3: false
  });
  
  const [heater, setHeater] = useState(false);
  const [sprinkler, setSprinkler] = useState(false);
  const [solution1, setSolution1] = useState(false);
  const [solution2, setSolution2] = useState(false);
  const [phUp, setPhUp] = useState(false);
  const [phDown, setPhDown] = useState(false);
  
  const [sensors, setSensors] = useState<SensorData | null>(null);
  const [camAnalysis, setCamAnalysis] = useState<CamAnalysisData | null>(null);

  // Pump Cycle Settings
  const [cycleOnMinutes, setCycleOnMinutes] = useState(2);
  const [cycleOffMinutes, setCycleOffMinutes] = useState(1);
  const [cyclePhase, setCyclePhase] = useState<'on' | 'off'>('on');
  const [cycleSecondsRemaining, setCycleSecondsRemaining] = useState(0);

  // Timer states for manual overrides
  const [heaterTimeLeft, setHeaterTimeLeft] = useState<number | null>(null);
  const [sprinklerTimeLeft, setSprinklerTimeLeft] = useState<number | null>(null);
  const [solution1TimeLeft, setSolution1TimeLeft] = useState<number | null>(null);
  const [solution2TimeLeft, setSolution2TimeLeft] = useState<number | null>(null);
  const [phUpTimeLeft, setPhUpTimeLeft] = useState<number | null>(null);
  const [phDownTimeLeft, setPhDownTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    setCamTimestamp(Date.now());
    setCurrentYear(new Date().getFullYear());
    setQuoteIndex(Math.floor(Math.random() * LETTUCE_QUOTES.length));
  }, []);

  // Auto-refresh camera feeds every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCamTimestamp(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

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
          waterLevel: data.waterLevel || '---',
        });
        setLastUpdated(new Date().toLocaleTimeString());
      }
    });

    const camAnalysisRef = ref(rtdb, 'cam6_latest');
    const unsubscribeCamAnalysis = onValue(camAnalysisRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCamAnalysis({
          healthyCount: data.healthyCount ?? 0,
          notHealthyCount: data.notHealthyCount ?? 0,
        });
      }
    });

    // Listen to hardware statuses (what's actually running)
    const p1StatusRef = ref(rtdb, 'settings/pump1Status');
    const unsubP1Status = onValue(p1StatusRef, (snapshot) => setPumps(prev => ({ ...prev, pump1: snapshot.val() === 'on' })));
    const p2StatusRef = ref(rtdb, 'settings/pump2Status');
    const unsubP2Status = onValue(p2StatusRef, (snapshot) => setPumps(prev => ({ ...prev, pump2: snapshot.val() === 'on' })));
    const p3StatusRef = ref(rtdb, 'settings/pump3Status');
    const unsubP3Status = onValue(p3StatusRef, (snapshot) => setPumps(prev => ({ ...prev, pump3: snapshot.val() === 'on' })));

    // Listen to cycle enabled toggles
    const p1EnRef = ref(rtdb, 'settings/pump1Enabled');
    const unsubP1En = onValue(p1EnRef, (snapshot) => setPumpEnabled(prev => ({ ...prev, p1: snapshot.val() === true })));
    const p2EnRef = ref(rtdb, 'settings/pump2Enabled');
    const unsubP2En = onValue(p2EnRef, (snapshot) => setPumpEnabled(prev => ({ ...prev, p2: snapshot.val() === true })));
    const p3EnRef = ref(rtdb, 'settings/pump3Enabled');
    const unsubP3En = onValue(p3EnRef, (snapshot) => setPumpEnabled(prev => ({ ...prev, p3: snapshot.val() === true })));

    // Listen to cycle settings
    const cycleRef = ref(rtdb, 'settings/pumpCycle');
    const unsubscribeCycle = onValue(cycleRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCycleOnMinutes(data.onMinutes || 2);
        setCycleOffMinutes(data.offMinutes || 1);
      }
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

    const sign1Ref = ref(rtdb, 'settings/solution1Status');
    const unsubscribeSol1 = onValue(sign1Ref, (snapshot) => {
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

    const phUpRef = ref(rtdb, 'settings/phUpStatus');
    const unsubscribePhUp = onValue(phUpRef, (snapshot) => {
      const isOn = snapshot.val() === 'on';
      setPhUp(isOn);
      if (!isOn) setPhUpTimeLeft(null);
    });

    const phDownRef = ref(rtdb, 'settings/phDownStatus');
    const unsubscribePhDown = onValue(phDownRef, (snapshot) => {
      const isOn = snapshot.val() === 'on';
      setPhDown(isOn);
      if (!isOn) setPhDownTimeLeft(null);
    });

    return () => {
      unsubscribeSensors();
      unsubscribeCamAnalysis();
      unsubP1Status();
      unsubP2Status();
      unsubP3Status();
      unsubP1En();
      unsubP2En();
      unsubP3En();
      unsubscribeCycle();
      unsubscribeHeater();
      unsubscribeSprinkler();
      unsubscribeSol1();
      unsubscribeSol2();
      unsubscribePhUp();
      unsubscribePhDown();
    };
  }, [rtdb]);

  const anyEnabled = pumpEnabled.p1 || pumpEnabled.p2 || pumpEnabled.p3;

  // Pump Cycle Execution
  useEffect(() => {
    if (!rtdb) return;

    if (!anyEnabled) {
      setCyclePhase('on');
      setCycleSecondsRemaining(cycleOnMinutes * 60);
      return;
    }

    if (cycleSecondsRemaining <= 0) {
      const nextPhase = cyclePhase === 'on' ? 'off' : 'on';
      setCyclePhase(nextPhase);
      const nextDuration = nextPhase === 'on' ? cycleOnMinutes : cycleOffMinutes;
      setCycleSecondsRemaining(nextDuration * 60);
    }

    const timer = setInterval(() => {
      setCycleSecondsRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [anyEnabled, cycleSecondsRemaining, cyclePhase, cycleOnMinutes, cycleOffMinutes, rtdb]);

  // Sync Hardware Status based on Cycle Phase and individual Enable flags
  useEffect(() => {
    if (!rtdb) return;

    const syncPump = (num: 1|2|3, isEnabled: boolean) => {
      const targetStatus = (isEnabled && cyclePhase === 'on') ? 'on' : 'off';
      set(ref(rtdb, `settings/pump${num}Status`), targetStatus);
    };

    syncPump(1, pumpEnabled.p1);
    syncPump(2, pumpEnabled.p2);
    syncPump(3, pumpEnabled.p3);
  }, [pumpEnabled, cyclePhase, rtdb]);

  // Manual timer countdowns
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

  useEffect(() => {
    if (solution1TimeLeft === null) return;
    if (solution1TimeLeft <= 0) {
      if (rtdb) set(ref(rtdb, 'settings/solution1Status'), 'off');
      setSolution1TimeLeft(null);
      return;
    }
    const timer = setTimeout(() => setSolution1TimeLeft(solution1TimeLeft - 1), 1000);
    return () => clearInterval(timer);
  }, [solution1TimeLeft, rtdb]);

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

  useEffect(() => {
    if (phUpTimeLeft === null) return;
    if (phUpTimeLeft <= 0) {
      if (rtdb) set(ref(rtdb, 'settings/phUpStatus'), 'off');
      setPhUpTimeLeft(null);
      return;
    }
    const timer = setTimeout(() => setPhUpTimeLeft(phUpTimeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [phUpTimeLeft, rtdb]);

  useEffect(() => {
    if (phDownTimeLeft === null) return;
    if (phDownTimeLeft <= 0) {
      if (rtdb) set(ref(rtdb, 'settings/phDownStatus'), 'off');
      setPhDownTimeLeft(null);
      return;
    }
    const timer = setTimeout(() => setPhDownTimeLeft(phDownTimeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [phDownTimeLeft, rtdb]);

  const handleConnect = () => {
    if (auth) initiateAnonymousSignIn(auth);
  };

  const togglePump = (pumpId: 1 | 2 | 3) => {
    if (!rtdb) return;
    const key = `p${pumpId}` as keyof PumpEnabledStates;
    const nextStatus = !pumpEnabled[key];
    set(ref(rtdb, `settings/pump${pumpId}Enabled`), nextStatus);
  };

  const updateCycleTimes = (on: number, off: number) => {
    if (!rtdb) return;
    setCycleOnMinutes(on);
    setCycleOffMinutes(off);
    set(ref(rtdb, 'settings/pumpCycle'), { onMinutes: on, offMinutes: off });
  };

  const toggleHeater = () => {
    if (!rtdb) return;
    const nextStatus = heater ? 'off' : 'on';
    set(ref(rtdb, 'settings/heaterStatus'), nextStatus);
    if (nextStatus === 'on') setHeaterTimeLeft(30);
    else setHeaterTimeLeft(null);
  };

  const toggleSprinkler = () => {
    if (!rtdb) return;
    const nextStatus = sprinkler ? 'off' : 'on';
    set(ref(rtdb, 'settings/sprinklerStatus'), nextStatus);
    if (nextStatus === 'on') setSprinklerTimeLeft(30);
    else setSprinklerTimeLeft(null);
  };

  const toggleSolution1 = () => {
    if (!rtdb) return;
    const nextStatus = solution1 ? 'off' : 'on';
    set(ref(rtdb, 'settings/solution1Status'), nextStatus);
    if (nextStatus === 'on') setSolution1TimeLeft(10);
    else setSolution1TimeLeft(null);
  };

  const toggleSolution2 = () => {
    if (!rtdb) return;
    const nextStatus = solution2 ? 'off' : 'on';
    set(ref(rtdb, 'settings/solution2Status'), nextStatus);
    if (nextStatus === 'on') setSolution2TimeLeft(10);
    else setSolution2TimeLeft(null);
  };

  const togglePhUp = () => {
    if (!rtdb) return;
    const nextStatus = phUp ? 'off' : 'on';
    set(ref(rtdb, 'settings/phUpStatus'), nextStatus);
    if (nextStatus === 'on') setPhUpTimeLeft(10);
    else setPhUpTimeLeft(null);
  };

  const togglePhDown = () => {
    if (!rtdb) return;
    const nextStatus = phDown ? 'off' : 'on';
    set(ref(rtdb, 'settings/phDownStatus'), nextStatus);
    if (nextStatus === 'on') setPhDownTimeLeft(10);
    else setPhDownTimeLeft(null);
  };

  const toggleAllPumps = (target: boolean) => {
    if (!rtdb) return;
    set(ref(rtdb, 'settings/pump1Enabled'), target);
    set(ref(rtdb, 'settings/pump2Enabled'), target);
    set(ref(rtdb, 'settings/pump3Enabled'), target);
  };

  const handleTriggerCapture = () => {
    if (!rtdb) return;
    set(ref(rtdb, 'settings/triggerCapture'), Date.now());
    set(ref(rtdb, 'settings/cameraStatus'), 'capture');
    
    setTimeout(() => {
      set(ref(rtdb, 'settings/cameraStatus'), 'idle');
    }, 10000);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const allEnabled = pumpEnabled.p1 && pumpEnabled.p2 && pumpEnabled.p3;

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
        <section className="relative w-full max-w-7xl mx-auto px-6 py-16 flex flex-col items-center text-center">
          <div className="space-y-6 max-w-3xl flex flex-col items-center w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-full text-accent text-[10px] font-bold uppercase tracking-widest border border-accent/20">
              <Zap className="w-3 h-3" />
              Live Sensor Protocol
            </div>
            <h2 className="text-5xl lg:text-6xl font-headline font-extrabold text-primary leading-tight">
              Real-Time Monitoring
            </h2>
          </div>
        </section>

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

                <div id="hub" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
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

                  <div className="p-8 bg-background rounded-3xl border border-muted shadow-sm hover:shadow-xl transition-all group">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Waves className="w-4 h-4 text-primary animate-pulse group-hover:scale-110 transition-transform" /> Water Level
                    </div>
                    <div className="font-bold text-primary text-5xl tracking-tighter uppercase">
                      {sensors ? sensors.waterLevel : '---'}
                    </div>
                    <div className="mt-3 text-[10px] text-muted-foreground uppercase font-bold tracking-tight bg-muted/50 px-2 py-1 rounded inline-block">Status: Live</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                  <div className="p-8 bg-primary/5 rounded-3xl border border-primary/10 flex flex-col justify-center items-center text-center h-full">
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
                  </div>
                  
                  <div id="controls" className="p-6 bg-primary/5 rounded-3xl border border-primary/10 space-y-6">
                    <div className="flex items-center justify-between border-b border-primary/10 pb-4">
                      <h3 className="font-headline font-bold text-primary flex items-center gap-2 text-sm">
                        <Settings2 className="w-5 h-5 text-accent" />
                        System Controller Hub
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[1, 2, 3].map((num) => {
                        const id = num as 1 | 2 | 3;
                        const key = `p${id}` as keyof PumpEnabledStates;
                        const isEnabled = pumpEnabled[key];
                        const isActuallyRunning = pumps[`pump${id}` as keyof PumpStates];
                        return (
                          <div key={id} className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">Pump {id}</span>
                              <div className={`w-1.5 h-1.5 rounded-full ${isActuallyRunning ? 'bg-accent' : 'bg-muted-foreground/30'}`} />
                            </div>
                            <Button 
                              onClick={() => togglePump(id)}
                              className={`w-full h-10 rounded-xl text-[10px] font-bold shadow-sm transition-all active:scale-95 ${isEnabled ? 'bg-accent text-primary' : 'bg-muted text-muted-foreground'}`}
                            >
                              <Power className="w-3 h-3 mr-2" />
                              {isEnabled ? 'ON' : 'OFF'}
                            </Button>
                            <div className="text-[8px] text-center font-bold text-muted-foreground uppercase">
                              {isActuallyRunning ? 'Spraying...' : 'Resting'}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-white/40 p-5 rounded-2xl border border-primary/10 space-y-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <RotateCcw className="w-4 h-4 text-accent animate-spin-slow" />
                          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Cycle Timer</span>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-0.5 bg-accent/20 rounded-full">
                          <Clock className="w-3 h-3 text-accent" />
                          <span className="text-[9px] font-bold text-accent uppercase">
                            {anyEnabled ? `${cyclePhase}: ${formatTime(cycleSecondsRemaining)}` : 'Paused'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase">
                            <span>ON Time</span>
                            <span className="text-primary">{cycleOnMinutes} min</span>
                          </div>
                          <Slider value={[cycleOnMinutes]} max={30} min={1} step={1} onValueChange={(val) => updateCycleTimes(val[0], cycleOffMinutes)} />
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase">
                            <span>OFF Time</span>
                            <span className="text-primary">{cycleOffMinutes} min</span>
                          </div>
                          <Slider value={[cycleOffMinutes]} max={30} min={1} step={1} onValueChange={(val) => updateCycleTimes(cycleOnMinutes, val[0])} />
                        </div>
                      </div>
                      <p className="text-[9px] text-center text-muted-foreground uppercase font-bold tracking-tighter">Cycle only counts when at least one pump is ON</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-primary/10 pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Heater</span>
                          <div className={`w-1.5 h-1.5 rounded-full ${heater ? 'bg-orange-500' : 'bg-muted-foreground/30'}`} />
                        </div>
                        <Button onClick={toggleHeater} className={`w-full h-10 rounded-xl text-[10px] font-bold shadow-sm transition-all active:scale-95 ${heater ? 'bg-orange-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                          <Flame className="w-3 h-3 mr-2" />
                          {heater ? `ON (${heaterTimeLeft ?? 0}s)` : 'OFF'}
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Sprinkler</span>
                          <div className={`w-1.5 h-1.5 rounded-full ${sprinkler ? 'bg-blue-400' : 'bg-muted-foreground/30'}`} />
                        </div>
                        <Button onClick={toggleSprinkler} className={`w-full h-10 rounded-xl text-[10px] font-bold shadow-sm transition-all active:scale-95 ${sprinkler ? 'bg-blue-400 text-white' : 'bg-muted text-muted-foreground'}`}>
                          <CloudRain className="w-3 h-3 mr-2" />
                          {sprinkler ? `ON (${sprinklerTimeLeft ?? 0}s)` : 'OFF'}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">SOLUTION A</span>
                          <div className={`w-1.5 h-1.5 rounded-full ${solution1 ? 'bg-purple-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
                        </div>
                        <Button onClick={toggleSolution1} className={`w-full h-10 rounded-xl text-[10px] font-bold shadow-sm transition-all active:scale-95 ${solution1 ? 'bg-purple-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                          <Beaker className="w-3 h-3 mr-2" />
                          {solution1 ? `Dosing (${solution1TimeLeft ?? 0}s)` : 'Trigger Solution A'}
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Solution B</span>
                          <div className={`w-1.5 h-1.5 rounded-full ${solution2 ? 'bg-pink-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
                        </div>
                        <Button onClick={toggleSolution2} className={`w-full h-10 rounded-xl text-[10px] font-bold shadow-sm transition-all active:scale-95 ${solution2 ? 'bg-pink-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                          <Beaker className="w-3 h-3 mr-2" />
                          {solution2 ? `Dosing (${solution2TimeLeft ?? 0}s)` : 'Trigger Solution B'}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">PH solution +</span>
                          <div className={`w-1.5 h-1.5 rounded-full ${phUp ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
                        </div>
                        <Button onClick={togglePhUp} className={`w-full h-10 rounded-xl text-[10px] font-bold shadow-sm transition-all active:scale-95 ${phUp ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                          <Plus className="w-3 h-3 mr-2" />
                          {phUp ? `Dosing (${phUpTimeLeft ?? 0}s)` : 'Trigger PH +'}
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">PH solution -</span>
                          <div className={`w-1.5 h-1.5 rounded-full ${phDown ? 'bg-amber-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
                        </div>
                        <Button onClick={togglePhDown} className={`w-full h-10 rounded-xl text-[10px] font-bold shadow-sm transition-all active:scale-95 ${phDown ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                          <Minus className="w-3 h-3 mr-2" />
                          {phDown ? `Dosing (${phDownTimeLeft ?? 0}s)` : 'Trigger PH -'}
                        </Button>
                      </div>
                    </div>

                    <Button 
                      onClick={() => toggleAllPumps(!allEnabled)}
                      className={`w-full h-12 rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 ${allEnabled ? 'bg-destructive hover:bg-destructive/90 text-white' : 'bg-primary hover:bg-primary/90 text-white'}`}
                    >
                      {allEnabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      {allEnabled ? 'Master Kill Switch (OFF)' : 'Activate Full System (ON)'}
                    </Button>
                  </div>
                </div>

                <div className="space-y-6 pt-8 border-t border-muted">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-lg font-bold text-primary flex items-center gap-2">
                        <Camera className="w-5 h-5 text-accent" />
                        Capture Analytics
                      </h4>
                      <p className="text-xs text-muted-foreground">Real-time health assessment across all active cameras</p>
                    </div>

                    <div className="flex items-center gap-6 bg-white/50 backdrop-blur-sm px-6 py-3 rounded-2xl border border-muted shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Healthy
                        </span>
                        <span className="text-2xl font-black text-primary leading-none mt-1">{camAnalysis?.healthyCount ?? 0}</span>
                      </div>
                      <div className="w-px h-8 bg-muted" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> At Risk
                        </span>
                        <span className="text-2xl font-black text-primary leading-none mt-1">{camAnalysis?.notHealthyCount ?? 0}</span>
                      </div>
                      <Button onClick={handleTriggerCapture} variant="outline" size="sm" className="ml-4 text-xs gap-2 border-accent text-accent hover:bg-accent/10 rounded-xl">
                        <Camera className="w-3 h-3" />
                        Trigger
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
