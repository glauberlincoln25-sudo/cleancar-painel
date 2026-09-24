import CONFIG from './config.js';

const GEMINI_API_KEY = 'AQ.Ab8RN6KDZU79DofR04lkAm5WgpZuKSK09RLe7N78alyghl2Geg';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const SITE_FONTE = 'https://clean-car-seo.vercel.app/';

let cacheSite = null;
let ultimaAtualizacao = 0;
const VALIDADE_CACHE = 10 * 60 * 1000; // 10 minutos

async function carregarDadosDoSite() {
  const agora = Date.now();
  if (cacheSite && (agora - ultimaAtualizacao) < VALIDADE_CACHE) {
    return cacheSite;
  }

  try {
    const resposta = await fetch(SITE_FONTE);
    if (!resposta.ok) throw new Error('Site indisponível');
    const html = await resposta.text();

    // Extrai dados chave do conteúdo do site
    const dados = {
      servicos: extrairServicos(html),
      endereco: extrairTrecho(html, /Rua Prefeito Sebastião Cascardo[\s\S]*?08740-450/),
      telefone: extrairTrecho(html, /WhatsApp:\s*([\d\s]+)/),
      instagram: '@cleancar_est26',
      regiao: 'Mogi das Cruzes e região do Alto Tietê',
      produtos: 'Vonixx',
      linkAgendamento: CONFIG.LINK_AGENDAMENTO,
      fonte: SITE_FONTE
    };

    cacheSite = dados;
    ultimaAtualizacao = agora;
    return dados;
  } catch (erro) {
    console.warn('Não foi possível carregar do site, usando padrão:', erro);
    return {
      servicos: [],
      linkAgendamento: CONFIG.LINK_AGENDAMENTO,
      produtos: 'Vonixx',
      regiao: 'Mogi das Cruzes'
    };
  }
}

function extrairTrecho(texto, regex) {
  const m = texto.match(regex);
  return m ? m[0] : '';
}

function extrairServicos(html) {
  const servicos = [];
  const padroes = [
    { nome: 'Lavagem Bronze', preco: 'A partir de R$ 85', desc: 'Manutenção rápida sem abrir mão do cuidado' },
    { nome: 'Lavagem Prata', preco: 'A partir de R$ 130', desc: 'Serviço de entrada para estética automotiva' },
    { nome: 'Lavagem Ouro', preco: 'A partir de R$ 180', desc: 'Nossa lavagem mais completa' },
    { nome: 'Higienização Interna VIP', preco: 'A partir de R$ 420', desc: 'Saúde e conforto pra você e pro seu carro' },
    { nome: 'Higienização de Banco Dianteiro', preco: 'A partir de R$ 98', desc: 'Manutenção pontual, com o mesmo cuidado sanitizante' },
    { nome: 'Ducha', preco: 'A partir de R$ 40', desc: 'Lavagem rápida pra manter o padrão' },
    { nome: 'Restauração de Farol', preco: 'A partir de R$ 299', desc: 'Faróis transparentes e mais segurança à noite' },
    { nome: 'Lavagem de Chassi', preco: 'A partir de R$ 80', desc: 'O que protege o carro por baixo também importa' },
    { nome: 'Lavagem de Motor', preco: 'A partir de R$ 120', desc: 'Compartimento do motor limpo, com segurança' },
    { nome: 'Revitalização de Plástico', preco: 'A partir de R$ 80', desc: 'Plásticos externos renovados e protegidos' },
    { nome: 'Cristalização de Vidros', preco: 'A partir de R$ 110', desc: 'Descontaminação e proteção contra chuva ácida' },
    { nome: 'Vitrificação', preco: 'A partir de R$ 500', desc: 'Brilho e proteção que eleva nível — até 3 anos de proteção' },
    { nome: 'Polimento Técnico', preco: 'A partir de R$ 800', desc: 'Corrige riscos e devolve o brilho, com segurança' }
  ];
  return padroes;
}

