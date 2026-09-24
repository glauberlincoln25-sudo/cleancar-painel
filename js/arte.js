import CONFIG from './config.js';

const CAMPANHA = 'OUTUBRO · 15% OFF';
export const SERVICOS = {
  prata: { nome: 'Lavagem Prata', de: 'R$ 130', por: 'R$ 110,50', itens: ['Limpeza completa', 'Brilho profissional'] },
  ouro: { nome: 'Lavagem Ouro', de: 'R$ 180', por: 'R$ 153', itens: ['Pré-lavagem', 'Produtos Vonixx', 'Higienização inclusa'] },
  vip: { nome: 'Higienização VIP', de: 'R$ 420', por: 'R$ 357', itens: ['Elimina odores', 'Elimina bactérias', 'Saúde pra família'] }
};

export function achaServico(texto) {
  const m = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (m.includes('prata')) return 'prata';
  if (m.includes('ouro')) return 'ouro';
  if (m.includes('higieniz') || m.includes('vip')) return 'vip';
  return 'ouro';
}

function geraTextoServico(chave) {
  const s = SERVICOS[chave];
  return `${s.nome}\nDe ${s.de} → ${s.por}\n\n${s.itens.join('\n')}\n\n👉 Agende: ${CONFIG.LINK_AGENDAMENTO}`;
}

function geraPromptImagem(pedido, servico, formato) {
  const proporcao = formato === 'feed' ? 'quadrada 1:1' : 'vertical 9:16';
  const s = SERVICOS[servico];
  
  let descricao = pedido;
  if (pedido.length < 15 || pedido.includes(s.nome)) {
    descricao = `Arte profissional Clean Car — ${s.nome}, ${CAMPANHA}, carro brilhante e limpo, produtos Vonixx, fundo azul e branco, logo visível, iluminação profissional, alta qualidade`;
  }
  
  return `Imagem ${proporcao}, ${descricao}. Destaque: ${s.nome} — ${s.por} (15% OFF). Fundo elegante azul e branco, estilo profissional.`;
}

function codificaPrompt(texto) {
  return encodeURIComponent(texto).replace(/%20/g, '+');
}

function geraUrlImagem(prompt, formato, modelo) {
  const largura = formato === 'feed' ? 1024 : 576;
  const altura = formato === 'feed' ? 1024 : 1024;
  const promptCodificado = codificaPrompt(prompt);
  return `https://image.pollinations.ai/prompt/${promptCodificado}?width=${largura}&height=${altura}&nologo=true&model=${modelo}&seed=${Math.floor(Math.random() * 999999)}`;
}

export function montarArte(container, { copiar, toast }, servicoChave, formato, pedidoTexto = '') {
  const servico = SERVICOS[servicoChave];
  const textoFinal = pedidoTexto && pedidoTexto.length > 5 
    ? pedidoTexto 
    : geraTextoServico(servicoChave);
  
  const promptBase = geraPromptImagem(pedidoTexto || textoFinal, servicoChave, formato);
  const promptCompleto = `${promptBase} — Clean Car estética automotiva, Mogi das Cruzes, qualidade fotográfica`;

  const urlImagem1 = geraUrlImagem(promptCompleto, formato, 'flux');
  const urlImagem2 = geraUrlImagem(promptCompleto, formato, 'turbo');

  container.innerHTML = `
    <div class="bg-sky-50 rounded-xl p-4 border border-sky-100">
      <h4 class="font-semibold text-primary mb-4">🎨 Duas opções — escolha a melhor!</h4>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <!-- Opção 1 -->
        <div class="bg-white rounded-lg p-3 border-2 border-transparent hover:border-primary transition-all cursor-pointer opcao-imagem" data-url="${urlImagem1}" data-id="1">
          <p class="text-sm font-medium text-slate-600 mb-2">Opção 1 — Detalhada</p>
          <div class="aspect-square bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
            <img src="${urlImagem1}" alt="Opção 1" class="w-full h-full object-cover" loading="lazy" onload="this.parentElement.classList.remove('bg-slate-100')" onerror="this.parentElement.innerHTML='<p class=\\'text-sm text-slate-400\\'>Não carregou</p>'">
          </div>
          <button class="w-full mt-2 bg-primary text-white py-2 rounded-lg text-sm btn-usar-imagem" data-url="${urlImagem1}" data-formato="${formato}">
            ✅ Usar esta
          </button>
        </div>

        <!-- Opção 2 -->
        <div class="bg-white rounded-lg p-3 border-2 border-transparent hover:border-secondary transition-all cursor-pointer opcao-imagem" data-url="${urlImagem2}" data-id="2">
          <p class="text-sm font-medium text-slate-600 mb-2">Opção 2 — Rápida e Vibrante</p>
          <div class="aspect-square bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
            <img src="${urlImagem2}" alt="Opção 2" class="w-full h-full object-cover" loading="lazy" onload="this.parentElement.classList.remove('bg-slate-100')" onerror="this.parentElement.innerHTML='<p class=\\'text-sm text-slate-400\\'>Não carregou</p>'">
          </div>
          <button class="w-full mt-2 bg-secondary text-white py-2 rounded-lg text-sm btn-usar-imagem" data-url="${urlImagem2}" data-formato="${formato}">
            ✅ Usar esta
          </button>
        </div>
      </div>

      <!-- Área de texto e prompt -->
      <div class="space-y-4">
        <div>
          <p class="text-sm font-medium text-slate-700 mb-1">📝 Texto para legenda:</p>
          <textarea id="textoArte" class="w-full h-32 bg-white p-3 rounded-lg text-sm border" readonly>${textoFinal}</textarea>
          <button class="mt-2 bg-primary text-white px-3 py-1 rounded text-sm" id="copiarTextoArte">
            <i class="fa fa-copy"></i> Copiar Texto
          </button>
        </div>
        
        <div>
          <p class="text-sm font-medium text-slate-700 mb-1">💡 Prompt usado:</p>
          <textarea class="w-full h-24 bg-white p-3 rounded-lg text-sm border text-slate-500" readonly>${promptCompleto}</textarea>
        </div>

        <!-- Imagem escolhida -->
        <div id="caixaEscolhida" class="hidden mt-4 pt-4 border-t border-sky-200">
          <p class="font-semibold text-green-600 mb-2">✅ Imagem escolhida!</p>
          <img id="imagemEscolhida" class="max-w-xs rounded-lg shadow-md mb-3" alt="Imagem selecionada">
          <div class="flex flex-wrap gap-2">
            <a id="linkDownload" href="${urlImagem1}" download="cleancar-${formato}-${Date.now()}.jpg" target="_blank" class="bg-accent text-white px-4 py-2 rounded-lg text-sm">
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

  // Eventos
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
      
      // Destaque da escolhida
      container.querySelectorAll('.opcao-imagem').forEach(bloco => {
        bloco.classList.remove('border-primary', 'border-secondary');
        bloco.classList.add('border-transparent');
      });
      botao.closest('.opcao-imagem').classList.remove('border-transparent');
      botao.closest('.opcao-imagem').classList.add('border-green-500');
      
      toast('Imagem selecionada! ✅ Baixe e poste 💙');
    });
  });

  container.querySelector('#copiarTextoFinal').addEventListener('click', () => {
    copiar(textoFinal);
    toast('Texto copiado! ✅');
  });
}
