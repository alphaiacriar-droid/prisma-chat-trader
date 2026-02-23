import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { geminiService } from '@/services/gemini.service';
import { screenCaptureService } from '@/services/screenCapture.service';
import { automationService } from '@/services/automation.service';
import { speechService } from '@/services/speech.service';
import { Play, Square, Camera, Settings, Mic, MicOff, Eye, EyeOff } from 'lucide-react';

export function ControlPanel() {
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [asset, setAsset] = useState('EURUSD');
  const [targetSecond, setTargetSecond] = useState(57);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      try {
        geminiService.initialize(savedKey);
        setIsConfigured(true);
      } catch (err) {
        console.error('Erro ao inicializar Gemini:', err);
      }
    }
  }, []);

  const handleConfigureAI = () => {
    if (!apiKey.trim()) {
      setError('Por favor, insira sua API Key do Gemini');
      return;
    }

    try {
      geminiService.initialize(apiKey);
      localStorage.setItem('gemini_api_key', apiKey);
      setIsConfigured(true);
      setError('');
      speechService.speakQuick('Inteligência artificial configurada com sucesso');
    } catch (err: any) {
      setError(`Erro ao configurar: ${err.message}`);
    }
  };

  const handleStartCapture = async () => {
    try {
      await screenCaptureService.startCapture();
      setIsCapturing(true);
      setError('');
      speechService.speakQuick('Captura de tela iniciada');
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
    speechService.speakQuick('Captura de tela finalizada');
  };

  const handleStartAutomation = async () => {
    if (!isConfigured) {
      setError('Configure a API Key do Gemini primeiro');
      return;
    }

    if (!isCapturing) {
      setError('Inicie a captura de tela primeiro');
      return;
    }

    try {
      automationService.configure({
        assets: [asset],
        targetSecond: targetSecond,
        voiceEnabled: voiceEnabled,
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
    if (!isConfigured || !isCapturing) {
      setError('Configure o sistema e inicie a captura primeiro');
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
          Configure e controle o robô de análise de trading
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* API Key */}
        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key do Gemini</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Cole sua API Key aqui"
                disabled={isConfigured}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <Button
              onClick={handleConfigureAI}
              disabled={isConfigured}
              className="min-w-[120px]"
            >
              {isConfigured ? '✓ Configurado' : 'Configurar'}
            </Button>
          </div>
          {isConfigured && (
            <p className="text-sm text-success">
              ✓ Gemini 1.5 Flash configurado e pronto
            </p>
          )}
        </div>

        {/* Asset */}
        <div className="space-y-2">
          <Label htmlFor="asset">Ativo para Análise</Label>
          <Input
            id="asset"
            value={asset}
            onChange={(e) => setAsset(e.target.value.toUpperCase())}
            placeholder="Ex: EURUSD"
            disabled={isRunning}
          />
        </div>

        {/* Target Second */}
        <div className="space-y-2">
          <Label htmlFor="targetSecond">Segundo para Análise (0-59)</Label>
          <Input
            id="targetSecond"
            type="number"
            min="0"
            max="59"
            value={targetSecond}
            onChange={(e) => setTargetSecond(parseInt(e.target.value) || 57)}
            disabled={isRunning}
          />
          <p className="text-xs text-muted-foreground">
            Recomendado: 57 (final da vela M1)
          </p>
        </div>

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
                Parar Captura
              </Button>
            )}
          </div>
        </div>

        {/* Automation Controls */}
        <div className="space-y-2">
          <Label>Automação</Label>
          <div className="flex gap-2">
            {!isRunning ? (
              <Button
                onClick={handleStartAutomation}
                disabled={!isConfigured || !isCapturing}
                className="flex-1 gradient-buy"
              >
                <Play className="w-4 h-4 mr-2" />
                Iniciar Robô
              </Button>
            ) : (
              <Button
                onClick={handleStopAutomation}
                variant="destructive"
                className="flex-1"
              >
                <Square className="w-4 h-4 mr-2" />
                Parar Robô
              </Button>
            )}
            <Button
              onClick={handleManualAnalysis}
              disabled={!isConfigured || !isCapturing}
              variant="outline"
            >
              Analisar Agora
            </Button>
          </div>
        </div>

        {/* Status */}
        {isRunning && (
          <div className="p-4 rounded-lg border border-success/30 bg-success/10">
            <p className="text-success font-medium">
              🤖 Robô em execução - Aguardando segundo {targetSecond} para análise
            </p>
          </div>
        )}

        {/* Errors */}
        {error && (
          <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/10">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
