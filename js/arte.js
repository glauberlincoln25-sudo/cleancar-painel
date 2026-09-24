import CONFIG from './config.js';

const SITE_FONTE = 'https://clean-car-seo.vercel.app/';

// Dados dos serviços com valores oficiais
const SERVICOS = {
  bronze: { nome: 'Lavagem Bronze', de: 'R$ 85', desc: 'Manutenção rápida, cuidado completo' },
  prata: { nome: 'Lavagem Prata', de: 'R$ 130', desc: 'Experiência completa de estética automotiva' },
  ouro: { nome: 'Lavagem Ouro', de: 'R$ 180', desc: 'Pré-lavagem técnica + produtos Vonixx + higienização' },
  vip: { nome: 'Higienização Interna VIP', de: 'R$ 420', desc: 'Eliminação de odores e bactérias — saúde pra sua família' },
  ducha: { nome: 'Ducha', de: 'R$ 40', desc: 'Rápida, mantém o brilho entre lavagens' },
  farol: { nome: 'Restauração de Farol', de: 'R$ 299', desc: 'Transparência + segurança à noite' },
  vitrificacao: { nome: 'Vitrificação', de: 'R$ 500', desc: 'Proteção de longa duração — até 3 anos' },
  polimento: { nome: 'Polimento Técnico', de: 'R$ 800', desc: 'Correção de riscos + brilho espelhado' }
};

// Identifica o serviço pelo texto
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
  return 'ouro'; // Padrão
}

// Extrai porcentagem de desconto do texto
function extrairDesconto(texto) {
  const m = texto.match(/(\d+)%/);
  return m ? parseInt(m[1]) : null;
}

// Calcula valor com desconto
function aplicarDesconto(valorOriginal, porcentagem) {
  if (!porcentagem) return valorOriginal;
  const numero = parseFloat(valorOriginal.replace(/[^\d,]/g, '').replace(',', '.'));
  const comDesconto = numero * (1 - porcentagem / 100);
  return `R$ ${comDesconto.toFixed(2).replace('.', ',')}`;
}

// Gera texto pronto para postar
function gerarLegenda(chaveServico, dadosServico, desconto, textoExtra = '') {
  const valorExibicao = desconto
    ? `De ${dadosServico.de} → por ${aplicarDesconto(dadosServico.de, desconto)} (${desconto}% OFF)`
    : `Valor: ${dadosServico.de}`;

  let legenda = `${dadosServico.nome}

${dadosServico.desc}

${valorExibicao}

👉 Agende: ${CONFIG.LINK_AGENDAMENTO}

Produtos Vonixx • Mogi das Cruzes
#CleanCar #EsteticaAutomotiva #MogiDasCruzes`;

  if (textoExtra && textoExtra.length > 10) {
    legenda = `${textoExtra}\n\n👉 Agende: ${CONFIG.LINK_AGENDAMENTO}`;
  }

  return legenda;
}

// Gera prompt de imagem
function gerarPromptImagem(chaveServico, dadosServico, formato, desconto, textoExtra = '') {
  const proporcao = formato === 'feed' ? '1:1 quadrada' : '9:16 vertical';
  const valorExibicao = desconto
    ? `${aplicarDesconto(dadosServico.de, desconto)} — ${desconto}% de desconto`
    : dadosServico.de;

  if (textoExtra && textoExtra.length > 15) {
    return `Imagem ${proporcao}, Clean Car estética automotiva. ${textoExtra}. Carro limpo e brilhante, cores azul e branco, estilo profissional, sem texto sobre a imagem.`;
  }

  return `Imagem ${proporcao}, ${dadosServico.nome}, carro limpo e brilhante em estúdio, produtos Vonixx visíveis, fundo azul e branco elegante, iluminação profissional, qualidade fotográfica. Destaque: ${valorExibicao}. Sem texto sobre a imagem.`;
}

