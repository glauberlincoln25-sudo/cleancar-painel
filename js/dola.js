import CONFIG from './config.js';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// 📋 DADOS OFICIAIS
const DADOS_BASE = `
VOCÊ É A DOLA, ASSISTENTE DA CLEAN CAR — ESTÉTICA AUTOMOTIVA.
Seja amigável, direta, prática.

📋 SERVIÇOS E VALORES BASE:
• Lavagem Bronze → R$ 85 — Manutenção rápida
• Lavagem Prata → R$ 130 — Estética completa
• Lavagem Ouro → R$ 180 — Pré-lavagem + Vonixx + higienização
• Higienização Interna VIP → R$ 420 — Saúde e conforto para a família
• Ducha → R$ 40 — Rápida, mantém o brilho
• Restauração de Farol → R$ 299 — Transparência + segurança
• Vitrificação → R$ 500 — Proteção de até 3 anos
• Polimento Técnico → R$ 800 — Correção de riscos + brilho espelhado

📍 Local: Mogi das Cruzes — atende Alto Tietê
🧪 Produtos: Vonixx
📅 Agendamento: ${CONFIG.LINK_AGENDAMENTO}
📸 Instagram: @cleancar_est26

📝 REGRAS:
1. Calcule desconto sobre o valor base quando mencionado
2. Sempre que possível inclua o link de agendamento
3. Formate para copiar e colar no Instagram
4. Tom: amigável, profissional, emojis com moderação
5. Responda em português do Brasil
6. Se o usuário escrever texto livre, use-o como legenda e inclua o link
`;

let GEMINI_API_KEY = localStorage.getItem('gemini_api_key') || '';

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
  if (m.includes('bronze')) return {nome:'Lavagem Bronze', valor:'R$ 85'};
  if (m.includes('prata')) return {nome:'Lavagem Prata', valor:'R$ 130'};
  if (m.includes('ouro')) return {nome:'Lavagem Ouro', valor:'R$ 180'};
  if ((m.includes('higieniz')||m.includes('vip')||m.includes('interna')) && !m.includes('banco')) return {nome:'Higienização Interna VIP', valor:'R$ 420'};
  if (m.includes('ducha')) return {nome:'Ducha', valor:'R$ 40'};
  if (m.includes('farol')) return {nome:'Restauração de Farol', valor:'R$ 299'};
  if (m.includes('vitrific')) return {nome:'Vitrificação', valor:'R$ 500'};
  if (m.includes('polimento')) return {nome:'Polimento Técnico', valor:'R$ 800'};
  return null;
}

function respostaLocal(textoUsuario) {
  const servico = identificarServico(textoUsuario);
  const desconto = extrairDesconto(textoUsuario);
  
  if (servico && desconto) {
    const valorFinal = calcularDesconto(servico.valor, desconto);
    return `🔥 PROMOÇÃO — ${desconto}% DE DESCONTO! 🔥

${servico.nome}

De ${servico.valor} → por ${valorFinal} ✅

Produtos Vonixx • Mogi das Cruzes

👉 Agende: ${CONFIG.LINK_AGENDAMENTO}

#CleanCar #Promoção #EsteticaAutomotiva #MogiDasCruzes`;
  }
  
  if (servico) {
    return `${servico.nome}

Valor: ${servico.valor}

👉 Agende: ${CONFIG.LINK_AGENDAMENTO}

#CleanCar #EsteticaAutomotiva #MogiDasCruzes`;
  }
  
  const t = textoUsuario.toLowerCase();
  if (t.includes('agendar') || t.includes('marcar')) {
    return `📅 É fácil agendar!

🔗 ${CONFIG.LINK_AGENDAMENTO}

Escolha serviço, dia e horário 💙🚗✨`;
  }
  
  if (textoUsuario.length > 15) {
    return `${textoUsuario}

👉 Agende: ${CONFIG.LINK_AGENDAMENTO}

#CleanCar #MogiDasCruzes`;
  }
  
  return `Pode me pedir assim:
"Lavagem Prata com 15% de desconto"
"Lista de serviços"
"Como agendar?"

O que precisa? 💙`;
}

