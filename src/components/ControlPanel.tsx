import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { screenCaptureService } from '@/services/screenCapture.service';
import { automationService } from '@/services/automation.service';
import { speechService } from '@/services/speech.service';
import { Play, Square, Camera, Settings, Mic, MicOff } from 'lucide-react';

export function ControlPanel() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [error, setError] = useState('');

  const handleStartCapture = async () => {
    try {
      await screenCaptureService.startCapture();
      setIsCapturing(true);
      setError('');
    } catch (err: any) {
      setError(`Erro na captura: ${err.message}`);
    }
  };

  const handleStopCapture = () => {
    screenCaptureService.stopCapture();
    setIsCapturing(false);
    if (isRunning) {
      handleStopAutomation();
    }
  };

  const handleStartAutomation = async () => {
    if (!isCapturing) {
      setError('Inicie a captura de tela primeiro');
      return;
    }

    try {
      automationService.configure({
        voiceEnabled: voiceEnabled,
        intervalSeconds: 15,
      });

      await automationService.start();
      setIsRunning(true);
      setError('');
    } catch (err: any) {
      setError(`Erro ao iniciar: ${err.message}`);
    }
  };

  const handleStopAutomation = () => {
    automationService.stop();
    setIsRunning(false);
  };

  const handleManualAnalysis = async () => {
    if (!isCapturing) {
      setError('Inicie a captura de tela primeiro');
      return;
    }

    try {
      await automationService.analyzeNow();
      setError('');
    } catch (err: any) {
      setError(`Erro na análise: ${err.message}`);
    }
  };

  useEffect(() => {
    speechService.setEnabled(voiceEnabled);
  }, [voiceEnabled]);

  return (
    <Card className="glass-card glow-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Settings className="w-6 h-6 text-primary" />
          Painel de Controle
        </CardTitle>
        <CardDescription>
          Configure e controle o rastreamento de volume e força
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {voiceEnabled ? <Mic className="w-4 h-4 text-primary" /> : <MicOff className="w-4 h-4 text-muted-foreground" />}
            <Label htmlFor="voice">Alertas de Voz</Label>
          </div>
          <Switch
            id="voice"
            checked={voiceEnabled}
            onCheckedChange={setVoiceEnabled}
          />
        </div>

        {/* Capture Controls */}
        <div className="space-y-2">
          <Label>Captura de Tela</Label>
          <div className="flex gap-2">
            <Button
              onClick={handleStartCapture}
              disabled={isCapturing}
              className="flex-1"
              variant={isCapturing ? "secondary" : "default"}
            >
              <Camera className="w-4 h-4 mr-2" />
              {isCapturing ? 'Capturando...' : 'Iniciar Captura'}
            </Button>
            {isCapturing && (
              <Button
                onClick={handleStopCapture}
                variant="destructive"
                className="flex-1"
              >
                <Square className="w-4 h-4 mr-2" />
                Parar
              </Button>
            )}
          </div>
        </div>

        {/* Automation Controls */}
        <div className="space-y-2">
          <Label>Rastreamento Automático</Label>
          <div className="flex gap-2">
            {!isRunning ? (
              <Button
                onClick={handleStartAutomation}
                disabled={!isCapturing}
                className="flex-1 gradient-buy"
              >
                <Play className="w-4 h-4 mr-2" />
                Iniciar Rastreamento
              </Button>
            ) : (
              <Button
                onClick={handleStopAutomation}
                variant="destructive"
                className="flex-1"
              >
                <Square className="w-4 h-4 mr-2" />
                Parar
              </Button>
            )}
            <Button
              onClick={handleManualAnalysis}
              disabled={!isCapturing}
              variant="outline"
            >
              Analisar Agora
            </Button>
          </div>
        </div>

        {/* Status */}
        {isRunning && (
          <div className="p-4 rounded-lg border border-success/30 bg-success/10">
            <p className="text-success font-medium text-sm">
              🤖 Rastreamento ativo - Analisando a cada 15 segundos
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/10">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
