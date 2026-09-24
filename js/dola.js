import CONFIG from './config.js';
import { POSTS_SEMANAIS, getPostDoDia, gerarTextoPersonalizado, gerarPromptImagem } from './content-generator.js';

const LINK = CONFIG.LINK_AGENDAMENTO;
const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const SUGESTOES = ['Postagem de hoje', 'Campanha de Outubro completa', 'Texto story Lavagem Ouro', 'Hashtags para Lavagem Prata', 'Descrição de imagem para o feed', 'Quais os preços?', 'Link de agendamento'];
const AJUDA = 'Recebido! 💙 Pode me pedir:\n• Postagem de hoje (ou de um dia: "postagem de sexta")\n• Campanha completa\n• Texto de um serviço (Prata, Ouro ou VIP)\n• Hashtags\n• Descrição de imagem (feed ou story)\n• Preços e link de agendamento\n\nÉ só dizer o tema! 🚗✨';

function servico(m) {
  if (m.includes('prata')) return 'Lavagem Prata';
  if (m.includes('ouro')) return 'Lavagem Ouro';
  if (m.includes('higieniz') || m.includes('vip')) return 'Higienização VIP';
  return null;
}

// Devolve { texto, copiavel } — copiavel = conteúdo pronto para postar
export function responder(msg) {
  const m = norm(msg);
  const s = servico(m);
  const dia = POSTS_SEMANAIS.find(p => m.includes(norm(p.dia)));

  if (m.includes('hashtag')) {
    const extra = { 'Lavagem Prata': '#LavagemPrata', 'Lavagem Ouro': '#LavagemOuro', 'Higienização VIP': '#Higienizacao #SaudeNoTransito' }[s] || '#OutubroCleanCar';
    return { texto: `#CleanCar #MogiDasCruzes #Vonixx #EsteticaAutomotiva ${extra}`, copiavel: true };
  }
  if (m.includes('link') || m.includes('agend')) return { texto: LINK, copiavel: true };
  if (m.includes('preco') || m.includes('valor') || m.includes('quanto')) {
    return { texto: '💰 Outubro — 15% OFF\n✅ Lavagem Prata: R$ 110,50 (de R$ 130)\n✅ Lavagem Ouro: R$ 153 (de R$ 180)\n✅ Higienização VIP: R$ 357 (de R$ 420)', copiavel: false };
  }
  if (m.includes('imagem') || m.includes('foto') || m.includes('logo') || m.includes('arte')) {
    const formato = m.includes('story') ? 'story' : 'feed';
    return { texto: gerarPromptImagem(s || 'Campanha de Outubro, 15% OFF', formato), copiavel: true };
  }
  if (m.includes('hoje') || dia) {
    const p = dia || getPostDoDia();
    return { texto: `${p.icone} ${p.dia} — ${p.titulo}\n\n${p.modelo(LINK)}`, copiavel: true };
  }
  if (m.includes('campanha') || m.includes('outubro')) return { texto: gerarTextoPersonalizado('campanha de outubro'), copiavel: true };
  if (s || ['texto', 'legenda', 'postagem', 'story', 'feed'].some(k => m.includes(k))) {
    return { texto: gerarTextoPersonalizado(s ? s.toLowerCase() : msg), copiavel: true };
  }
  return { texto: AJUDA, copiavel: false };
}

function el(tag, cls, texto) {
  const e = document.createElement(tag);
  e.className = cls;
  if (texto) e.textContent = texto;
  return e;
}

export function iniciarDola({ copiar, salvarPedido, toast }) {
  const box = document.getElementById('chatMessages');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  const chips = document.getElementById('chatChips');
  if (!box || !form) return;

  const rolar = () => { box.scrollTop = box.scrollHeight; };

  function addMsg(texto, usuario, copiavel) {
    const linha = el('div', 'flex gap-3 ' + (usuario ? 'justify-end' : ''));
    const avatar = el('div', 'w-8 h-8 rounded-full flex items-center justify-center shrink-0 ' + (usuario ? 'bg-sky-100 text-slate-600' : 'bg-primary text-white'), usuario ? 'U' : 'D');
    const coluna = el('div', 'max-w-[85%]');
    coluna.appendChild(el('div', 'p-3 shadow-sm text-sm whitespace-pre-wrap break-words rounded-lg ' + (usuario ? 'bg-primary text-white rounded-tr-none' : 'bg-white rounded-tl-none'), texto));
    if (copiavel) {
      const b = el('button', 'mt-1 text-xs text-primary hover:underline');
      b.type = 'button';
      b.innerHTML = '<i class="fa fa-copy"></i> Copiar';
      b.addEventListener('click', () => copiar(texto));
      coluna.appendChild(b);
    }
    linha.append(...(usuario ? [coluna, avatar] : [avatar, coluna]));
    box.appendChild(linha);
    rolar();
    return linha;
  }

  addMsg('Oi! Eu sou a Dola 💙 Conheço a marca, os valores de Outubro e o link de agendamento da Clean Car.\nEscolha um atalho ou escreva o que precisa. 🚗✨', false, false);

  function enviar(msg) {
    addMsg(msg, true, false);
    const digitando = addMsg('digitando…', false, false);
    setTimeout(() => {
      digitando.remove();
      const r = responder(msg);
      addMsg(r.texto, false, r.copiavel);
      if (salvarPedido) salvarPedido('Dola', msg).catch(() => {});
    }, 500);
  }

  SUGESTOES.forEach(t => {
    const b = el('button', 'px-3 py-1 rounded-full text-xs bg-sky-100 text-cleandark hover:bg-primary hover:text-white transition', t);
    b.type = 'button';
    b.addEventListener('click', () => enviar(t));
    chips.appendChild(b);
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    enviar(msg);
  });
}
