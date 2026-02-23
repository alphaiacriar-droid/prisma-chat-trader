import { screenCaptureService } from './screenCapture.service';
import { geminiService } from './gemini.service';
import { speechService } from './speech.service';
import type { AnalysisResult } from './gemini.service';

export interface AutomationConfig {
  enabled: boolean;
  targetSecond: number;
  assets: string[];
  minConfidence: number;
  voiceEnabled: boolean;
  alertOnlyHighConfidence: boolean;
}

class AutomationService {
  private config: AutomationConfig = {
    enabled: false,
    targetSecond: 57,
    assets: ['EURUSD'],
    minConfidence: 60,
    voiceEnabled: true,
    alertOnlyHighConfidence: true,
  };

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private lastAnalysis: AnalysisResult | null = null;
  private analysisHistory: AnalysisResult[] = [];
  private onAnalysisCallback: ((result: AnalysisResult) => void) | null = null;

  configure(config: Partial<AutomationConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig(): AutomationConfig {
    return { ...this.config };
  }

  onAnalysis(callback: (result: AnalysisResult) => void) {
    this.onAnalysisCallback = callback;
  }

  async start(): Promise<void> {
    if (this.config.enabled) {
      console.log('⚠️ Automação já está em execução');
      return;
    }

    if (!geminiService.isInitialized()) {
      throw new Error('Gemini AI não está configurado. Configure a API Key primeiro.');
    }

    if (!screenCaptureService.isCapturing()) {
      throw new Error('Captura de tela não foi iniciada. Inicie a captura primeiro.');
    }

    this.config.enabled = true;
    console.log('🤖 Automação iniciada - Aguardando segundo', this.config.targetSecond);

    this.intervalId = setInterval(() => {
      this.checkAndAnalyze();
    }, 1000);

    speechService.speakQuick('Robô ativado e pronto para operar');
  }

  private async checkAndAnalyze() {
    const currentSecond = new Date().getSeconds();

    if (currentSecond === this.config.targetSecond) {
      try {
        await this.performAnalysis();
      } catch (error) {
        console.error('❌ Erro na análise automática:', error);
      }
    }
  }

  private async performAnalysis() {
    console.log(`⏰ Segundo ${this.config.targetSecond} - Capturando e analisando...`);

    try {
      const frame = screenCaptureService.captureFrame();
      const asset = this.config.assets[0] || 'DESCONHECIDO';
      const analysis = await geminiService.analyzeCandle(frame, asset);

      this.lastAnalysis = analysis;
      this.analysisHistory.unshift(analysis);

      if (this.analysisHistory.length > 50) {
        this.analysisHistory.pop();
      }

      if (this.onAnalysisCallback) {
        this.onAnalysisCallback(analysis);
      }

      if (this.shouldAlert(analysis)) {
        if (analysis.confidence >= 80) {
          speechService.playAlert();
        }

        if (this.config.voiceEnabled) {
          speechService.speak(analysis);
        }
      }

      console.log('✅ Análise concluída:', {
        signal: analysis.signal,
        confidence: analysis.confidence,
        pattern: analysis.candlePattern
      });

    } catch (error: any) {
      console.error('❌ Falha na análise:', error);

      if (this.config.voiceEnabled) {
        speechService.speakQuick('Erro na análise. Verifique a captura.');
      }
    }
  }

  private shouldAlert(analysis: AnalysisResult): boolean {
    if (analysis.signal === 'NEUTRO') {
      return false;
    }

    if (this.config.alertOnlyHighConfidence) {
      return analysis.confidence >= 75;
    }

    return analysis.confidence >= this.config.minConfidence;
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.config.enabled = false;
    console.log('🛑 Automação parada');
    speechService.speakQuick('Robô desativado');
  }

  isRunning(): boolean {
    return this.config.enabled;
  }

  getLastAnalysis(): AnalysisResult | null {
    return this.lastAnalysis;
  }

  getHistory(): AnalysisResult[] {
    return [...this.analysisHistory];
  }

  clearHistory() {
    this.analysisHistory = [];
    this.lastAnalysis = null;
  }

  async analyzeNow(): Promise<AnalysisResult> {
    console.log('🔍 Análise manual solicitada');

    const frame = screenCaptureService.captureFrame();
    const asset = this.config.assets[0] || 'DESCONHECIDO';
    const analysis = await geminiService.analyzeCandle(frame, asset);

    this.lastAnalysis = analysis;
    this.analysisHistory.unshift(analysis);

    if (this.onAnalysisCallback) {
      this.onAnalysisCallback(analysis);
    }

    return analysis;
  }

  getStats() {
    const total = this.analysisHistory.length;
    const buy = this.analysisHistory.filter(a => a.signal === 'COMPRA').length;
    const sell = this.analysisHistory.filter(a => a.signal === 'VENDA').length;
    const neutral = this.analysisHistory.filter(a => a.signal === 'NEUTRO').length;
    const avgConfidence = total > 0
      ? this.analysisHistory.reduce((acc, a) => acc + a.confidence, 0) / total
      : 0;

    return {
      total,
      buy,
      sell,
      neutral,
      avgConfidence: Math.round(avgConfidence),
      highConfidenceSignals: this.analysisHistory.filter(a => a.confidence >= 80).length,
    };
  }
}

export const automationService = new AutomationService();
