import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { automationService } from '@/services/automation.service';
import type { TradingAnalysis } from '@/services/tradingAnalysis.service';
import { formatTime } from '@/lib/utils';
import { ArrowUp, ArrowDown, Activity, Minus } from 'lucide-react';

export function VolumeForcePanel() {
  const [analysis, setAnalysis] = useState<TradingAnalysis | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const a = automationService.getLastAnalysis();
      if (a) setAnalysis(a);
    }, 1000);

    automationService.onAnalysis((result) => {
      setAnalysis(result);
    });

    return () => clearInterval(interval);
  }, []);

  if (!analysis) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Activity className="w-6 h-6 text-primary" />
            Volume & Força em Tempo Real
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Activity className="w-16 h-16 mx-auto text-muted-foreground animate-pulse" />
            <p className="mt-4 text-muted-foreground">
              Inicie a captura e o rastreamento para visualizar volume e força
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const buyWidth = analysis.forca_compradora;
  const sellWidth = analysis.forca_vendedora;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Activity className="w-6 h-6 text-primary" />
            Volume & Força
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {formatTime(analysis.timestamp)}
            </span>
            {analysis.ativo && (
              <span className="text-sm font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                {analysis.ativo}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Direction + Intensity */}
        <div className={`p-4 rounded-xl text-center ${
          analysis.direcao === 'COMPRA' ? 'gradient-buy glow-buy' :
          analysis.direcao === 'VENDA' ? 'gradient-sell glow-sell' :
          'gradient-neutral'
        }`}>
          <div className="flex items-center justify-center gap-3">
            {analysis.direcao === 'COMPRA' ? (
              <ArrowUp className="w-10 h-10 text-primary-foreground" />
            ) : analysis.direcao === 'VENDA' ? (
              <ArrowDown className="w-10 h-10 text-primary-foreground" />
            ) : (
              <Minus className="w-10 h-10 text-primary-foreground" />
            )}
            <div>
              <p className="text-3xl font-black text-primary-foreground">{analysis.direcao}</p>
              <p className="text-sm text-primary-foreground/80">{analysis.intensidade}</p>
            </div>
          </div>
          {analysis.preco && (
            <p className="mt-2 text-lg font-mono text-primary-foreground/90">{analysis.preco}</p>
          )}
        </div>

        {/* Force Bars */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-signal-buy font-semibold">Compradores</span>
            <span className="text-signal-buy font-bold">{analysis.forca_compradora}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
            <div
              className="h-full gradient-buy rounded-full transition-all duration-700"
              style={{ width: `${buyWidth}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-signal-sell font-semibold">Vendedores</span>
            <span className="text-signal-sell font-bold">{analysis.forca_vendedora}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
            <div
              className="h-full gradient-sell rounded-full transition-all duration-700"
              style={{ width: `${sellWidth}%` }}
            />
          </div>
        </div>

        {/* Arrows section */}
        {analysis.setas && analysis.setas.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Setas de Força</p>
            <div className="flex flex-wrap gap-2">
              {analysis.setas.map((seta, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold ${
                    seta.direcao === 'cima'
                      ? 'bg-signal-buy/20 text-signal-buy'
                      : 'bg-signal-sell/20 text-signal-sell'
                  }`}
                >
                  {seta.direcao === 'cima' ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                  <span>{seta.valor}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Volume Bars */}
        {analysis.volume_bars && analysis.volume_bars.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Barras de Volume</p>
            <div className="flex items-end gap-1 h-20">
              {analysis.volume_bars.map((bar, i) => {
                const height = bar.tamanho === 'grande' ? '100%' : bar.tamanho === 'medio' ? '60%' : '30%';
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-t transition-all duration-500 ${
                      bar.tipo === 'compra' ? 'bg-signal-buy' : 'bg-signal-sell'
                    }`}
                    style={{ height }}
                    title={`${bar.tipo}: ${bar.valor}`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Summary */}
        {analysis.resumo && (
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground">{analysis.resumo}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
