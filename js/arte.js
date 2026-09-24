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

let logo;
const carregarLogo = () => (logo ||= new Promise(ok => {
  const i = new Image();
  i.onload = () => ok(i);
  i.onerror = () => ok(null);
  i.src = 'assets/logo.png';
}));

function pill(c, x, y, w, h, cor) {
  c.fillStyle = cor;
  c.beginPath();
  c.roundRect(x, y, w, h, h / 2);
  c.fill();
}

export async function desenharArte(chave, formato) {
  const s = SERVICOS[chave] || SERVICOS.ouro;
  const W = 1080, H = formato === 'story' ? 1920 : 1080;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const c = cv.getContext('2d');
  const f = 'Baloo 2, Nunito, Arial, sans-serif';

  const fundo = c.createLinearGradient(0, 0, W * 0.4, H);
  fundo.addColorStop(0, '#38bdf8'); fundo.addColorStop(1, '#075985');
  c.fillStyle = fundo; c.fillRect(0, 0, W, H);

  // espuma: bolhas translúcidas
  for (let i = 0; i < 34; i++) {
    const r = 14 + ((i * 37) % 60), x = (i * 211) % W, y = (i * 389) % H;
    c.fillStyle = `rgba(255,255,255,${0.06 + (i % 4) * 0.04})`;
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  }

  const topo = formato === 'story' ? 200 : 70;
  const img = await carregarLogo();
  const L = formato === 'story' ? 300 : 220;
  c.save();
  c.beginPath(); c.arc(W / 2, topo + L / 2, L / 2, 0, Math.PI * 2); c.closePath();
  c.fillStyle = '#fff'; c.fill(); c.clip();
  if (img) c.drawImage(img, W / 2 - L / 2, topo, L, L);
  c.restore();
  c.lineWidth = 8; c.strokeStyle = '#fff';
  c.beginPath(); c.arc(W / 2, topo + L / 2, L / 2, 0, Math.PI * 2); c.stroke();

  c.textAlign = 'center';
  let y = topo + L + 70;
  pill(c, W / 2 - 250, y, 500, 74, '#e11d48');
  c.fillStyle = '#fff'; c.font = `800 40px ${f}`; c.fillText(CAMPANHA, W / 2, y + 52);

  y += 170;
  c.fillStyle = '#fff'; c.font = `800 92px ${f}`; c.fillText(s.nome, W / 2, y);

  y += 80;
  c.font = `600 40px ${f}`; c.fillStyle = 'rgba(255,255,255,.8)';
  c.fillText(`de ${s.de}`, W / 2, y);
  const tw = c.measureText(`de ${s.de}`).width;
  c.fillRect(W / 2 - tw / 2, y - 14, tw, 4);

  y += 150;
  c.fillStyle = '#fff'; c.font = `800 150px ${f}`; c.fillText(s.por, W / 2, y);

  y += 70;
  c.font = `600 40px ${f}`;
  s.itens.forEach((t, i) => c.fillText(`✔ ${t}`, W / 2, y + i * 56));

  const base = H - (formato === 'story' ? 210 : 150);
  pill(c, W / 2 - 330, base, 660, 84, '#22c55e');
  c.fillStyle = '#fff'; c.font = `800 42px ${f}`; c.fillText('Agende pelo link da bio', W / 2, base + 57);
  c.font = `600 30px ${f}`; c.fillStyle = 'rgba(255,255,255,.85)';
  c.fillText('Clean Car · Mogi das Cruzes · @cleancar_est26', W / 2, base + 135);
  return cv;
}

export async function montarArte(alvo, { copiar, toast }, chave, formato) {
  alvo.querySelector('.arte-wrap')?.remove();
  const wrap = document.createElement('div');
  wrap.className = 'arte-wrap mt-3';
  wrap.textContent = 'Montando a arte…';
  alvo.appendChild(wrap);
  try { await document.fonts.load('800 40px "Baloo 2"'); } catch { /* segue com a fonte padrão */ }
  const cv = await desenharArte(chave, formato);
  cv.className = 'rounded-xl shadow-md w-full ' + (formato === 'story' ? 'max-w-[240px]' : 'max-w-[360px]');

  const barra = document.createElement('div');
  barra.className = 'flex flex-wrap gap-2 mt-2';
  const nome = `cleancar-${chave}-${formato}.png`;
  const botao = (rotulo, fn) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'bg-primary text-white px-3 py-1 rounded-lg text-sm';
    b.innerHTML = rotulo;
    b.addEventListener('click', fn);
    barra.appendChild(b);
  };
  botao('<i class="fa fa-download"></i> Baixar PNG', () => {
    const a = document.createElement('a');
    a.download = nome; a.href = cv.toDataURL('image/png'); a.click();
  });
  botao('<i class="fa fa-clipboard"></i> Copiar imagem', () => {
    cv.toBlob(async b => {
      try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': b })]); toast('Imagem copiada! Cole no Instagram ou WhatsApp ✅'); }
      catch { toast('Seu navegador bloqueou copiar imagem. Use Baixar PNG.', 'erro'); }
    });
  });
  botao('<i class="fa fa-whatsapp"></i> Texto + link', () => copiar(`${SERVICOS[chave].nome} — ${SERVICOS[chave].por}\n${CONFIG.LINK_AGENDAMENTO}`));
  wrap.textContent = '';
  wrap.append(cv, barra);
}
