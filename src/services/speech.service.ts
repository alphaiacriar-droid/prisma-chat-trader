import type { TradingAnalysis } from './tradingAnalysis.service';

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
    };
    setVoice();
    this.synth.onvoiceschanged = setVoice;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  clearQueue() {
    this.synth.cancel();
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
