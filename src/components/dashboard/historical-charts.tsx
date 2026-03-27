
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts";

const data = [
  { time: "00:00", ph: 6.2, temp: 22.1, humidity: 65, ec: 1.8 },
  { time: "04:00", ph: 6.1, temp: 21.8, humidity: 68, ec: 1.8 },
  { time: "08:00", ph: 6.3, temp: 22.5, humidity: 62, ec: 1.9 },
  { time: "12:00", ph: 6.4, temp: 24.2, humidity: 55, ec: 2.0 },
  { time: "16:00", ph: 6.2, temp: 24.5, humidity: 52, ec: 2.0 },
  { time: "20:00", ph: 6.1, temp: 23.0, humidity: 60, ec: 1.9 },
  { time: "23:59", ph: 6.2, temp: 22.4, humidity: 64, ec: 1.8 },
];

const chartConfig = {
  ph: {
    label: "pH Level",
    color: "hsl(var(--primary))",
  },
  temp: {
    label: "Temperature (°C)",
    color: "hsl(var(--accent))",
  },
  humidity: {
    label: "Humidity (%)",
    color: "hsl(var(--chart-1))",
  },
  ec: {
    label: "EC/TDS (mS/cm)",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function HistoricalCharts() {
  const [activeMetric, setActiveMetric] = useState<keyof typeof chartConfig>("ph");

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <CardTitle className="text-primary">Historical Trends</CardTitle>
          <CardDescription>Sensor data over the last 24 hours</CardDescription>
        </div>
        <Tabs value={activeMetric} onValueChange={(val) => setActiveMetric(val as any)}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="ph">pH</TabsTrigger>
            <TabsTrigger value="temp">Temp</TabsTrigger>
            <TabsTrigger value="humidity">Humidity</TabsTrigger>
            <TabsTrigger value="ec">EC</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                hide 
                domain={['auto', 'auto']}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey={activeMetric}
                stroke={chartConfig[activeMetric].color}
                strokeWidth={3}
                dot={{ r: 4, fill: chartConfig[activeMetric].color }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
