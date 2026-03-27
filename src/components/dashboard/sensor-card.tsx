
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertCircle, ArrowDown, ArrowUp } from "lucide-react";

interface SensorCardProps {
  label: string;
  value: number | string;
  unit: string;
  icon: React.ReactNode;
  min: number;
  max: number;
  trend?: "up" | "down" | "stable";
}

export function SensorCard({
  label,
  value,
  unit,
  icon,
  min,
  max,
  trend,
}: SensorCardProps) {
  const numericValue = typeof value === "number" ? value : parseFloat(value as string);
  const isOutOfRange = numericValue < min || numericValue > max;

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-md",
      isOutOfRange && "border-destructive/50 ring-1 ring-destructive/20"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <div className={cn(
          "p-2 rounded-full",
          isOutOfRange ? "bg-destructive/10 text-destructive" : "bg-secondary text-primary"
        )}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight text-primary">
            {value}
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            {unit}
          </span>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Target: <span className="font-semibold">{min} - {max}</span>
          </div>
          {trend && (
            <div className={cn(
              "flex items-center text-xs font-medium",
              trend === "up" ? "text-primary" : trend === "down" ? "text-accent" : "text-muted-foreground"
            )}>
              {trend === "up" && <ArrowUp className="w-3 h-3 mr-1" />}
              {trend === "down" && <ArrowDown className="w-3 h-3 mr-1" />}
              {trend === "stable" && <span className="mr-1">-</span>}
              {trend.toUpperCase()}
            </div>
          )}
        </div>

        {isOutOfRange && (
          <div className="absolute top-0 right-0 p-2">
            <AlertCircle className="w-4 h-4 text-destructive animate-pulse" />
          </div>
        )}
      </CardContent>
      {isOutOfRange && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-destructive" />
      )}
    </Card>
  );
}
