import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!imageBase64) throw new Error("imageBase64 is required");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em análise de volume e força de mercado para trading.

TAREFA: Analise a imagem da tela de trading e extraia informações de volume e força em tempo real.

REGRAS:
1. Identifique o ativo sendo negociado
2. Analise as barras de volume (verdes = compradores, vermelhas = vendedores)
3. Calcule a força relativa entre compradores e vendedores (0-100)
4. Identifique a direção predominante da força
5. Identifique os últimos movimentos de volume com setas

RESPONDA EXATAMENTE NO FORMATO JSON:
{
  "ativo": "EURUSD ou o que identificar",
  "preco": "preço atual visível ou null",
  "forca_compradora": 0-100,
  "forca_vendedora": 0-100,
  "direcao": "COMPRA" | "VENDA" | "NEUTRO",
  "intensidade": "FORTE" | "MODERADA" | "FRACA",
  "volume_bars": [
    {"tipo": "compra"|"venda", "valor": número, "tamanho": "grande"|"medio"|"pequeno"}
  ],
  "setas": [
    {"direcao": "cima"|"baixo", "valor": número}
  ],
  "resumo": "Descrição técnica breve da força atual"
}

Seja preciso e técnico. Apenas fatos visuais.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analise esta captura de tela de trading e extraia os dados de volume e força em tempo real."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao seu workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no gateway de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: "Resposta da IA não está no formato esperado", raw: content }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ success: true, data: analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-trading error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