async function chamarGemini(mensagem, historico) {
  if (!GEMINI_API_KEY) return null;
  
  try {
    const resposta = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        contents: [
          {role:'user', parts:[{text:DADOS_BASE}]},
          {role:'model', parts:[{text:'Pronto! 💙'}]},
          ...historico.map(h => ({role:h.usuario?'user':'model', parts:[{text:h.texto}]})),
          {role:'user', parts:[{text:mensagem}]}
        ],
        generationConfig: {temperature:0.7, maxOutputTokens:1024}
      })
    });
    
    const dados = await resposta.json();
    if (dados?.error) {
      console.warn('Erro Gemini:', dados.error);
      return null;
    }
    return dados?.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (erro) {
    console.warn('Falha Gemini:', erro);
    return null;
  }
}

export function iniciarDola({ copiar, salvarPedido, toast }) {
  const caixaMensagens = document.getElementById('chatMessages');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  let historico = [];

  // 🔑 CAMPO DA CHAVE — SEGURO, SÓ NO SEU NAVEGADOR
  const areaConfig = document.createElement('div');
  areaConfig.className = 'px-4 pt-3 pb-1 border-b border-sky-100';
  areaConfig.innerHTML = `
    <details class="text-sm">
      <summary class="cursor-pointer text-slate-500 hover:text-primary">
        🔑 Configurar Chave Gemini ${GEMINI_API_KEY ? '(✅ Ativada)' : '(⚠️ Não configurada)'}
      </summary>
      <div class="mt-2 flex gap-2">
        <input type="password" id="campoChave" placeholder="Cole sua chave aqui" 
          class="flex-1 px-3 py-2 border rounded-lg text-sm" value="${GEMINI_API_KEY}">
        <button id="salvarChave" class="bg-primary text-white px-3 py-2 rounded-lg text-sm">Salvar</button>
      </div>
      <p class="text-xs text-slate-400 mt-1">A chave fica salva só aqui no seu navegador, nunca é enviada para o código do GitHub ✅</p>
    </details>
  `;
  form.before(areaConfig);

  document.getElementById('salvarChave').addEventListener('click', () => {
    const chave = document.getElementById('campoChave').value.trim();
    if (chave) {
      GEMINI_API_KEY = chave;
      localStorage.setItem('gemini_api_key', chave);
      toast('Chave salva! ✅ Gemini ativado 💙');
      areaConfig.innerHTML = areaConfig.innerHTML.replace('(⚠️ Não configurada)', '(✅ Ativada)');
    } else {
      GEMINI_API_KEY = '';
      localStorage.removeItem('gemini_api_key');
      toast('Chave removida ⚠️ Usando respostas locais');
    }
  });

  // Chips
  const chipsContainer = document.getElementById('chatChips');
  ['Lavagem Prata 15%', 'Lavagem Ouro 10%', 'Higienização VIP', 'Lista de serviços', 'Como agendar?'].forEach(texto => {
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
    indicador.innerHTML = `<div class="bg-white px-4 py-3 rounded-2xl text-sm text-slate-400">💙 ${GEMINI_API_KEY ? 'Consultando…' : 'Preparando…'}</div>`;
    caixaMensagens.appendChild(indicador);
    caixaMensagens.scrollTop = caixaMensagens.scrollHeight;

    let resposta = await chamarGemini(textoUsuario, historico);
    if (!resposta) resposta = respostaLocal(textoUsuario);

    indicador.remove();
    adicionarMensagem(resposta);

    historico.push({usuario:true, texto:textoUsuario});
    historico.push({usuario:false, texto:resposta});
    if (historico.length > 10) historico.splice(0,2);

    salvarPedido('Assistente', textoUsuario);

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

  setTimeout(() => {
    adicionarMensagem(`Olá! 💙 Tudo seguro e funcionando! 🚗✨

${GEMINI_API_KEY 
  ? '✅ Gemini ativado — respostas inteligentes e personalizadas' 
  : '⚠️ Cole sua chave do Gemini acima para respostas mais inteligentes'}

Como usar:
• Digita o serviço + desconto → "Lavagem Prata 15%"
• Eu formato prontinho → você copia e posta
• Escreve qualquer texto que eu organizo com o link

O que precisa hoje? 😊`);
  }, 300);
}