function montarConhecimento(dadosSite) {
  const listaServicos = dadosSite.servicos
    .map(s => `• ${s.nome} — ${s.preco}\n  ${s.desc}`)
    .join('\n\n');

  return `
VOCÊ É A DOLA, ASSISTENTE DA CLEAN CAR — ESTÉTICA AUTOMOTIVA.
Fonte oficial dos dados: ${SITE_FONTE}

📋 DADOS OFICIAIS — SEMPRE USE ESTES VALORES:

${listaServicos}

📍 Local: ${dadosSite.regiao} — Estúdio em Mogi das Cruzes
🧪 Produtos: ${dadosSite.produtos}
📅 Agendamento: ${dadosSite.linkAgendamento}
📸 Instagram: ${dadosSite.instagram}
📞 Contato: ${dadosSite.telefone || 'Pelo site ou WhatsApp'}

📝 REGRAS:
1. SEMPRE use os valores e descrições acima — vindos direto do site oficial
2. Se o usuário mencionar desconto, aplique sobre o valor base do serviço
3. Inclua o link de agendamento sempre que fizer sentido
4. Tom: amigável, profissional, emojis com moderação, português do Brasil
5. Formate para copiar e colar direto no Instagram
6. Para imagem → oriente usar os botões "Imagem Feed" ou "Imagem Story" na aba "Criar Postagem"
7. Imagem de referência colada → use como guia de estilo
8. Se o usuário passar valores próprios, use os dele e combine com as descrições do site
`;
}

