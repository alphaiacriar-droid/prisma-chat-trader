import type { AnalysisResult } from './gemini.service';

class SpeechService {
  private synth: SpeechSynthesis;
  private voice: SpeechSynthesisVoice | null = null;
  private enabled: boolean = true;
  private volume: number = 1.0;
  private rate: number = 1.1;

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
  }

  private loadVoices() {
    const setVoice = () => {
      const voices = this.synth.getVoices();
      this.voice = voices.find(v => v.lang === 'pt-BR') ||
                   voices.find(v => v.lang.startsWith('pt')) ||
                   voices[0];
      console.log('🔊 Voz selecionada:', this.voice?.name);
    };

    setVoice();
    this.synth.onvoiceschanged = setVoice;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setRate(rate: number) {
    this.rate = Math.max(0.5, Math.min(2, rate));
  }

  clearQueue() {
    this.synth.cancel();
  }

  speak(analysis: AnalysisResult) {
    if (!this.enabled) return;
    this.clearQueue();

    const message = this.formatMessage(analysis);
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.voice = this.voice;
    utterance.volume = this.volume;
    utterance.rate = this.rate;
    utterance.pitch = 1.0;
    utterance.lang = 'pt-BR';

    utterance.onstart = () => {
      console.log('🔊 Falando:', message);
    };

    utterance.onerror = (error) => {
      console.error('❌ Erro na síntese de voz:', error);
    };

    this.synth.speak(utterance);
  }

  private formatMessage(analysis: AnalysisResult): string {
    const signalMap: Record<string, string> = {
      'COMPRA': 'Sinal de COMPRA',
      'VENDA': 'Sinal de VENDA',
      'NEUTRO': 'Mercado neutro'
    };

    const signal = signalMap[analysis.signal];
    const confidence = Math.round(analysis.confidence);
    const asset = analysis.asset === 'DESCONHECIDO' ? '' : ` em ${analysis.asset}`;

    if (confidence >= 80) {
      return `${signal}${asset}. Confiança alta: ${confidence} porcento. ${analysis.candlePattern}`;
    } else if (confidence >= 60) {
      return `${signal}${asset}. Confiança moderada: ${confidence} porcento.`;
    } else {
      return `${signal}${asset}. Confiança baixa: ${confidence} porcento. Cuidado.`;
    }
  }

  speakQuick(message: string) {
    if (!this.enabled) return;
    this.clearQueue();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.voice = this.voice;
    utterance.volume = this.volume;
    utterance.rate = this.rate * 1.2;
    utterance.lang = 'pt-BR';
    this.synth.speak(utterance);
  }

  playAlert() {
    if (!this.enabled) return;

    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(this.volume * 0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }
}

export const speechService = new SpeechService();
