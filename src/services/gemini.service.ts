import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AnalysisResult {
  signal: 'COMPRA' | 'VENDA' | 'NEUTRO';
  asset: string;
  confidence: number;
  reasoning: string;
  timestamp: Date;
  candlePattern: string;
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private apiKey: string = '';

  initialize(apiKey: string) {
    this.apiKey = apiKey;
    this.genAI = new GoogleGenerativeAI(apiKey);

    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.1,
        topK: 1,
        topP: 0.8,
        maxOutputTokens: 500,
      }
    });
  }

  isInitialized(): boolean {
    return this.model !== null;
  }

  async analyzeCandle(imageBase64: string, asset: string = 'DESCONHECIDO'): Promise<AnalysisResult> {
    if (!this.model) {
      throw new Error('Gemini não inicializado. Configure a API Key primeiro.');
    }

    try {
      const prompt = `Você é um especialista em Price Action e trading de M1 (1 minuto).

REGRAS ABSOLUTAS:
1. IGNORE notícias, sentimentos de mercado e análise fundamentalista
2. FOCO EXCLUSIVO: Padrões de vela, pavios, corpo e posição em zonas de suporte/resistência
3. Análise baseada APENAS em matemática de candlestick

ANÁLISE TÉCNICA REQUERIDA:
• **Rejeição**: Pavio longo (≥60% da vela) em zona de suporte/resistência = REVERSÃO
• **Fluxo**: Corpo forte sem pavio (≥70% da vela) = CONTINUIDADE
• **Indecisão**: Doji ou corpo pequeno = NEUTRO

IMAGEM FORNECIDA: Captura da tela de trading do ativo ${asset}

RESPONDA NO FORMATO JSON:
{
  "signal": "COMPRA" | "VENDA" | "NEUTRO",
  "confidence": 0-100,
  "candlePattern": "Descrição técnica do padrão identificado",
  "reasoning": "Explicação breve e direta baseada em price action"
}

Seja preciso, rápido e matemático. Sem opinião, apenas fatos visuais da vela.`;

      const imageParts = [
        {
          inlineData: {
            data: imageBase64.split(',')[1],
            mimeType: 'image/png',
          },
        },
      ];

      const result = await this.model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Resposta da IA não está no formato esperado');
      }

      const analysis = JSON.parse(jsonMatch[0]);

      return {
        signal: analysis.signal,
        asset: asset,
        confidence: analysis.confidence,
        reasoning: analysis.reasoning,
        candlePattern: analysis.candlePattern,
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error('Erro na análise do Gemini:', error);
      throw new Error(`Falha na análise: ${error.message}`);
    }
  }

  async analyzeBatch(captures: Array<{ image: string; asset: string }>): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];

    for (const capture of captures) {
      try {
        const result = await this.analyzeCandle(capture.image, capture.asset);
        results.push(result);
      } catch (error) {
        console.error(`Erro ao analisar ${capture.asset}:`, error);
      }
    }

    return results;
  }
}

export const geminiService = new GeminiService();
