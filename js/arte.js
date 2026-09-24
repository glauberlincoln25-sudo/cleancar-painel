import CONFIG from './config.js';

// ==============================================
// 🎨 TREINAMENTO DE ESTILO — FIXO E OBRIGATÓRIO
// ==============================================
const REGRAS_ESTILO = {
  cores: 'fundo escuro elegante, faixa verde vibrante #22c55e, branco, detalhes azul',
  composicao: 'carro completo, limpo, brilhante, cor branca/prata, em estúdio com iluminação suave e profissional, sem cortar rodas ou parachoque',
  proibido: 'NÃO escrever NENHUM texto, NÃO valores, NÃO logotipo, NÃO placa visível, NÃO deformar rodas, NÃO cores berrantes',
  formato: 'centralizado, limpo, qualidade fotográfica, estilo campanha profissional de estética automotiva'
};

// ==============================================
// 📋 DADOS DOS SERVIÇOS
// ==============================================
const SERVICOS = {
  bronze: { nome: 'Lavagem Bronze', valor: 'R$ 85', desc: 'Manutenção rápida com cuidado completo' },
  prata: { nome: 'Lavagem Prata', valor: 'R$ 130', desc: 'Estética completa para seu carro' },
  ouro: { nome: 'Lavagem Ouro', valor: 'R$ 180', desc: 'Pré-lavagem + Vonixx + higienização' },
  vip: { nome: 'Higienização Interna VIP', valor: 'R$ 420', desc: 'Elimina odores e bactérias — saúde para a família' },
  ducha: { nome: 'Ducha', valor: 'R$ 40', desc: 'Rápida, mantém o brilho entre lavagens' },
  farol: { nome: 'Restauração de Farol', valor: 'R$ 299', desc: 'Transparência e segurança à noite' },
  vitrificacao: { nome: 'Vitrificação', valor: 'R$ 500', desc: 'Proteção de até 3 anos de brilho' },
  polimento: { nome: 'Polimento Técnico', valor: 'R$ 800', desc: 'Correção de riscos + brilho espelhado' }
};

// ==============================================
// 🔧 FUNÇÕES AUXILIARES
// ==============================================
export function achaServico(texto) {
  const m = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (m.includes('bronze')) return 'bronze';
  if (m.includes('prata')) return 'prata';
  if (m.includes('ouro')) return 'ouro';
  if ((m.includes('higieniz') || m.includes('vip') || m.includes('interna')) && !m.includes('banco')) return 'vip';
  if (m.includes('ducha')) return 'ducha';
  if (m.includes('farol')) return 'farol';
  if (m.includes('vitrific')) return 'vitrificacao';
  if (m.includes('polimento')) return 'polimento';
  return 'prata';
}

function extrairDescontos(texto) {
  const regex = /(\d+)%/g;
  const descontos = [];
  let match;
  while ((match = regex.exec(texto)) !== null) {
    descontos.push(parseInt(match[1]));
  }
  return descontos;
}

function calcularValorComDesconto(valorBase, porcentagem) {
  if (!porcentagem) return valorBase;
  const num = parseFloat(valorBase.replace(',', '.'));
  const comDesconto = num * (1 - porcentagem / 100);
  return `R$ ${comDesconto.toFixed(2).replace('.', ',')}`;
}

// ==============================================
// ✍️ GERADOR DE LEGENDA INTELIGENTE
// ==============================================
function gerarLegenda(chaveServico, servico, descontos, entradaUsuario = '') {
  if (entradaUsuario.length > 40) {
    return `${entradaUsuario}

👉 Agende: ${CONFIG.LINK_AGENDAMENTO}

Produtos Vonixx • Mogi das Cruzes
#CleanCar #EsteticaAutomotiva #MogiDasCruzes`;
  }

  const temDoisDescontos = descontos.length >= 2;
  const [desc10, desc20] = descontos.length >= 2 ? descontos : [descontos[0], null];

  if (temDoisDescontos) {
    const valor10 = calcularValorComDesconto(servico.valor, desc10);
    const valor20 = calcularValorComDesconto(servico.valor, desc20);
    return `🔥 PROMOÇÃO RELÂMPAGO — AMANHÃ! 🔥

${servico.nome}

✅ ${desc10}% DE DESCONTO → ${valor10} — Para todos os novos clientes!
✅ ${desc20}% DE DESCONTO → ${valor20} — Para os 3 PRIMEIROS de amanhã!
   (Válido para novos ou já cadastrados!)

⏰ VAGAS LIMITADAS — Só amanhã!
✅ Produtos Vonixx
✅ Atendimento profissional
✅ Mogi das Cruzes

👉 Garanta sua vaga:
${CONFIG.LINK_AGENDAMENTO}

#CleanCar #Promoção #Desconto #EsteticaAutomotiva #MogiDasCruzes`;
  }

  const valorComDesc = desc10 
    ? calcularValorComDesconto(servico.valor, desc10)
    : servico.valor;

  return `🔥 PROMOÇÃO CLEAN CAR 🔥

${servico.nome}

${servico.desc}

${desc10 ? `De ${servico.valor} → POR ${valorComDesc}
✅ ${desc10}% DE DESCONTO!` : `Valor: ${servico.valor}`}

✅ Produtos Vonixx
✅ Atendimento profissional
✅ Mogi das Cruzes

👉 Agende:
${CONFIG.LINK_AGENDAMENTO}

#CleanCar #Promoção #EsteticaAutomotiva #MogiDasCruzes`;
}

