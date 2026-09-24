import CONFIG from './config.js';

const REPO = 'glauberlincoln25-sudo/cleancar-painel';

async function verificar() {
  const p = [];
  const hoje = new Date();
  const diasParaVirar = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate() - hoje.getDate();
  if (localStorage.getItem('cleancar_id')) p.push({ prio: 'Alta', titulo: 'Entrar com e-mail (Supabase Auth) e ativar o RLS', motivo: 'Você ainda está no login antigo, com senha em texto puro na tabela users.' });
  else p.push({ prio: 'Média', titulo: 'Fechar cadastros abertos e apagar a tabela users antiga', motivo: 'Depois do login novo, a tabela antiga não é mais necessária e guarda senhas em texto puro.' });
  p.push({ prio: diasParaVirar <= 7 ? 'Alta' : 'Média', titulo: 'Campanhas editáveis (trocar o mês sem mexer no código)', motivo: `A campanha "Outubro 15% OFF" está fixa no código. Faltam ${diasParaVirar} dia(s) para o mês virar.` });
  p.push({ prio: 'Média', titulo: 'QR code do agendamento nas artes e link com UTM', motivo: 'Permite imprimir no balcão e saber de onde vêm os agendamentos.' });
  return p;
}

async function ultimaAtualizacao() {
  try {
    const r = await fetch(`https://api.github.com/repos/${REPO}/commits/main`);
    const d = await r.json();
    return `Última atualização do painel: ${new Date(d.commit.author.date).toLocaleString('pt-BR')} — ${d.commit.message.split('\n')[0]}`;
  } catch { return `Versão ${CONFIG.VERSAO}`; }
}

export function iniciarMelhorias({ toast, copiar }) {
  const lista = document.getElementById('listaMelhorias');
  const info = document.getElementById('infoVersao');
  if (!lista) return;

  async function renderizar() {
    lista.textContent = 'A Dola está verificando o painel…';
    info.textContent = await ultimaAtualizacao();
    const propostas = await verificar();
    lista.textContent = '';
    propostas.forEach(pr => {
      const card = document.createElement('div');
      card.className = 'bg-white rounded-xl shadow-sm p-4 border-l-4 ' + (pr.prio === 'Alta' ? 'border-accent' : 'border-primary');
      const t = document.createElement('h3'); t.className = 'font-semibold'; t.textContent = pr.titulo;
      const m = document.createElement('p'); m.className = 'text-sm text-slate-500 mt-1'; m.textContent = `Prioridade ${pr.prio}. ${pr.motivo}`;
      const b = document.createElement('button');
      b.className = 'mt-3 bg-secondary text-white px-4 py-2 rounded-lg text-sm';
      b.innerHTML = '<i class="fa fa-check"></i> Autorizar melhoria';
      b.addEventListener('click', () => {
        const pedido = `Claude, autorizo executar esta melhoria no painel Clean Car: ${pr.titulo}`;
        copiar(pedido);
        window.open(`https://github.com/${REPO}/issues/new?title=${encodeURIComponent('Melhoria autorizada: ' + pr.titulo)}&body=${encodeURIComponent(pr.motivo + '\n\nAutorizado pelo painel em ' + new Date().toLocaleString('pt-BR'))}`, '_blank', 'noopener');
        toast('Autorizada! Volte ao chat e diga: executar melhorias autorizadas.');
      });
      card.append(t, m, b);
      lista.appendChild(card);
    });
  }

  document.querySelector('[data-tab="melhorias"]')?.addEventListener('click', renderizar);
  renderizar();
}
