import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { automationService } from '@/services/automation.service';
import type { AnalysisResult } from '@/services/gemini.service';
import { formatTime } from '@/lib/utils';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function LiveAnalysis() {
  const [lastAnalysis, setLastAnalysis] = useState<AnalysisResult | null>(null);
  const [nextAnalysisCountdown, setNextAnalysisCountdown] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const analysis = automationService.getLastAnalysis();
      setLastAnalysis(analysis);

      if (automationService.isRunning()) {
        const config = automationService.getConfig();
        const currentSecond = new Date().getSeconds();
        const targetSecond = config.targetSecond;

        let secondsUntil = targetSecond - currentSecond;
        if (secondsUntil < 0) {
          secondsUntil += 60;
        }

        setNextAnalysisCountdown(secondsUntil);
      } else {
        setNextAnalysisCountdown(0);
      }
    }, 1000);

    automationService.onAnalysis((result) => {
      setLastAnalysis(result);
    });

    return () => clearInterval(interval);
  }, []);

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'COMPRA':
        return <TrendingUp className="w-12 h-12 text-signal-buy" />;
      case 'VENDA':
        return <TrendingDown className="w-12 h-12 text-signal-sell" />;
      default:
        return <Minus className="w-12 h-12 text-signal-neutral" />;
    }
  };

  const getSignalGradientClass = (signal: string) => {
    switch (signal) {
      case 'COMPRA':
        return 'gradient-buy glow-buy';
      case 'VENDA':
        return 'gradient-sell glow-sell';
      default:
        return 'gradient-neutral';
    }
  };

  if (!lastAnalysis) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Activity className="w-6 h-6 text-primary" />
            Análise ao Vivo
          </CardTitle>
          <CardDescription>Aguardando primeira análise...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Activity className="w-16 h-16 mx-auto text-muted-foreground animate-pulse" />
            <p className="mt-4 text-muted-foreground">
              Inicie o robô para começar a análise
            </p>
            {nextAnalysisCountdown > 0 && (
              <p className="mt-2 text-2xl font-bold text-primary">
                Próxima análise em {nextAnalysisCountdown}s
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Activity className="w-6 h-6 text-primary" />
          Análise ao Vivo
        </CardTitle>
        <CardDescription>
          Última atualização: {formatTime(lastAnalysis.timestamp)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`relative rounded-2xl ${getSignalGradientClass(lastAnalysis.signal)} p-8 text-primary-foreground shadow-2xl`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {getSignalIcon(lastAnalysis.signal)}
              <div>
                <p className="text-sm opacity-80">SINAL DETECTADO</p>
                <p className="text-4xl font-bold">{lastAnalysis.signal}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">CONFIANÇA</p>
              <p className="text-5xl font-bold">{Math.round(lastAnalysis.confidence)}%</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm opacity-80">ATIVO</p>
            <p className="text-2xl font-bold">{lastAnalysis.asset}</p>
          </div>

          <div className="mb-4">
            <p className="text-sm opacity-80">PADRÃO IDENTIFICADO</p>
            <p className="text-lg font-semibold">{lastAnalysis.candlePattern}</p>
          </div>

          <div className="bg-background/20 rounded-lg p-4">
            <p className="text-sm opacity-80 mb-2">ANÁLISE TÉCNICA</p>
            <p className="text-base leading-relaxed">{lastAnalysis.reasoning}</p>
          </div>

          {nextAnalysisCountdown > 0 && (
            <div className="mt-6 text-center">
              <p className="text-sm opacity-80">PRÓXIMA ANÁLISE EM</p>
              <p className="text-3xl font-bold">{nextAnalysisCountdown}s</p>
            </div>
          )}
        </div>

        {lastAnalysis.confidence >= 80 && (
          <div className="mt-4 p-4 border-2 border-warning rounded-lg bg-warning/10">
            <p className="text-warning font-bold text-center">
              ⚠️ SINAL DE ALTA CONFIANÇA - Oportunidade forte detectada!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
