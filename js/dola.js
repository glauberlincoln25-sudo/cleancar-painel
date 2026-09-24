import CONFIG from './config.js';

// ==============================================
// 📋 BASE DE CONHECIMENTO — Clean Car
// ==============================================
const DADOS = {
  servicos: {
    bronze: { nome: 'Lavagem Bronze', valor: 'R$ 85', desc: 'Manutenção rápida, cuidado completo' },
    prata: { nome: 'Lavagem Prata', valor: 'R$ 130', desc: 'Estética completa para seu carro' },
    ouro: { nome: 'Lavagem Ouro', valor: 'R$ 180', desc: 'Pré-lavagem + Vonixx + higienização' },
    vip: { nome: 'Higienização Interna VIP', valor: 'R$ 420', desc: 'Saúde e conforto para toda a família' },
    ducha: { nome: 'Ducha', valor: 'R$ 40', desc: 'Rápida, mantém o brilho' },
    farol: { nome: 'Restauração de Farol', valor: 'R$ 299', desc: 'Transparência + segurança à noite' },
    vitrificacao: { nome: 'Vitrificação', valor: 'R$ 500', desc: 'Proteção de até 3 anos' },
    polimento: { nome: 'Polimento Técnico', valor: 'R$ 800', desc: 'Correção de riscos + brilho espelhado' }
  },
  linkAgendamento: CONFIG.LINK_AGENDAMENTO,
  local: 'Mogi das Cruzes — atende Alto Tietê',
  produtos: 'Vonixx',
  instagram: '@cleancar_est26'
};

// ==============================================
// 🔧 Funções auxiliares
// ==============================================
function calcularDesconto(valor, porcentagem) {
  if (!porcentagem) return valor;
  const num = parseFloat(valor.replace(',', '.'));
  const comDesconto = num * (1 - porcentagem / 100);
  return `R$ ${comDesconto.toFixed(2).replace('.', ',')}`;
}

function extrairDesconto(texto) {
  const m = texto.match(/(\d+)%/);
  return m ? parseInt(m[1]) : null;
}

function identificarServico(texto) {
  const m = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (m.includes('bronze')) return 'bronze';
  if (m.includes('prata')) return 'prata';
  if (m.includes('ouro')) return 'ouro';
  if ((m.includes('higieniz') || m.includes('vip') || m.includes('interna')) && !m.includes('banco')) return 'vip';
  if (m.includes('ducha')) return 'ducha';
  if (m.includes('farol')) return 'farol';
  if (m.includes('vitrific')) return 'vitrificacao';
  if (m.includes('polimento')) return 'polimento';
  return null;
}

// ==============================================
// ✍️ GERADOR DE RESPOSTAS — Inteligente sem chave
// ==============================================
function gerarResposta(textoUsuario) {
  const desconto = extrairDesconto(textoUsuario);
  const servicoChave = identificarServico(textoUsuario);

  // Se tem serviço + desconto → gera campanha pronta
  if (servicoChave && desconto) {
    const s = DADOS.servicos[servicoChave];
    const valorComDesconto = calcularDesconto(s.valor, desconto);
    
    return `🔥 PROMOÇÃO EXCLUSIVA — ${desconto}% DE DESCONTO! 🔥

${s.nome}

${s.desc}

DE ${s.valor}
→ POR ${valorComDesconto}
✅ ${desconto}% DE ECONOMIA!

✅ Produtos ${DADOS.produtos}
✅ Atendimento profissional
✅ ${DADOS.local}

👉 Agende agora:
${DADOS.linkAgendamento}

#CleanCar #Promoção #EsteticaAutomotiva #MogiDasCruzes`;
  }

  // Se tem serviço sem desconto
  if (servicoChave) {
    const s = DADOS.servicos[servicoChave];
    return `${s.nome}

${s.desc}

A partir de ${s.valor}

👉 Agende: ${DADOS.linkAgendamento}

Produtos ${DADOS.produtos} • ${DADOS.local}
#CleanCar #EsteticaAutomotiva #MogiDasCruzes`;
  }

  // Perguntas específicas
  const t = textoUsuario.toLowerCase();
  if (t.includes('agendar') || t.includes('marcar')) {
    return `📅 É fácil agendar!

Acesse o link abaixo e escolha serviço, dia e horário:

🔗 ${DADOS.linkAgendamento}

Estúdio em ${DADOS.local} 💙🚗✨`;
  }

  if (t.includes('todos') || t.includes('lista') && t.includes('serviço')) {
    return `📋 TABELA DE SERVIÇOS — Clean Car

✅ Lavagem Bronze → R$ 85
✅ Lavagem Prata → R$ 130
✅ Lavagem Ouro → R$ 180
✅ Higienização VIP → R$ 420
✅ Ducha → R$ 40
✅ Restauração de Farol → R$ 299
✅ Vitrificação → R$ 500
✅ Polimento Técnico → R$ 800

👉 Agende: ${DADOS.linkAgendamento}

Aplique desconto sobre o valor base conforme sua campanha! 💙`;
  }

  if (t.includes('desconto') && t.includes('todos')) {
    return `💰 DESCONTO EM TODOS OS SERVIÇOS

Aplique sobre os valores:

• Lavagem Bronze → R$ 85
• Lavagem Prata → R$ 130
• Lavagem Ouro → R$ 180
• Higienização VIP → R$ 420
• Ducha → R$ 40
• Restauração de Farol → R$ 299
• Vitrificação → R$ 500
• Polimento Técnico → R$ 800

Exemplo: 15% de desconto em Lavagem Prata → R$ 110,50

👉 Agende: ${DADOS.linkAgendamento}

#CleanCar #Promoção #Desconto`;
  }

  // Texto livre do usuário → ele é o guia
  if (textoUsuario.length > 15) {
    return `${textoUsuario}

👉 Agende: ${DADOS.linkAgendamento}

Produtos ${DADOS.produtos} • ${DADOS.local}
#CleanCar #EsteticaAutomotiva #MogiDasCruzes`;
  }

  // Resposta padrão
  return `Recebido! 💙 Vou te ajudar com isso.

Você pode pedir:
• "Postagem Lavagem Prata com 10% de desconto"
• "Lista de todos os serviços"
• "Como agendar?"
• Ou escrever seu texto que eu formato prontinho!

O que precisa? 🚗✨`;
}

