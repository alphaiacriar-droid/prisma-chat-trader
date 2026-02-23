import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { automationService } from '@/services/automation.service';
import type { AnalysisResult } from '@/services/gemini.service';
import { formatTime } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Trash2, BarChart3 } from 'lucide-react';

export function AnalysisHistory() {
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    buy: 0,
    sell: 0,
    neutral: 0,
    avgConfidence: 0,
    highConfidenceSignals: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setHistory(automationService.getHistory());
      setStats(automationService.getStats());
    }, 1000);

    automationService.onAnalysis(() => {
      setHistory(automationService.getHistory());
      setStats(automationService.getStats());
    });

    return () => clearInterval(interval);
  }, []);

  const handleClearHistory = () => {
    automationService.clearHistory();
    setHistory([]);
    setStats({
      total: 0,
      buy: 0,
      sell: 0,
      neutral: 0,
      avgConfidence: 0,
      highConfidenceSignals: 0,
    });
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'COMPRA':
        return <TrendingUp className="w-5 h-5 text-signal-buy" />;
      case 'VENDA':
        return <TrendingDown className="w-5 h-5 text-signal-sell" />;
      default:
        return <Minus className="w-5 h-5 text-signal-neutral" />;
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'COMPRA':
        return 'border-signal-buy/30 bg-signal-buy/10';
      case 'VENDA':
        return 'border-signal-sell/30 bg-signal-sell/10';
      default:
        return 'border-signal-neutral/30 bg-signal-neutral/10';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-signal-buy font-bold';
    if (confidence >= 60) return 'text-warning';
    return 'text-signal-sell';
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <BarChart3 className="w-6 h-6 text-primary" />
                Estatísticas
              </CardTitle>
              <CardDescription>Performance do robô em tempo real</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearHistory}
              disabled={history.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-signal-buy">{stats.buy}</p>
              <p className="text-xs text-muted-foreground">Compras</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-signal-sell">{stats.sell}</p>
              <p className="text-xs text-muted-foreground">Vendas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-signal-neutral">{stats.neutral}</p>
              <p className="text-xs text-muted-foreground">Neutros</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{stats.avgConfidence}%</p>
              <p className="text-xs text-muted-foreground">Confiança Média</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.highConfidenceSignals}</p>
              <p className="text-xs text-muted-foreground">Alta Confiança</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-foreground">Histórico de Análises</CardTitle>
          <CardDescription>
            Últimas {history.length} análises realizadas pelo robô
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma análise realizada ainda</p>
              <p className="text-sm mt-2">Inicie o robô para começar a analisar</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {history.map((analysis, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${getSignalColor(analysis.signal)} transition-all hover:shadow-md`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getSignalIcon(analysis.signal)}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-lg text-foreground">{analysis.signal}</p>
                          <span className="text-sm font-medium px-2 py-1 rounded bg-secondary text-secondary-foreground">
                            {analysis.asset}
                          </span>
                        </div>
                        <p className="text-sm mt-1 text-muted-foreground">{analysis.candlePattern}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getConfidenceColor(analysis.confidence)}`}>
                        {Math.round(analysis.confidence)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(analysis.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground">{analysis.reasoning}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
