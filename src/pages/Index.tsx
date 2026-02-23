import { ControlPanel } from '@/components/ControlPanel';
import { LiveAnalysis } from '@/components/LiveAnalysis';
import { AnalysisHistory } from '@/components/AnalysisHistory';
import { Bot, Github, Info } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-border bg-card/40 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="gradient-primary p-3 rounded-xl shadow-lg glow-primary">
                <Bot className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Prisma AI Trading Assistant
                </h1>
                <p className="text-accent-foreground">
                  Robô de análise Price Action com Visão Computacional e Gemini AI
                </p>
              </div>
            </div>
            <a
              href="https://github.com/7777khali-netizen/PRISMA-CHAT-TRADING"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-accent rounded-lg transition-colors text-secondary-foreground"
            >
              <Github className="w-5 h-5" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Info Banner */}
        <div className="mb-8 p-6 glass-card rounded-xl border-primary/20">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg mb-2 text-foreground">Como Usar:</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. <strong className="text-foreground">Configure a API Key do Gemini</strong> - Obtenha em <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-primary/80">Google AI Studio</a></li>
                <li>2. <strong className="text-foreground">Inicie a Captura de Tela</strong> - Selecione a aba da sua corretora (MT4/MT5/TradingView)</li>
                <li>3. <strong className="text-foreground">Configure o Ativo</strong> - Digite o par (ex: EURUSD, GBPUSD)</li>
                <li>4. <strong className="text-foreground">Inicie o Robô</strong> - Ele analisará automaticamente no segundo 57 da vela M1</li>
                <li>5. <strong className="text-foreground">Aguarde os Sinais</strong> - O robô falará os sinais encontrados com confiança e raciocínio</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ControlPanel />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <LiveAnalysis />
            <AnalysisHistory />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/40 backdrop-blur-lg mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-muted-foreground text-sm">
            <p>
              Desenvolvido com ❤️ usando{' '}
              <span className="text-primary">React</span>,{' '}
              <span className="text-primary">TypeScript</span>,{' '}
              <span className="text-primary">Gemini AI</span> e{' '}
              <span className="text-primary">Tailwind CSS</span>
            </p>
            <p className="mt-2 text-xs">
              ⚠️ Este sistema é para fins educacionais. Trading envolve riscos.
              Use com responsabilidade e nunca opere com dinheiro que não pode perder.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