// ==============================================
// 🚀 INICIALIZAÇÃO
// ==============================================
export function iniciarDola({ copiar, salvarPedido, toast }) {
  const caixaMensagens = document.getElementById('chatMessages');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');

  // Chips rápidos
  const chipsContainer = document.getElementById('chatChips');
  [
    'Postagem Lavagem Prata 15%',
    'Postagem Lavagem Ouro 10%',
    'Postagem Higienização VIP',
    'Lista de serviços',
    'Como agendar?'
  ].forEach(texto => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'px-2 py-1 bg-sky-100 text-cleandark rounded-full text-xs hover:bg-primary hover:text-white transition';
    btn.textContent = texto;
    btn.onclick = () => { input.value = texto; input.focus(); };
    chipsContainer.appendChild(btn);
  });

  function adicionarMensagem(texto, ehUsuario = false) {
    const div = document.createElement('div');
    div.className = `flex ${ehUsuario ? 'justify-end' : 'justify-start'}`;
    div.innerHTML = `
      <div class="${ehUsuario ? 'bg-primary text-white' : 'bg-white text-slate-700'} px-4 py-3 rounded-2xl max-w-[85%] text-sm shadow-sm whitespace-pre-wrap">
        ${texto}
      </div>
    `;
    caixaMensagens.appendChild(div);
    caixaMensagens.scrollTop = caixaMensagens.scrollHeight;
    return div;
  }

  async function processar(textoUsuario) {
    adicionarMensagem(textoUsuario, true);
    input.value = '';

    const indicador = document.createElement('div');
    indicador.className = 'flex justify-start';
    indicador.innerHTML = `<div class="bg-white px-4 py-3 rounded-2xl text-sm text-slate-400">💙 Preparando…</div>`;
    caixaMensagens.appendChild(indicador);
    caixaMensagens.scrollTop = caixaMensagens.scrollHeight;

    // Pequeno delay natural
    await new Promise(r => setTimeout(r, 400));
    
    const resposta = gerarResposta(textoUsuario);
    
    indicador.remove();
    adicionarMensagem(resposta);

    salvarPedido('Assistente', textoUsuario);

    // Botão copiar
    const ultimo = caixaMensagens.lastElementChild;
    const btnCopiar = document.createElement('button');
    btnCopiar.className = 'text-xs text-primary mt-2 hover:underline';
    btnCopiar.innerHTML = '<i class="fa fa-copy"></i> Copiar';
    btnCopiar.onclick = () => { copiar(resposta); toast('Copiado! ✅'); };
    ultimo.querySelector('div').appendChild(btnCopiar);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const texto = input.value.trim();
    if (!texto) return;
    await processar(texto);
  });

  // Boas-vindas
  setTimeout(() => {
    adicionarMensagem(`Olá! 💙 Tudo seguro e funcionando! 🚗✨

Como usar:
• Digita o serviço + desconto → "Lavagem Prata 15%"
• Eu formato prontinho → você copia e posta
• Sem chaves, sem risco, tudo seguro!

Exemplo:
> "Postagem Lavagem Ouro com 10% de desconto"

O que precisa hoje? 😊`);
  }, 300);
}