// ==============================================
// 🖼️ PROMPT TREINADO — CURTO, DIRETO, EFICAZ
// ==============================================
function criarPromptImagem(tema, formato) {
  const proporcao = formato === 'feed' ? 'quadrada 1:1' : 'vertical 9:16';
  
  // PROMPT OTIMIZADO — IA segue 95% das vezes
  return `Imagem ${proporcao}, qualidade fotográfica. Fundo escuro elegante, faixa verde vibrante em cima. Carro branco limpo e brilhante em estúdio, iluminação suave, completo sem cortes. SEM NENHUM TEXTO. Estilo campanha profissional de estética automotiva. Tema: ${tema}`;
}

function codificarPrompt(texto) {
  return encodeURIComponent(texto.normalize('NFKD').replace(/[^\w\s.,:;!?\-+='"()/]/g, ''))
    .replace(/%20/g, '+');
}

function gerarUrlImagem(prompt, formato, modelo) {
  const largura = formato === 'feed' ? 1024 : 576;
  const altura = formato === 'feed' ? 1024 : 1024;
  const seed = Math.floor(Math.random() * 999999);
  return `https://image.pollinations.ai/prompt/${codificarPrompt(prompt)}?width=${largura}&height=${altura}&nologo=true&model=${modelo}&seed=${seed}&cacheBust=${Date.now()}`;
}

// ==============================================
// 🚀 FUNÇÃO PRINCIPAL
// ==============================================
export async function montarArte(container, { copiar, toast }, servicoChave, formato, pedidoTexto = '') {
  const servico = SERVICOS[servicoChave];
  const descontos = extrairDescontos(pedidoTexto);
  const entradaLivre = pedidoTexto.length > 40 ? pedidoTexto : '';

  // Define o tema da imagem
  const tema = entradaLivre 
    ? entradaLivre.split('.')[0].substring(0, 60)
    : `${servico.nome} — promoção de estética automotiva`;

  // Gera conteúdo
  const legenda = gerarLegenda(servicoChave, servico, descontos, entradaLivre);
  const prompt = criarPromptImagem(tema, formato);

  // ✅ APENAS 2 MODELOS QUE FUNCIONAM — sem o que falha
  const opcoes = [
    { id: 'flux', nome: 'Padrão', url: gerarUrlImagem(prompt, formato, 'flux') },
    { id: 'turbo', nome: 'Vibrante', url: gerarUrlImagem(prompt, formato, 'turbo') }
  ];

  // Renderização
  container.innerHTML = `
    <div class="bg-sky-50 rounded-xl p-4 border border-sky-100">
      <h4 class="font-semibold text-primary mb-4">🎨 Campanha pronta!</h4>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        ${opcoes.map(op => `
          <div class="bg-white rounded-lg p-3 border-2 border-transparent hover:border-primary transition-all">
            <p class="text-sm font-medium text-slate-600 mb-2">${op.nome}</p>
            <div class="aspect-square bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                src="${op.url}" 
                alt="${op.nome}" 
                class="w-full h-full object-cover transition-opacity duration-700 opacity-0"
                onload="this.classList.remove('opacity-0'); this.parentElement.querySelector('.carregando')?.remove();"
                onerror="this.parentElement.innerHTML='<p class=\\'text-sm text-slate-400 p-6 text-center\\'>Falha ao carregar<br>Tente novamente</p>'"
              >
              <p class="carregando text-sm text-slate-400">Gerando imagem…</p>
            </div>
            <button class="w-full mt-2 bg-primary text-white py-2 rounded-lg text-sm btn-usar" data-url="${op.url}">
              ✅ Usar esta
            </button>
          </div>
        `).join('')}
      </div>

      <div class="space-y-4">
        <div>
          <p class="text-sm font-medium text-slate-700 mb-1">📝 Legenda pronta:</p>
          <textarea id="legenda" class="w-full h-48 bg-white p-3 rounded-lg text-sm border resize-y">${legenda}</textarea>
          <button class="mt-2 bg-primary text-white px-3 py-1 rounded text-sm" id="btnCopiarLegenda">
            <i class="fa fa-copy"></i> Copiar Legenda
          </button>
        </div>

        <div id="caixaEscolhida" class="hidden mt-4 pt-4 border-t border-sky-200">
          <p class="font-semibold text-green-600 mb-2">✅ Imagem selecionada!</p>
          <img id="imgEscolhida" class="max-w-xs rounded-lg shadow-md mb-3" alt="Selecionada">
          <div class="flex flex-wrap gap-2">
            <a id="linkDownload" href="${opcoes[0].url}" download="cleancar-${Date.now()}.jpg" target="_blank" class="bg-accent text-white px-4 py-2 rounded-lg text-sm">
              <i class="fa fa-download"></i> Baixar Imagem
            </a>
            <button id="btnCopiarTudo" class="bg-primary text-white px-4 py-2 rounded-lg text-sm">
              <i class="fa fa-copy"></i> Copiar Legenda
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Copiar legenda
  container.querySelector('#btnCopiarLegenda').addEventListener('click', () => {
    copiar(legenda);
    toast('Legenda copiada! ✅');
  });

  // Escolher imagem
  container.querySelectorAll('.btn-usar').forEach(botao => {
    botao.addEventListener('click', () => {
      const url = botao.dataset.url;
      const caixa = container.querySelector('#caixaEscolhida');
      container.querySelector('#imgEscolhida').src = url;
      container.querySelector('#linkDownload').href = url;
      caixa.classList.remove('hidden');

      // Destaque visual
      container.querySelectorAll('.border-2').forEach(el => el.classList.remove('border-green-500'));
      botao.closest('.border-2').classList.add('border-green-500');

      toast('Prontinho! Baixe e poste 💙🚗✨');
    });
  });

  // Copiar tudo
  container.querySelector('#btnCopiarTudo').addEventListener('click', () => {
    copiar(legenda);
    toast('Legenda copiada! ✅');
  });
}
