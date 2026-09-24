import CONFIG from './config.js';

// ─────────────────────────────────────────────
// 🎨 IDENTIDADE VISUAL — BASEADA NOS SEUS EXEMPLOS
// ──────────────────────────────────────────────
const ESTILO_PADRAO = {
  paleta: 'fundo escuro/preto + faixas verde vibrante + branco + detalhes vermelho/laranja',
  layout: 'cabeçalho chamativo → área de imagem limpa → serviços em blocos → rodapé com CTA',
  fontes: 'negrito, sans-serif, letras grandes para títulos, valores em destaque',
  composicao: 'imagem de fundo sutil — carro limpo, brilhante, estúdio profissional, SEM texto sobre a foto',
  elementosChave: [
    'faixa superior com título grande e chamativo',
    'valor com desconto em destaque',
    'lista de serviços organizada',
    'link de agendamento visível',
    'Produtos Vonixx • Mogi das Cruzes'
  ]
};

// ──────────────────────────────────────────────
// 📋 DADOS OFICIAIS DO SITE
// ──────────────────────────────────────────────
const SERVICOS = {
  bronze: { nome: 'Lavagem Bronze', valor: 'R$ 85', desc: 'Manutenção rápida, cuidado completo' },
  prata: { nome: 'Lavagem Prata', valor: 'R$ 130', desc: 'Experiência completa de estética automotiva' },
  ouro: { nome: 'Lavagem Ouro', valor: 'R$ 180', desc: 'Pré-lavagem técnica + Vonixx + higienização' },
  vip: { nome: 'Higienização Interna VIP', valor: 'R$ 420', desc: 'Saúde e conforto para toda a família' },
  ducha: { nome: 'Ducha', valor: 'R$ 40', desc: 'Rápida, mantém o brilho' },
  farol: { nome: 'Restauração de Farol', valor: 'R$ 299', desc: 'Transparência + segurança à noite' },
  vitrificacao: { nome: 'Vitrificação', valor: 'R$ 500', desc: 'Proteção — até 3 anos de brilho' },
  polimento: { nome: 'Polimento Técnico', valor: 'R$ 800', desc: 'Correção de riscos + brilho espelhado' }
};

// ──────────────────────────────────────────────
// 🔧 Funções auxiliares
// ──────────────────────────────────────────────
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
  return 'ouro';
}

function extrairDesconto(texto) {
  const m = texto.match(/(\d+)%/);
  return m ? parseInt(m[1]) : null;
}

function calcularValorComDesconto(valorBase, porcentagem) {
  if (!porcentagem) return valorBase;
  const num = parseFloat(valorBase.replace(',', '.'));
  const comDesconto = num * (1 - porcentagem / 100);
  return `R$ ${comDesconto.toFixed(2).replace('.', ',')}`;
}

// ──────────────────────────────────────────────
// ✍️ GERA TEXTO NO ESTILO DE CAMPANHA
// ──────────────────────────────────────────────
function gerarCampanha(chaveServico, servico, desconto, entradaUsuario = '') {
  const valorComDesconto = desconto
    ? calcularValorComDesconto(servico.valor, desconto)
    : servico.valor;

  if (entradaUsuario.length > 20) {
    return `${entradaUsuario}

👉 Agende: ${CONFIG.LINK_AGENDAMENTO}

Produtos Vonixx • Mogi das Cruzes
#CleanCar #EsteticaAutomotiva #MogiDasCruzes`;
  }

  return `🔥 PROMOÇÃO CLEAN CAR 🔥

${servico.nome}

${servico.desc}

${desconto
  ? `DE ${servico.valor} → POR ${valorComDesconto}
✅ ${desconto}% DE DESCONTO!`
  : `A partir de ${servico.valor}`}

✅ Produtos Vonixx
✅ Atendimento profissional
✅ Estúdio em Mogi das Cruzes

👉 Agende agora:
${CONFIG.LINK_AGENDAMENTO}

#CleanCar #Promoção #EsteticaAutomotiva #MogiDasCruzes`;
}

