import CONFIG from './config.js';
import { POSTS_SEMANAIS } from './content-generator.js';
import { listarPostados, marcarPostado, desmarcarPostado } from './supabase-db.js';

const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dm = d => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
const fmtAgenda = d => `${iso(d).replaceAll('-', '')}T${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}00`;

let postados = new Set();
let redesenhar = async () => {};

function semanaAtual() {
  const dom = new Date();
  dom.setHours(0, 0, 0, 0);
  dom.setDate(dom.getDate() - dom.getDay());
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(dom); d.setDate(dom.getDate() + i); return d; });
}

function atualizarLembrete() {
  const el = document.getElementById('lembreteHoje');
  if (!el) return;
  const feito = postados.has(iso(new Date()));
  el.textContent = feito ? '✅ A postagem de hoje já foi feita.' : '⏰ A postagem de hoje ainda não foi marcada como postada.';
  el.className = 'text-sm mt-3 font-semibold ' + (feito ? 'text-secondary' : 'text-accent');
}

export const atualizarCalendario = () => redesenhar();

export function iniciarCalendario({ copiar, toast }) {
  const grade = document.getElementById('gradeSemana');
  if (!grade) return;

  redesenhar = async () => {
    postados = new Set(await listarPostados());
    const hoje = iso(new Date());
    grade.textContent = '';
    let feitos = 0;
    semanaAtual().forEach((d, i) => {
      const post = POSTS_SEMANAIS[i];
      const chave = iso(d);
      const feito = postados.has(chave);
      if (feito) feitos++;
      const status = feito ? ['✅ Postado', 'text-secondary'] : chave < hoje ? ['⚠️ Atrasada', 'text-amber-600'] : chave === hoje ? ['⏰ Hoje', 'text-accent'] : ['Agendada', 'text-slate-400'];

      const card = document.createElement('div');
      card.className = 'bg-white rounded-xl shadow-sm p-4 border ' + (chave === hoje ? 'ring-2 ring-primary' : 'border-sky-100');
      const topo = document.createElement('div');
      topo.className = 'flex justify-between items-start gap-2';
      const t = document.createElement('h3');
      t.className = 'font-semibold';
      t.textContent = `${post.icone} ${post.dia}, ${dm(d)}`;
      const st = document.createElement('span');
      st.className = 'text-xs font-semibold whitespace-nowrap ' + status[1];
      st.textContent = status[0];
      topo.append(t, st);
      const sub = document.createElement('p');
      sub.className = 'text-sm text-slate-500 mt-1';
      sub.textContent = post.titulo;

      const acoes = document.createElement('div');
      acoes.className = 'flex flex-wrap gap-2 mt-3';
      const bCopiar = document.createElement('button');
      bCopiar.className = 'bg-primary text-white px-3 py-1 rounded-lg text-sm';
      bCopiar.innerHTML = '<i class="fa fa-copy"></i> Copiar';
      bCopiar.addEventListener('click', () => copiar(post.modelo(CONFIG.LINK_AGENDAMENTO)));
      const bMarcar = document.createElement('button');
      bMarcar.className = (feito ? 'bg-slate-400' : 'bg-secondary') + ' text-white px-3 py-1 rounded-lg text-sm';
      bMarcar.innerHTML = feito ? '<i class="fa fa-undo"></i> Desmarcar' : '<i class="fa fa-check"></i> Marcar como postado';
      bMarcar.addEventListener('click', async () => {
        bMarcar.disabled = true;
        const ok = feito ? await desmarcarPostado(chave) : await marcarPostado(chave);
        toast(ok ? (feito ? 'Postagem desmarcada' : 'Postagem marcada como feita ✅') : 'Não consegui salvar. Verifique o login e a internet.', ok ? 'ok' : 'erro');
        redesenhar();
      });
      acoes.append(bCopiar, bMarcar);
      card.append(topo, sub, acoes);
      grade.appendChild(card);
    });
    document.getElementById('resumoSemana').textContent = `${feitos} de 7 postagens feitas nesta semana`;
    atualizarLembrete();
  };

  // Lembrete de verdade: evento diário recorrente no Google Agenda (avisa no celular, com o painel fechado)
  document.getElementById('btnLembrete').addEventListener('click', () => {
    const [h, m] = (document.getElementById('horaLembrete').value || '10:00').split(':').map(Number);
    const ini = new Date(); ini.setHours(h, m, 0, 0);
    const fim = new Date(ini.getTime() + 15 * 60000);
    const url = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
      + '&text=' + encodeURIComponent('Postar na Clean Car 🚗✨')
      + '&details=' + encodeURIComponent('Abra o painel, copie a postagem do dia e publique: ' + location.href.split('#')[0])
      + `&dates=${fmtAgenda(ini)}/${fmtAgenda(fim)}&recur=` + encodeURIComponent('RRULE:FREQ=DAILY');
    window.open(url, '_blank', 'noopener');
  });

  document.querySelector('[data-tab="calendario"]')?.addEventListener('click', () => redesenhar());
  redesenhar();
}
