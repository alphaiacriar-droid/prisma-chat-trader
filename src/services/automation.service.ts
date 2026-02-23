import { screenCaptureService } from './screenCapture.service';
import { tradingAnalysisService, type TradingAnalysis } from './tradingAnalysis.service';
import { speechService } from './speech.service';

export interface AutomationConfig {
  enabled: boolean;
  intervalSeconds: number;
  voiceEnabled: boolean;
}

class AutomationService {
  private config: AutomationConfig = {
    enabled: false,
    intervalSeconds: 15,
    voiceEnabled: true,
  };

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private onAnalysisCallback: ((result: TradingAnalysis) => void) | null = null;

  configure(config: Partial<AutomationConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig(): AutomationConfig {
    return { ...this.config };
  }

  onAnalysis(callback: (result: TradingAnalysis) => void) {
    this.onAnalysisCallback = callback;
    tradingAnalysisService.onAnalysis(callback);
  }

  async start(): Promise<void> {
    if (this.config.enabled) {
      console.log('⚠️ Automação já está em execução');
      return;
    }

    if (!screenCaptureService.isCapturing()) {
      throw new Error('Captura de tela não foi iniciada. Inicie a captura primeiro.');
    }

    this.config.enabled = true;
    console.log('🤖 Automação iniciada - Intervalo:', this.config.intervalSeconds, 's');

    // Primeira análise imediata
    this.performAnalysis();

    this.intervalId = setInterval(() => {
      this.performAnalysis();
    }, this.config.intervalSeconds * 1000);

    if (this.config.voiceEnabled) {
      speechService.speakQuick('Rastreamento de volume e força ativado');
    }
  }

  private async performAnalysis() {
    if (tradingAnalysisService.isAnalyzing()) return;

    try {
      const frame = screenCaptureService.captureFrame();
      const analysis = await tradingAnalysisService.analyze(frame);

      if (this.config.voiceEnabled && analysis.intensidade === 'FORTE') {
        speechService.playAlert();
        speechService.speakQuick(
          `Força ${analysis.direcao === 'COMPRA' ? 'compradora' : 'vendedora'} forte detectada. ${analysis.resumo}`
        );
      }

      console.log('✅ Análise concluída:', {
        direcao: analysis.direcao,
        intensidade: analysis.intensidade,
        forca_compradora: analysis.forca_compradora,
        forca_vendedora: analysis.forca_vendedora,
      });
    } catch (error: any) {
      console.error('❌ Falha na análise:', error);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.config.enabled = false;
    console.log('🛑 Automação parada');
    if (this.config.voiceEnabled) {
      speechService.speakQuick('Rastreamento desativado');
    }
  }

  isRunning(): boolean {
    return this.config.enabled;
  }

  getLastAnalysis(): TradingAnalysis | null {
    return tradingAnalysisService.getLastAnalysis();
  }

  getHistory(): TradingAnalysis[] {
    return tradingAnalysisService.getHistory();
  }

  async analyzeNow(): Promise<TradingAnalysis> {
    const frame = screenCaptureService.captureFrame();
    return tradingAnalysisService.analyze(frame);
  }
}

export const automationService = new AutomationService();
