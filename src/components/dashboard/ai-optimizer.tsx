
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, RefreshCw, CheckCircle2 } from "lucide-react";
import { aiGrowthOptimizationRecommendation, AIGrowthOptimizationRecommendationOutput } from "@/ai/flows/ai-growth-optimization-recommendation-flow";

export function AIOptimizer() {
  const [cropType, setCropType] = useState("Lettuce");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIGrowthOptimizationRecommendationOutput | null>(null);

  const handleOptimize = async () => {
    setLoading(true);
    try {
      // Simulate calling the flow with current dashboard data
      const response = await aiGrowthOptimizationRecommendation({
        cropType,
        currentReadings: {
          pH: 6.2,
          waterTemperature: 22.4,
          airTemperature: 24.5,
          humidity: 64,
          ecTds: 1.8,
        },
        historicalDataSummary: "System has been stable for 48 hours. pH tended to drift slightly higher in the afternoon.",
      });
      setResult(response);
    } catch (error) {
      console.error("Optimization failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-primary text-primary-foreground border-none shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <span className="text-xs font-bold uppercase tracking-wider text-accent">AI Powered</span>
        </div>
        <CardTitle className="text-white text-2xl">Growth Optimizer</CardTitle>
        <CardDescription className="text-primary-foreground/70">
          Get tailored adjustments for your current setup.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-primary-foreground/80">Active Crop</label>
          <Select value={cropType} onValueChange={setCropType}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white focus:ring-accent">
              <SelectValue placeholder="Select Crop" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Lettuce">Leafy Lettuce</SelectItem>
              <SelectItem value="Tomatoes">Cherry Tomatoes</SelectItem>
              <SelectItem value="Basil">Sweet Basil</SelectItem>
              <SelectItem value="Strawberries">Strawberries</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleOptimize} 
          disabled={loading}
          className="w-full bg-accent hover:bg-accent/90 text-primary font-bold transition-all transform hover:scale-[1.02]"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          Generate Insights
        </Button>

        {result && (
          <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="p-4 bg-white/10 rounded-xl space-y-2 border border-white/10">
              <h4 className="font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                Recommendations
              </h4>
              <ul className="space-y-3">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-primary-foreground/90 leading-relaxed list-disc list-inside">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-sm text-primary-foreground/80 italic border-l-2 border-accent pl-4 py-2">
              "{result.summary}"
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
