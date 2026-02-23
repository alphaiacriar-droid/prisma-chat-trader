import { ControlPanel } from '@/components/ControlPanel';
import { VolumeForcePanel } from '@/components/VolumeForcePanel';
import { Bot, Info } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-border bg-card/40 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center gap-4">
            <div className="gradient-primary p-3 rounded-xl shadow-lg glow-primary">
              <Bot className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Prisma Trading - Volume & Força
              </h1>
              <p className="text-sm text-muted-foreground">
                Rastreamento de volume e força em tempo real com IA
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Info Banner */}
        <div className="mb-6 p-4 glass-card rounded-xl border-primary/20">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm mb-1 text-foreground">Como Usar:</h3>
              <ol className="space-y-1 text-xs text-muted-foreground">
                <li>1. <strong className="text-foreground">Inicie a Captura de Tela</strong> - Selecione a aba da sua corretora</li>
                <li>2. <strong className="text-foreground">Inicie o Rastreamento</strong> - A IA analisará o volume e força automaticamente</li>
                <li>3. <strong className="text-foreground">Visualize em Tempo Real</strong> - Setas, barras e força são atualizados a cada 15s</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ControlPanel />
          </div>
          <div className="lg:col-span-2">
            <VolumeForcePanel />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/40 backdrop-blur-lg mt-12">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center text-muted-foreground text-xs">
            <p>
              Rastreamento de volume e força com{' '}
              <span className="text-primary">IA</span> ·{' '}
              <span className="text-primary">React</span> ·{' '}
              <span className="text-primary">TypeScript</span>
            </p>
            <p className="mt-1">
              ⚠️ Para fins educacionais. Trading envolve riscos.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
