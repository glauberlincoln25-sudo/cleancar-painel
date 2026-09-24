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

function geraPromptImagemPersonalizado(pedido, servico, formato) {
  const proporcao = formato === 'feed' ? 'quadrada 1:1' : 'vertical 9:16';
  const s = SERVICOS[servico];
  
  // Se o pedido tiver detalhes específicos, usa eles
  let detalhes = pedido;
  if (pedido.length < 15 || pedido.includes(s.nome)) {
    detalhes = `Arte profissional Clean Car — ${s.nome}, ${CAMPANHA}, carro brilhante e limpo, produtos Vonixx, fundo azul e branco, logo visível`;
  }
  
  return `Imagem ${proporcao}, ${detalhes}. Destaque: ${s.nome} — ${s.por} (15% OFF). Link: ${CONFIG.LINK_AGENDAMENTO}`;
}

export function montarArte(container, { copiar, toast }, servicoChave, formato, pedidoTexto = '') {
  const servico = SERVICOS[servicoChave];
  
  // Usa o texto do pedido se foi fornecido, senão usa o padrão
  const textoFinal = pedidoTexto && pedidoTexto.length > 5 
    ? pedidoTexto 
    : geraTextoServico(servicoChave);
  
  const promptImagem = geraPromptImagemPersonalizado(pedidoTexto || textoFinal, servicoChave, formato);

  container.innerHTML = `
    <div class="bg-sky-50 rounded-xl p-4 border border-sky-100">
      <h4 class="font-semibold text-primary mb-3">🎨 Arte — ${servico.nome}</h4>
      
      <div class="bg-white rounded-lg p-4 mb-4 text-center">
        <p class="text-sm text-slate-500 mb-2">Visualização da estrutura:</p>
        <div class="space-y-2">
          <p class="font-bold text-lg text-cleandark">${CAMPANHA}</p>
          <p class="font-semibold text-accent">${servico.nome}</p>
          <p class="text-2xl font-bold text-primary">${servico.por}</p>
          <p class="text-xs text-slate-400 line-through">De ${servico.de}</p>
          <ul class="text-sm text-slate-600 mt-2 space-y-1">
            ${servico.itens.map(i => `<li>✓ ${i}</li>`).join('')}
          </ul>
          <a href="${CONFIG.LINK_AGENDAMENTO}" target="_blank" class="inline-block mt-3 bg-secondary text-white px-4 py-2 rounded-full text-sm font-semibold">
            Agendar <i class="fa fa-external-link ml-1"></i>
          </a>
        </div>
      </div>
      
      <div class="space-y-3">
        <div>
          <p class="text-sm font-medium text-slate-700 mb-1">📝 Texto para legenda:</p>
          <textarea class="w-full h-32 bg-white p-3 rounded-lg text-sm border" readonly>${textoFinal}</textarea>
          <button class="mt-2 bg-primary text-white px-3 py-1 rounded text-sm" id="copiarTextoArte">
            <i class="fa fa-copy"></i> Copiar Texto
          </button>
        </div>
        
        <div>
          <p class="text-sm font-medium text-slate-700 mb-1">🖼️ Prompt de imagem (${formato}):</p>
          <textarea class="w-full h-32 bg-white p-3 rounded-lg text-sm border" readonly>${promptImagem}</textarea>
          <button class="mt-2 bg-accent text-white px-3 py-1 rounded text-sm" id="copiarPromptArte">
            <i class="fa fa-copy"></i> Copiar Prompt
          </button>
        </div>
      </div>
    </div>
  `;

  // Eventos de cópia
  container.querySelector('#copiarTextoArte').addEventListener('click', () => {
    copiar(textoFinal);
    toast('Texto copiado! ✅');
  });
  
  container.querySelector('#copiarPromptArte').addEventListener('click', () => {
    copiar(promptImagem);
    toast('Prompt copiado! ✅');
  });
}
