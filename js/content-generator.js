import CONFIG from './config.js';

export const POSTS_SEMANAIS = [
  { dia: "Domingo", icone: "☀️", titulo: "Bom dia & Carro Cuidado", modelo: (link) => `☀️ Bom dia, Mogi das Cruzes!\n\nClean Car — produtos Vonixx, cuidado em cada detalhe.\n\n👉 ${link}\n\n#CleanCar #MogiDasCruzes #Vonixx` },
  { dia: "Segunda", icone: "🔥", titulo: "Campanha Outubro — 15% OFF", modelo: (link) => `🔥 15% DE DESCONTO!\n\n✅ Prata: R$ 110,50\n✅ Ouro: R$ 153 ⭐\n✅ VIP: R$ 357\n\n👉 ${link}\n\n#CleanCar #OutubroCleanCar` },
  { dia: "Terça", icone: "😍", titulo: "Antes e Depois", modelo: (link) => `😍 O cuidado transforma!\n\nProdutos Vonixx do início ao fim.\n\n👉 ${link}\n\n#AntesEDepois #CleanCar #Vonixx` },
  { dia: "Quarta", icone: "⭐", titulo: "Lavagem Ouro — Mais Pedida", modelo: (link) => `⭐ LAVAGEM OURO R$ 153!\n\nPré-lavagem + Vonixx + Higienização inclusa.\n\n👉 ${link}\n\n#LavagemOuro #CleanCar #MogiDasCruzes` },
  { dia: "Quinta", icone: "🧹", titulo: "Higienização VIP — Saúde", modelo: (link) => `🧹 HIGIENIZAÇÃO VIP R$ 357!\n\nElimine odores e bactérias — saúde pra sua família 💚\n\n👉 ${link}\n\n#Higienizacao #SaudeNoTransito #CleanCar` },
  { dia: "Sexta", icone: "🚗✨", titulo: "Sextou com Desconto", modelo: (link) => `🚗✨ SEXTOU COM CARRO BRILHANDO!\n\nAproveite 15% OFF em Outubro!\n\n👉 ${link}\n\n#SextaFeira #CleanCar #OutubroCleanCar` },
  { dia: "Sábado", icone: "✨", titulo: "Seu Carro Novo, de Novo", modelo: (link) => `✨ Carro pronto pra rodar!\n\n15% OFF em Outubro — Clean Car.\n\n👉 ${link}\n\n#CleanCar #SeuCarroNovoDeNovo` }
];

export function getPostDoDia() {
  return POSTS_SEMANAIS[new Date().getDay()];
}

export function gerarTextoPersonalizado(pedido) {
  const p = pedido.toLowerCase();
  const link = CONFIG.LINK_AGENDAMENTO;

  if (p.includes('lavagem prata')) return `🚿 LAVAGEM PRATA 15% OFF!\nDe R$ 130 → R$ 110,50\n\nLimpeza completa + brilho.\n\n👉 ${link}\n\n#CleanCar #LavagemPrata #MogiDasCruzes`;
  if (p.includes('lavagem ouro')) return `⭐ LAVAGEM OURO 15% OFF!\nDe R$ 180 → R$ 153\n\nPré-lavagem + produtos Vonixx + Higienização inclusa.\n\n👉 ${link}\n\n#CleanCar #LavagemOuro #Vonixx`;
  if (p.includes('higienização') || p.includes('higienizacao')) return `🧹 HIGIENIZAÇÃO VIP 15% OFF!\nDe R$ 420 → R$ 357\n\nElimine odores e bactérias — saúde pra sua família 💚\n\n👉 ${link}\n\n#CleanCar #Higienizacao #SaudeNoTransito`;
  if (p.includes('campanha') || p.includes('outubro')) return `🔥 OUTUBRO CLEAN CAR — 15% OFF!\n\n✅ Prata: R$ 110,50\n✅ Ouro: R$ 153\n✅ VIP: R$ 357\n\n👉 ${link}\n\n#CleanCar #OutubroCleanCar #MogiDasCruzes`;

  return `🚗✨ ${pedido}\n\nClean Car — Produtos Vonixx, cuidado profissional.\n\n👉 ${link}\n\n#CleanCar #EsteticaAutomotiva #MogiDasCruzes`;
}

export function gerarPromptImagem(pedido, formato) {
  const proporcao = formato === 'feed' ? 'quadrada 1:1' : 'vertical 9:16';
  return `Imagem ${proporcao}, identidade Clean Car — fundo branco e azul, logo visível, estilo profissional. ${pedido}. Agende: ${CONFIG.LINK_AGENDAMENTO}`;
}
