export interface CaptureOptions {
  width: number;
  height: number;
  quality: number;
}

class ScreenCaptureService {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  private readonly CAPTURE_WIDTH = 1280;
  private readonly CAPTURE_HEIGHT = 720;

  async startCapture(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: false
      });

      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = this.stream;
      this.videoElement.play();

      this.canvas = document.createElement('canvas');
      this.canvas.width = this.CAPTURE_WIDTH;
      this.canvas.height = this.CAPTURE_HEIGHT;
      this.ctx = this.canvas.getContext('2d', {
        alpha: false,
        desynchronized: true
      });

      await new Promise((resolve) => {
        this.videoElement!.onloadedmetadata = resolve;
      });

      console.log('✅ Captura de tela iniciada com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao iniciar captura:', error);
      throw new Error(`Falha ao capturar tela: ${error.message}`);
    }
  }

  captureFrame(): string {
    if (!this.videoElement || !this.canvas || !this.ctx) {
      throw new Error('Captura não foi iniciada. Use startCapture() primeiro.');
    }

    this.ctx.drawImage(
      this.videoElement,
      0, 0,
      this.CAPTURE_WIDTH,
      this.CAPTURE_HEIGHT
    );

    return this.canvas.toDataURL('image/png', 1.0);
  }

  stopCapture(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }

    this.canvas = null;
    this.ctx = null;

    console.log('🛑 Captura de tela finalizada');
  }

  isCapturing(): boolean {
    return this.stream !== null && this.stream.active;
  }

  getPreviewElement(): HTMLVideoElement | null {
    return this.videoElement;
  }

  async captureAtSecond(targetSecond: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const checkSecond = () => {
        const currentSecond = new Date().getSeconds();

        if (currentSecond === targetSecond) {
          try {
            const frame = this.captureFrame();
            resolve(frame);
          } catch (error) {
            reject(error);
          }
        } else {
          setTimeout(checkSecond, 100);
        }
      };

      checkSecond();
    });
  }
}

export const screenCaptureService = new ScreenCaptureService();