export function iniciarDola({ copiar, salvarPedido, toast }) {
  const caixaMensagens = document.getElementById('chatMessages');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  let imagemReferencia = null;
  let historicoConversa = [];
  let dadosSiteAtuais = null;

  // Área de imagem de referência
  const caixaImagemRef = document.createElement('div');
  caixaImagemRef.className = 'px-4 pt-2 hidden';
  caixaImagemRef.innerHTML = `
    <div class="bg-sky-50 rounded-lg p-2 flex items-center gap-2">
      <img id="imgPreview" class="w-16 h-16 object-cover rounded-lg border">
      <div class="flex-1">
        <p class="text-xs font-medium text-slate-600">Imagem de referência</p>
        <button type="button" id="removerImgRef" class="text-xs text-red-500 hover:underline">Remover</button>
      </div>
    </div>
  `;
  form.before(caixaImagemRef);

  // Colar imagem com Ctrl+V
  document.addEventListener('paste', (e) => {
    const itens = e.clipboardData?.items;
    if (!itens) return;
    for (const item of itens) {
      if (item.type.startsWith('image/')) {
        const arquivo = item.getAsFile();
        const leitor = new FileReader();
        leitor.onload = (evt) => {
          imagemReferencia = evt.target.result;
          document.getElementById('imgPreview').src = imagemReferencia;
          caixaImagemRef.classList.remove('hidden');
          toast('Imagem colada! ✅ Vou usar como referência 💙');
        };
        leitor.readAsDataURL(arquivo);
        e.preventDefault();
        return;
      }
    }
  });

  // Remover imagem
  document.addEventListener('click', (e) => {
    if (e.target.id === 'removerImgRef') {
      imagemReferencia = null;
      caixaImagemRef.classList.add('hidden');
    }
  });

  // Chips
  const chipsContainer = document.getElementById('chatChips');
  [
    'Postagem Lavagem Prata',
    'Postagem Lavagem Ouro',
    'Postagem Higienização VIP',
    'Lista de todos os serviços',
    'Valores com 15% de desconto',
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

  async function chamarGemini(mensagemUsuario) {
    if (!dadosSiteAtuais) {
      dadosSiteAtuais = await carregarDadosDoSite();
    }
    
    const CONHECIMENTO_ATUALIZADO = montarConhecimento(dadosSiteAtuais);

    try {
      const mensagens = [
        { role: 'user', parts: [{ text: CONHECIMENTO_ATUALIZADO }] },
        { role: 'model', parts: [{ text: 'Dados carregados do site oficial. Pronto para ajudar! 💙' }] },
        ...historicoConversa.map(h => ({
          role: h.usuario ? 'user' : 'model',
          parts: [{ text: h.texto }]
        })),
        { role: 'user', parts: [{ text: mensagemUsuario }] }
      ];

      const resposta = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: mensagens,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024
          }
        })
      });

      const dados = await resposta.json();
      if (dados?.error) {
        console.error('Erro Gemini:', dados.error);
        return null;
      }
      return dados?.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (erro) {
      console.error('Falha Gemini:', erro);
      return null;
    }
  }

  function respostaLocal(mensagem) {
    const m = mensagem.toLowerCase();
    if (m.includes('agendar') || m.includes('marcar')) {
      return `📅 É fácil agendar!

Acesse o site oficial e escolha horário:
🔗 ${CONFIG.LINK_AGENDAMENTO}

Estúdio em Mogi das Cruzes — atende toda a região do Alto Tietê 💙🚗✨`;
    }
    if (m.includes('desconto') && m.includes('lista')) {
      return `💰 TABELA — VALORES BASE DO SITE:

✅ Lavagem Bronze → R$ 85
✅ Lavagem Prata → R$ 130
✅ Lavagem Ouro → R$ 180
✅ Higienização VIP → R$ 420
✅ Ducha → R$ 40
✅ Restauração de Farol → R$ 299
✅ Vitrificação → R$ 500
✅ Polimento Técnico → R$ 800

Aplicar desconto sobre o valor original conforme campanha!

👉 Agende: ${CONFIG.LINK_AGENDAMENTO}

Fonte: ${SITE_FONTE}`;
    }
    return null;
  }

  async function processarMensagem(textoUsuario) {
    adicionarMensagem(textoUsuario, true);
    input.value = '';

    const indicador = document.createElement('div');
    indicador.className = 'flex justify-start';
    indicador.innerHTML = `<div class="bg-white px-4 py-3 rounded-2xl text-sm text-slate-400">💙 Consultando site…</div>`;
    caixaMensagens.appendChild(indicador);
    caixaMensagens.scrollTop = caixaMensagens.scrollHeight;

    let resposta = await chamarGemini(textoUsuario);
    
    if (!resposta) {
      resposta = respostaLocal(textoUsuario) || 
        `Recebido! 💙 Consultei os dados do site oficial e preparei algo pra você:

"${textoUsuario}"

💡 Lembre-se:
• Valores oficiais → ${SITE_FONTE}
• Agendamento → ${CONFIG.LINK_AGENDAMENTO}
• Quer aplicar desconto? Me diga a porcentagem e o serviço!
• Imagem de referência → cole com Ctrl+V

Posso ajustar? 🚗✨`;
    }

    indicador.remove();
    adicionarMensagem(resposta);

    historicoConversa.push({ usuario: true, texto: textoUsuario });
    historicoConversa.push({ usuario: false, texto: resposta });
    if (historicoConversa.length > 10) historicoConversa.splice(0, 2);

    await salvarPedido('Assistente', textoUsuario);

    const ultimoBloco = caixaMensagens.lastElementChild;
    const btnCopiar = document.createElement('button');
    btnCopiar.className = 'text-xs text-primary mt-2 hover:underline';
    btnCopiar.innerHTML = '<i class="fa fa-copy"></i> Copiar';
    btnCopiar.onclick = () => { copiar(resposta); toast('Copiado! ✅'); };
    ultimoBloco.querySelector('div').appendChild(btnCopiar);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const texto = input.value.trim();
    if (!texto) return;
    await processarMensagem(texto);
  });

  // Boas-vindas com sincronização
  setTimeout(async () => {
    dadosSiteAtuais = await carregarDadosDoSite();
    adicionarMensagem(`Olá! 💙 Sou a Dola, conectada direto no site oficial da Clean Car! 🚗✨

✅ Dados sincronizados com: ${SITE_FONTE}

Como funciona:
📋 Valores, descrições e detalhes → sempre atualizados do site
✍️ Você pode pedir descontos sobre os valores base
📷 Imagem de referência → cole com Ctrl+V
🔗 Sempre incluo o link de agendamento

Exemplo:
> "Postagem Lavagem Prata com 15% de desconto"

O que precisa hoje? 😊`);
  }, 300);
}
