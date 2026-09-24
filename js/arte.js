import CONFIG from './config.js';

const SITE_FONTE = 'https://clean-car-seo.vercel.app/';
let cacheServicos = null;

async function carregarServicosDoSite() {
  if (cacheServicos) return cacheServicos;
  
  cacheServicos = {
    prata: { nome: 'Lavagem Prata', de: 'R$ 130', desc: 'Experiência completa de estética automotiva', duracao: 'Manutenção regular' },
    ouro: { nome: 'Lavagem Ouro', de: 'R$ 180', desc: 'Pré-lavagem, produtos Vonixx, higienização inclusa', duracao: 'Cuidado completo' },
    vip: { nome: 'Higienização Interna VIP', de: 'R$ 420', desc: 'Eliminação de odores, bactérias, saúde para a família', duracao: 'Renovação profunda' }
  };
  return cacheServicos;
}

export function achaServico(texto) {
  const m = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (m.includes('prata')) return 'prata';
  if (m.includes('ouro')) return 'ouro';
  if (m.includes('higieniz') || m.includes('vip') || m.includes('interna')) return 'vip';
  return 'ouro';
}

function calcularDesconto(valorOriginal, porcentagem = 15) {
  const num = parseFloat(valorOriginal.replace(/\D/g, '')) / 100;
  const desconto = num * (1 - porcentagem / 100);
  return `R$ ${desconto.toFixed(2).replace('.', ',')}`;
}

function extrairDesconto(texto) {
  const m = texto.match(/(\d+)%/);
  return m ? parseInt(m[1]) : 15;
}

function geraTextoServico(chave, servico, descontoPct = null) {
  const valorOriginal = servico.de;
  const valorComDesconto = descontoPct 
    ? calcularDesconto(valorOriginal, descontoPct)
    : valorOriginal;
  
  const etiquetaDesconto = descontoPct 
    ? `(${descontoPct}% OFF)` 
    : '';

  return `${servico.nome} ${etiquetaDesconto}

${servico.desc}

${descontoPct ? `De ${valorOriginal} → por ${valorComDesconto}` : `Valor: ${valorOriginal}`}

👉 Agende: ${CONFIG.LINK_AGENDAMENTO}

Produtos Vonixx • Mogi das Cruzes
#CleanCar #EsteticaAutomotiva #MogiDasCruzes`;
}

function geraPromptImagem(pedido, servico, formato, descontoPct = null) {
  const proporcao = formato === 'feed' ? 'quadrada 1:1' : 'vertical 9:16';
  const valorExibicao = descontoPct 
    ? `${calcularDesconto(servico.de, descontoPct)} (${descontoPct}% OFF)` 
    : servico.de;

  let descricao = pedido;
  if (pedido.length < 20 || pedido.includes(servico.nome)) {
    descricao = `Arte profissional Clean Car — ${servico.nome}, carro brilhante e limpo, produtos Vonixx visíveis, fundo elegante azul e branco, iluminação profissional, qualidade fotográfica, sem texto sobre a imagem`;
  }
  
  return `Imagem ${proporcao}, ${descricao}. Destaque: ${servico.nome} — ${valorExibicao}. Cores azul ciano, branco e detalhes verde. Estilo limpo, moderno e confiável. Fonte: ${SITE_FONTE}`;
}

