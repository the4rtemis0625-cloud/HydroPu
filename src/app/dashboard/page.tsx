
"use client";

import { useState, useEffect } from "react";
import { SensorCard } from "@/components/dashboard/sensor-card";
import { HistoricalCharts } from "@/components/dashboard/historical-charts";
import { AIOptimizer } from "@/components/dashboard/ai-optimizer";
import { FlaskConical, Thermometer, Waves, Droplets, Activity } from "lucide-react";
import { useDatabase } from "@/firebase";
import { ref, onValue } from "firebase/database";

interface SensorData {
  ph?: number;
  waterTemp?: number;
  airTemp?: number;
  humidity?: number;
  tds?: number;
}

export default function DashboardOverview() {
  const database = useDatabase();
  const [sensors, setSensors] = useState<SensorData>({
    ph: 6.2,
    waterTemp: 22.4,
    airTemp: 24.5,
    humidity: 64,
    tds: 1.8,
  });

  useEffect(() => {
    if (!database) return;

    // Listen to the 'history/latest' path in Realtime Database
    const sensorsRef = ref(database, 'history/latest');
    const unsubscribe = onValue(sensorsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Map RTDB data robustly to handle ph/pH, temperature/temp, and tds/ec variants
        setSensors(prev => ({
          ...prev,
          ph: data.ph !== undefined ? Number(data.ph) : (data.pH !== undefined ? Number(data.pH) : prev.ph),
          waterTemp: data.temperature !== undefined ? Number(data.temperature) : (data.temp !== undefined ? Number(data.temp) : prev.waterTemp),
          airTemp: data.temperature !== undefined ? Number(data.temperature) : (data.temp !== undefined ? Number(data.temp) : prev.airTemp),
          humidity: data.humidity !== undefined ? Number(data.humidity) : prev.humidity,
          tds: data.tds !== undefined ? Number(data.tds) : (data.ec !== undefined ? Number(data.ec) : prev.tds),
        }));
      }
    });

    return () => unsubscribe();
  }, [database]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <SensorCard 
          label="pH Level"
          value={sensors.ph ?? 0}
          unit="pH"
          icon={<FlaskConical className="w-4 h-4" />}
          min={5.5}
          max={6.5}
          trend="stable"
        />
        <SensorCard 
          label="Water Temp"
          value={sensors.waterTemp ?? 0}
          unit="°C"
          icon={<Waves className="w-4 h-4" />}
          min={18}
          max={24}
          trend="up"
        />
        <SensorCard 
          label="Air Temp"
          value={sensors.airTemp ?? 0}
          unit="°C"
          icon={<Thermometer className="w-4 h-4" />}
          min={20}
          max={28}
          trend="down"
        />
        <SensorCard 
          label="Humidity"
          value={sensors.humidity ?? 0}
          unit="%"
          icon={<Droplets className="w-4 h-4" />}
          min={50}
          max={70}
          trend="stable"
        />
        <SensorCard 
          label="Nutrient TDS"
          value={sensors.tds ?? 0}
          unit="ppm"
          icon={<Activity className="w-4 h-4" />}
          min={1.2}
          max={2000}
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <HistoricalCharts />
        </div>
        <div className="lg:col-span-1">
          <AIOptimizer />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 bg-white rounded-2xl border border-muted/50 shadow-sm">
          <h3 className="font-headline font-bold text-primary mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" />
            System Health
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Pump Status</span>
              <span className="font-bold text-primary bg-primary/10 px-2 py-1 rounded-full uppercase text-[10px]">Operational</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Lighting Cycle</span>
              <span className="font-bold text-accent bg-accent/10 px-2 py-1 rounded-full uppercase text-[10px]">Active (16/8)</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Nutrient Level</span>
              <span className="font-bold text-primary bg-primary/10 px-2 py-1 rounded-full uppercase text-[10px]">75% Capacity</span>
            </div>
          </div>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-muted/50 shadow-sm">
          <h3 className="font-headline font-bold text-primary mb-4 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-accent" />
            Recent Alerts
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-2 hover:bg-muted/30 rounded-lg transition-colors cursor-pointer">
              <div className="w-2 h-2 rounded-full bg-destructive mt-1.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">pH Level Warning</p>
                <p className="text-xs text-muted-foreground">Abnormal pH readings detected in system.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-2 hover:bg-muted/30 rounded-lg transition-colors cursor-pointer">
              <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Scheduled Flush</p>
                <p className="text-xs text-muted-foreground">Next reservoir change scheduled in 2 days.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
