import { supabase } from "@/integrations/supabase/client";

export interface VolumeBar {
  tipo: 'compra' | 'venda';
  valor: number;
  tamanho: 'grande' | 'medio' | 'pequeno';
}

export interface ForceArrow {
  direcao: 'cima' | 'baixo';
  valor: number;
}

export interface TradingAnalysis {
  ativo: string;
  preco: string | null;
  forca_compradora: number;
  forca_vendedora: number;
  direcao: 'COMPRA' | 'VENDA' | 'NEUTRO';
  intensidade: 'FORTE' | 'MODERADA' | 'FRACA';
  volume_bars: VolumeBar[];
  setas: ForceArrow[];
  resumo: string;
  timestamp: Date;
}

class TradingAnalysisService {
  private lastAnalysis: TradingAnalysis | null = null;
  private analysisHistory: TradingAnalysis[] = [];
  private onAnalysisCallback: ((result: TradingAnalysis) => void) | null = null;
  private analyzing = false;

  onAnalysis(callback: (result: TradingAnalysis) => void) {
    this.onAnalysisCallback = callback;
  }

  isAnalyzing(): boolean {
    return this.analyzing;
  }

  async analyze(imageBase64: string): Promise<TradingAnalysis> {
    this.analyzing = true;

    try {
      const { data, error } = await supabase.functions.invoke('analyze-trading', {
        body: { imageBase64 }
      });

      if (error) throw new Error(error.message || 'Erro na análise');

      if (data?.error) {
        throw new Error(data.error);
      }

      const analysis: TradingAnalysis = {
        ...data.data,
        timestamp: new Date(),
      };

      this.lastAnalysis = analysis;
      this.analysisHistory.unshift(analysis);

      if (this.analysisHistory.length > 30) {
        this.analysisHistory.pop();
      }

      if (this.onAnalysisCallback) {
        this.onAnalysisCallback(analysis);
      }

      return analysis;
    } catch (error: any) {
      console.error('Erro na análise de trading:', error);
      throw error;
    } finally {
      this.analyzing = false;
    }
  }

  getLastAnalysis(): TradingAnalysis | null {
    return this.lastAnalysis;
  }

  getHistory(): TradingAnalysis[] {
    return [...this.analysisHistory];
  }

  clearHistory() {
    this.analysisHistory = [];
    this.lastAnalysis = null;
  }
}

export const tradingAnalysisService = new TradingAnalysisService();