function codificaPrompt(texto) {
  return encodeURIComponent(texto.normalize('NFKD').replace(/[^\w\s.,:;!?\-+='"()/]/g, ''))
    .replace(/%20/g, '+');
}

function geraUrlImagem(prompt, formato, modelo) {
  const largura = formato === 'feed' ? 1024 : 576;
  const altura = formato === 'feed' ? 1024 : 1024;
  const promptCodificado = codificaPrompt(prompt);
  const seed = Math.floor(Math.random() * 999999);
  return `https://image.pollinations.ai/prompt/${promptCodificado}?width=${largura}&height=${altura}&nologo=true&model=${modelo}&seed=${seed}&cacheBust=${Date.now()}`;
}

export async function montarArte(container, { copiar, toast }, servicoChave, formato, pedidoTexto = '') {
  const servicos = await carregarServicosDoSite();
  const servico = servicos[servicoChave];
  const desconto = extrairDesconto(pedidoTexto);
  const temDesconto = pedidoTexto.includes('%') || pedidoTexto.toLowerCase().includes('desconto');

  const textoFinal = geraTextoServico(
    servicoChave, 
    servico, 
    temDesconto ? desconto : null
  );
  
  const promptCompleto = geraPromptImagem(
    pedidoTexto || servico.nome, 
    servicoChave, 
    formato,
    temDesconto ? desconto : null
  );

  const urlImagem1 = geraUrlImagem(promptCompleto, formato, 'flux');
  const urlImagem2 = geraUrlImagem(promptCompleto, formato, 'turbo');

  container.innerHTML = `
    <div class="bg-sky-50 rounded-xl p-4 border border-sky-100">
      <div class="flex justify-between items-center mb-4">
        <h4 class="font-semibold text-primary">🎨 Duas opções — escolha a melhor!</h4>
        <span class="text-xs text-slate-400">Fonte: site oficial</span>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <!-- Opção 1 -->
        <div class="bg-white rounded-lg p-3 border-2 border-transparent hover:border-primary transition-all">
          <p class="text-sm font-medium text-slate-600 mb-2">Opção 1 — Detalhada</p>
          <div class="aspect-square bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
            <img src="${urlImagem1}" alt="Opção 1" class="w-full h-full object-cover" loading="lazy"
              onload="this.parentElement.classList.remove('bg-slate-100'); this.nextElementSibling?.remove()"
              onerror="this.style.display='none'; this.parentElement.innerHTML='<p class=\\'text-sm text-slate-400 p-4 text-center\\'>Tente novamente em instantes</p>'">
            <p class="text-sm text-slate-400">Carregando…</p>
          </div>
          <button class="w-full mt-2 bg-primary text-white py-2 rounded-lg text-sm btn-usar-imagem" data-url="${urlImagem1}" data-formato="${formato}">
            ✅ Usar esta
          </button>
        </div>

        <!-- Opção 2 -->
        <div class="bg-white rounded-lg p-3 border-2 border-transparent hover:border-secondary transition-all">
          <p class="text-sm font-medium text-slate-600 mb-2">Opção 2 — Rápida e Vibrante</p>
          <div class="aspect-square bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
            <img src="${urlImagem2}" alt="Opção 2" class="w-full h-full object-cover" loading="lazy"
              onload="this.parentElement.classList.remove('bg-slate-100'); this.nextElementSibling?.remove()"
              onerror="this.style.display='none'; this.parentElement.innerHTML='<p class=\\'text-sm text-slate-400 p-4 text-center\\'>Tente novamente em instantes</p>'">
            <p class="text-sm text-slate-400">Carregando…</p>
          </div>
          <button class="w-full mt-2 bg-secondary text-white py-2 rounded-lg text-sm btn-usar-imagem" data-url="${urlImagem2}" data-formato="${formato}">
            ✅ Usar esta
          </button>
        </div>
      </div>

      <div class="space-y-4">
        <div>
          <p class="text-sm font-medium text-slate-700 mb-1">📝 Texto para legenda:</p>
          <textarea id="textoArte" class="w-full h-36 bg-white p-3 rounded-lg text-sm border" readonly>${textoFinal}</textarea>
          <button class="mt-2 bg-primary text-white px-3 py-1 rounded text-sm" id="copiarTextoArte">
            <i class="fa fa-copy"></i> Copiar Texto
          </button>
        </div>
        
        <div>
          <p class="text-sm font-medium text-slate-700 mb-1">💡 Prompt usado:</p>
          <textarea class="w-full h-24 bg-white p-3 rounded-lg text-sm border text-slate-500" readonly>${promptCompleto}</textarea>
        </div>

        <div id="caixaEscolhida" class="hidden mt-4 pt-4 border-t border-sky-200">
          <p class="font-semibold text-green-600 mb-2">✅ Imagem escolhida!</p>
          <img id="imagemEscolhida" class="max-w-xs rounded-lg shadow-md mb-3" alt="Imagem selecionada">
          <div class="flex flex-wrap gap-2">
            <a id="linkDownload" href="${urlImagem1}" download="cleancar-${servicoChave}-${Date.now()}.jpg" target="_blank" class="bg-accent text-white px-4 py-2 rounded-lg text-sm">
              <i class="fa fa-download"></i> Baixar Imagem
            </a>
            <button id="copiarTextoFinal" class="bg-primary text-white px-4 py-2 rounded-lg text-sm">
              <i class="fa fa-copy"></i> Copiar Texto
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#copiarTextoArte').addEventListener('click', () => {
    copiar(textoFinal);
    toast('Texto copiado! ✅');
  });

  container.querySelectorAll('.btn-usar-imagem').forEach(botao => {
    botao.addEventListener('click', () => {
      const url = botao.dataset.url;
      const caixa = container.querySelector('#caixaEscolhida');
      const img = container.querySelector('#imagemEscolhida');
      const link = container.querySelector('#linkDownload');
      
      img.src = url;
      link.href = url;
      caixa.classList.remove('hidden');
      
      container.querySelectorAll('.border-2').forEach(bloco => {
        bloco.classList.remove('border-green-500');
        bloco.classList.add('border-transparent');
      });
      botao.closest('.border-2').classList.remove('border-transparent');
      botao.closest('.border-2').classList.add('border-green-500');
      
      toast('Imagem pronta! ✅ Baixe e poste 💙🚗✨');
    });
  });

  container.querySelector('#copiarTextoFinal').addEventListener('click', () => {
    copiar(textoFinal);
    toast('Texto copiado! ✅');
  });
}