// ──────────────────────────────────────────────
// 🖼️ GERA PROMPT DE IMAGEM — ALINHADO COM SEU ESTILO
// ──────────────────────────────────────────────
function gerarPromptImagem(chaveServico, servico, formato, desconto, entradaUsuario = '') {
  const proporcao = formato === 'feed' ? 'quadrada 1:1' : 'vertical 9:16';
  const tema = entradaUsuario.length > 15
    ? entradaUsuario.split('.')[0]
    : `${servico.nome} — estética automotiva profissional`;

  return `Imagem ${proporcao}, estilo campanha profissional Clean Car.
Fundo escuro elegante, faixas verde vibrante e branco no topo e base.
Centro: imagem de um carro limpo e brilhante em estúdio, iluminação profissional, qualidade fotográfica, sem deformação.
${tema}.
SEM TEXTO SOBRE A IMAGEM — área limpa para texto.
Cores: verde, branco, preto, detalhes azul.
Estilo limpo, moderno, chamativo e confiável — igual a campanha de promoção de estética automotiva.`;
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

// ──────────────────────────────────────────────
// 🚀 FUNÇÃO PRINCIPAL
// ──────────────────────────────────────────────
export async function montarArte(container, { copiar, toast }, servicoChave, formato, pedidoTexto = '') {
  const servico = SERVICOS[servicoChave];
  const desconto = extrairDesconto(pedidoTexto);
  const entradaLivre = pedidoTexto.length > 20 ? pedidoTexto : '';

  // Texto de campanha
  const textoCampanha = gerarCampanha(servicoChave, servico, desconto, entradaLivre);
  
  // Prompt de imagem com identidade
  const promptImagem = gerarPromptImagem(servicoChave, servico, formato, desconto, entradaLivre);
  
  // Gera 3 versões com modelos diferentes para escolha
  const urls = [
    { nome: 'Padrão', url: gerarUrlImagem(promptImagem, formato, 'flux') },
    { nome: 'Vibrante', url: gerarUrlImagem(promptImagem, formato, 'turbo') },
    { nome: 'Elegante', url: gerarUrlImagem(promptImagem, formato, 'dall-e-3') }
  ];

  // Renderiza
  container.innerHTML = `
    <div class="bg-sky-50 rounded-xl p-4 border border-sky-100">
      <h4 class="font-semibold text-primary mb-4">🎨 Campanha pronta — 3 opções de imagem!</h4>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        ${urls.map((op, i) => `
          <div class="bg-white rounded-lg p-3 border-2 border-transparent hover:border-primary transition-all">
            <p class="text-sm font-medium text-slate-600 mb-2">Opção ${i+1} — ${op.nome}</p>
            <div class="aspect-square bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
              <img src="${op.url}" alt="Opção ${i+1}" class="w-full h-full object-cover" loading="lazy"
                onload="this.style.opacity=1; this.nextElementSibling?.remove();"
                onerror="this.parentElement.innerHTML='<p class=\\'text-sm text-slate-400 p-4 text-center\\'>Tente novamente</p>'">
              <p class="text-sm text-slate-400">Carregando…</p>
            </div>
            <button class="w-full mt-2 bg-primary text-white py-2 rounded-lg text-sm btn-escolher" data-url="${op.url}">
              ✅ Usar esta
            </button>
          </div>
        `).join('')}
      </div>

      <div class="space-y-4">
        <div>
          <p class="text-sm font-medium text-slate-700 mb-1">📝 Legenda pronta para postar:</p>
          <textarea id="textoCampanha" class="w-full h-44 bg-white p-3 rounded-lg text-sm border">${textoCampanha}</textarea>
          <button class="mt-2 bg-primary text-white px-3 py-1 rounded text-sm" id="copiarTexto">
            <i class="fa fa-copy"></i> Copiar Legenda
          </button>
        </div>

        <div id="caixaEscolhida" class="hidden mt-4 pt-4 border-t border-sky-200">
          <p class="font-semibold text-green-600 mb-2">✅ Imagem selecionada!</p>
          <img id="imgEscolhida" class="max-w-xs rounded-lg shadow-md mb-3" alt="Selecionada">
          <div class="flex flex-wrap gap-2">
            <a id="linkDownload" href="${urls[0].url}" download="cleancar-${servicoChave}-${formato}.jpg" target="_blank" class="bg-accent text-white px-4 py-2 rounded-lg text-sm">
              <i class="fa fa-download"></i> Baixar Imagem
            </a>
            <button id="copiarTudo" class="bg-primary text-white px-4 py-2 rounded-lg text-sm">
              <i class="fa fa-copy"></i> Copiar Legenda
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Copiar legenda
  container.querySelector('#copiarTexto').addEventListener('click', () => {
    copiar(textoCampanha);
    toast('Legenda copiada! ✅');
  });

  // Escolher imagem
  container.querySelectorAll('.btn-escolher').forEach(botao => {
    botao.addEventListener('click', () => {
      const url = botao.dataset.url;
      const caixa = container.querySelector('#caixaEscolhida');
      container.querySelector('#imgEscolhida').src = url;
      container.querySelector('#linkDownload').href = url;
      caixa.classList.remove('hidden');

      // Destaque visual
      container.querySelectorAll('.border-2').forEach(el => el.classList.remove('border-green-500'));
      botao.closest('.border-2').classList.add('border-green-500');

      toast('Prontinho! ✅ Baixe e poste 💙🚗✨');
    });
  });

  // Copiar tudo
  container.querySelector('#copiarTudo').addEventListener('click', () => {
    copiar(textoCampanha);
    toast('Legenda copiada! ✅');
  });
}