// Codifica prompt para URL
function codificarPrompt(texto) {
  return encodeURIComponent(texto.normalize('NFKD').replace(/[^\w\s.,:;!?\-+='"()/]/g, ''))
    .replace(/%20/g, '+');
}

// Gera URL da imagem
function gerarUrlImagem(prompt, formato, modelo) {
  const largura = formato === 'feed' ? 1024 : 576;
  const altura = formato === 'feed' ? 1024 : 1024;
  const promptCodificado = codificarPrompt(prompt);
  const seed = Math.floor(Math.random() * 999999);
  return `https://image.pollinations.ai/prompt/${promptCodificado}?width=${largura}&height=${altura}&nologo=true&model=${modelo}&seed=${seed}&cacheBust=${Date.now()}`;
}

// Função principal — monta tudo e exibe
export async function montarArte(container, { copiar, toast }, servicoChave, formato, pedidoTexto = '') {
  const servico = SERVICOS[servicoChave];
  const desconto = extrairDesconto(pedidoTexto);
  const textoExtra = pedidoTexto.length > 20 && !pedidoTexto.includes(servico.nome) ? pedidoTexto : '';

  // Gera conteúdo
  const legenda = gerarLegenda(servicoChave, servico, desconto, textoExtra);
  const prompt = gerarPromptImagem(servicoChave, servico, formato, desconto, textoExtra);
  const urlFlux = gerarUrlImagem(prompt, formato, 'flux');
  const urlTurbo = gerarUrlImagem(prompt, formato, 'turbo');

  // Renderiza na tela
  container.innerHTML = `
    <div class="bg-sky-50 rounded-xl p-4 border border-sky-100">
      <h4 class="font-semibold text-primary mb-4">🎨 Duas opções — escolha a melhor!</h4>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <!-- Opção 1: Flux -->
        <div class="bg-white rounded-lg p-3 border-2 border-transparent hover:border-primary transition-all">
          <p class="text-sm font-medium text-slate-600 mb-2">Opção 1 — Detalhada</p>
          <div class="aspect-square bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
            <img src="${urlFlux}" alt="Opção 1" class="w-full h-full object-cover" loading="lazy"
              onload="this.style.opacity=1; this.nextElementSibling?.remove();"
              onerror="this.parentElement.innerHTML='<p class=\\'text-sm text-slate-400 p-4 text-center\\'>Falha ao carregar. Tente novamente.</p>'">
            <p class="text-sm text-slate-400">Carregando…</p>
          </div>
          <button class="w-full mt-2 bg-primary text-white py-2 rounded-lg text-sm btn-usar" data-url="${urlFlux}">
            ✅ Usar esta
          </button>
        </div>

        <!-- Opção 2: Turbo -->
        <div class="bg-white rounded-lg p-3 border-2 border-transparent hover:border-secondary transition-all">
          <p class="text-sm font-medium text-slate-600 mb-2">Opção 2 — Rápida e Vibrante</p>
          <div class="aspect-square bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
            <img src="${urlTurbo}" alt="Opção 2" class="w-full h-full object-cover" loading="lazy"
              onload="this.style.opacity=1; this.nextElementSibling?.remove();"
              onerror="this.parentElement.innerHTML='<p class=\\'text-sm text-slate-400 p-4 text-center\\'>Falha ao carregar. Tente novamente.</p>'">
            <p class="text-sm text-slate-400">Carregando…</p>
          </div>
          <button class="w-full mt-2 bg-secondary text-white py-2 rounded-lg text-sm btn-usar" data-url="${urlTurbo}">
            ✅ Usar esta
          </button>
        </div>
      </div>

      <div class="space-y-4">
        <!-- Legenda -->
        <div>
          <p class="text-sm font-medium text-slate-700 mb-1">📝 Legenda pronta:</p>
          <textarea id="textoLegenda" class="w-full h-36 bg-white p-3 rounded-lg text-sm border">${legenda}</textarea>
          <button class="mt-2 bg-primary text-white px-3 py-1 rounded text-sm" id="copiarLegenda">
            <i class="fa fa-copy"></i> Copiar Legenda
          </button>
        </div>

        <!-- Prompt -->
        <div>
          <p class="text-sm font-medium text-slate-700 mb-1">💡 Prompt usado:</p>
          <textarea class="w-full h-24 bg-white p-3 rounded-lg text-sm border text-slate-500" readonly>${prompt}</textarea>
        </div>

        <!-- Área após escolha -->
        <div id="escolhida" class="hidden mt-4 pt-4 border-t border-sky-200">
          <p class="font-semibold text-green-600 mb-2">✅ Imagem selecionada!</p>
          <img id="imgEscolhida" class="max-w-xs rounded-lg shadow-md mb-3" alt="Selecionada">
          <div class="flex flex-wrap gap-2">
            <a id="linkDownload" href="${urlFlux}" download="cleancar-${servicoChave}-${formato}.jpg" target="_blank" class="bg-accent text-white px-4 py-2 rounded-lg text-sm">
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

  // Ação: Copiar legenda
  container.querySelector('#copiarLegenda').addEventListener('click', () => {
    copiar(legenda);
    toast('Legenda copiada! ✅');
  });

  // Ação: Escolher imagem
  container.querySelectorAll('.btn-usar').forEach(botao => {
    botao.addEventListener('click', () => {
      const url = botao.dataset.url;
      const caixa = container.querySelector('#escolhida');
      const img = container.querySelector('#imgEscolhida');
      const link = container.querySelector('#linkDownload');

      img.src = url;
      link.href = url;
      caixa.classList.remove('hidden');

      // Destaque visual
      container.querySelectorAll('.border-2').forEach(el => {
        el.classList.remove('border-green-500');
        el.classList.add('border-transparent');
      });
      botao.closest('.border-2').classList.remove('border-transparent');
      botao.closest('.border-2').classList.add('border-green-500');

      toast('Imagem pronta! ✅ Baixe e poste 💙🚗✨');
    });
  });

  // Ação: Copiar tudo
  container.querySelector('#copiarTudo').addEventListener('click', () => {
    copiar(legenda);
    toast('Legenda copiada! ✅');
  });
}
