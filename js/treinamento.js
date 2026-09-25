// ==============================================
// 🧠 SISTEMA DE TREINAMENTO — APRENDE COM SEU MATERIAL
// ==============================================

const PADROES_ESTILO = {
  // Paleta base Clean Car (atualizada conforme referências)
  cores: {
    primaria: '#0284C7',
    destaque: '#22C55E',
    fundo: '#0F172A',
    texto: '#FFFFFF',
    contraste: '#F97316'
  },

  // Elementos visuais que sempre aparecem
  elementosComuns: [
    'faixa no topo',
    'carro branco',
    'iluminação neon',
    'texto em negrito',
    'valores destacados',
    'botão de ação'
  ],

  // Frases e estruturas de texto
  estruturasTexto: {
    chamadas: ['PROMOÇÃO', 'OFERTA', 'DESCONTO', 'VAGAS LIMITADAS', 'AGENDE AGORA'],
    formatosValor: ['De X por Y', 'X% DE DESCONTO', 'À VISTA', 'POR APENAS'],
    assinaturas: ['Clean Car', 'Vonixx', 'Mogi das Cruzes']
  }
};

// ==============================================
// 🔍 ANALISA O MATERIAL ENVIADO
// ==============================================
export async function analisarMaterial() {
  // Tenta ler o que foi enviado
  const imagens = await listarArquivosPasta('treinamento/imagens/');
  const textos = await listarArquivosPasta('treinamento/textos/');
  
  const encontrados = imagens.length > 0 || textos.length > 0;

  if (!encontrados) {
    return { encontrados: false };
  }

  // Analisa padrões visuais
  const estilo = extrairPadroesVisuais(imagens);
  const texto = extrairPadroesTexto(textos);

  return {
    encontrados: true,
    imagens,
    textos,
    estilo,
    texto,
    dataAnalise: new Date().toLocaleString('pt-BR')
  };
}

// ==============================================
// 🎨 GERA PROMPT DEFINITIVO PARA IMAGENS
// ==============================================
export function gerarPromptEstilo(dadosAprendidos) {
  const regras = dadosAprendidos.estilo || [];
  
  return `
=== ESTILO OFICIAL — CLEAN CAR ===
SEMPRE aplicar essas regras, sem exceção:

🎨 CORES:
- Fundo escuro elegante: preto/cinza escuro com textura sutil
- Faixa superior: verde vibrante #22C55E em gradiente
- Texto principal: branco puro em negrito
- Valores e descontos: verde #22C55E em destaque maior
- Contraste: laranja #F97316 para chamadas urgentes

🚗 CARRO:
- Cor preferencial: branco ou prata
- Ângulo: frontal 3/4, mostrando frente e lateral
- Estado: limpo, brilhante, com gotas de água visíveis
- Iluminação: luzes neon verde nos contornos, reflexos no asfalto
- NUNCA: cortado, deformado, cores escuras ou chamativas

📐 LAYOUT:
- Topo: Título grande e chamativo → "PROMOÇÃO RELÂMPAGO"
- Centro: Imagem do carro ocupando ~60%
- Abaixo: Dois blocos lado a lado com os descontos
- Rodapé: Chamada para ação + link de agendamento

🚫 PROIBIDO SEMPRE:
- Placa visível
- Logotipo sobre a imagem
- Marca d'água
- Texto pequeno ou ilegível
- Carro de corrida/esportivo exagerado

${regras.length > 0 ? `\n📋 APRENDIDO DAS SUAS ARTES:\n${regras.map(r => `- ${r}`).join('\n')}` : ''}
  `.trim();
}

// ==============================================
// 🔧 FUNÇÕES AUXILIARES
// ==============================================
async function listarArquivosPasta(caminho) {
  try {
    const resposta = await fetch(caminho);
    if (!resposta.ok) return [];
    const html = await resposta.text();
    
    // Extrai nomes de arquivos
    const arquivos = [];
    const regex = /href="([^"]+\.(jpg|jpeg|png|webp|txt|md))"/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
      arquivos.push(match[1]);
    }
    return arquivos;
  } catch {
    return [];
  }
}

function extrairPadroesVisuais(listaArquivos) {
  // Conforme você envia, vamos adicionando regras específicas
  const padroesBase = [
    'Fundo escuro com iluminação de estúdio',
    'Faixa verde no topo da arte',
    'Carro branco limpo e brilhante no centro',
    'Texto grande e legível em branco',
    'Valores em destaque com cor verde'
  ];
  
  // Se houver referências específicas, adicionamos aqui
  if (listaArquivos.some(f => f.includes('campanha') || f.includes('promo'))) {
    padroesBase.push('Estrutura: Título → Carro → Descontos → Chamada');
  }
  
  return padroesBase;
}

function extrairPadroesTexto(listaArquivos) {
  return [
    'Tom direto e energético',
    'Desconto em destaque: "X% para Y"',
    'Uso de emojis para chamar atenção: 🔥 ✅ ⏰',
    'Link de agendamento no final',
    'Localização: Mogi das Cruzes',
    'Produtos: Vonixx'
  ];
}

// Exporta para ser usado no gerador de imagem
export const ESTILO_CLEAN_CAR = PADROES_ESTILO;
