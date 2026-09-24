// ==============================================
// 📖 CATÁLOGO DE SERVIÇOS — EDITE AQUI SEMPRE
// ==============================================
export const CATALOGO = {
  servicos: [
    {
      id: 'bronze',
      nome: 'Lavagem Bronze',
      valor: 85.00,
      descricao: 'Manutenção rápida, cuidado completo para o dia a dia',
      tempoEstimado: '~40 min',
      categoria: 'lavagem'
    },
    {
      id: 'prata',
      nome: 'Lavagem Prata',
      valor: 130.00,
      descricao: 'Estética completa: pré-lavagem, limpeza interna e brilho externo',
      tempoEstimado: '~1h 15min',
      categoria: 'lavagem'
    },
    {
      id: 'ouro',
      nome: 'Lavagem Ouro',
      valor: 180.00,
      descricao: 'Pré-lavagem completa + produtos Vonixx + higienização leve',
      tempoEstimado: '~1h 40min',
      categoria: 'lavagem'
    },
    {
      id: 'vip',
      nome: 'Higienização Interna VIP',
      valor: 420.00,
      descricao: 'Limpeza profunda, remoção de odores, tratamento de tecidos — saúde para a família',
      tempoEstimado: '~3h',
      categoria: 'especial'
    },
    {
      id: 'ducha',
      nome: 'Ducha',
      valor: 40.00,
      descricao: 'Rápida, mantém o brilho entre as lavagens',
      tempoEstimado: '~15 min',
      categoria: 'manutencao'
    },
    {
      id: 'farol',
      nome: 'Restauração de Farol',
      valor: 299.00,
      descricao: 'Devolve transparência e segurança à noite — sem desmontar',
      tempoEstimado: '~2h',
      categoria: 'especial'
    },
    {
      id: 'vitrificacao',
      nome: 'Vitrificação',
      valor: 500.00,
      descricao: 'Proteção cerâmica de longa duração — brilho e proteção por até 3 anos',
      tempoEstimado: '~4h',
      categoria: 'protecao'
    },
    {
      id: 'polimento',
      nome: 'Polimento Técnico',
      valor: 800.00,
      descricao: 'Correção de riscos, remoção de marcas, acabamento espelhado profissional',
      tempoEstimado: '~5h',
      categoria: 'estetica'
    }
  ],

  config: {
    marca: 'Clean Car',
    local: 'Mogi das Cruzes — atendemos toda a região do Alto Tietê',
    produtos: 'Vonixx',
    linkAgendamento: 'https://seu-link-de-agendamento.com',
    instagram: '@cleancar_est26',
    tomPadrao: 'amigável, profissional, direto, com energia positiva'
  },

  // 🧠 MEMÓRIA — Campanhas aprovadas (a IA aprende com o que já funcionou)
  memoriaCampanhas: [
    // Exemplos — a ferramenta vai adicionar automaticamente conforme você aprova
    { tipo: 'desconto', servico: 'prata', padrao: 'X% para novos, Y% para os primeiros' },
    { tipo: 'destaque', servico: 'vip', padrao: 'Conforto e saúde para a família' }
  ]
};

// ==============================================
// 🔧 FUNÇÕES DE LEITURA (usadas por todos os módulos)
// ==============================================
export function buscarServico(id) {
  return CATALOGO.servicos.find(s => s.id === id) || null;
}

export function buscarServicosPorCategoria(categoria) {
  return CATALOGO.servicos.filter(s => s.categoria === categoria);
}

export function formatarValor(valor) {
  return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

export function calcularDesconto(valorBase, porcentagem) {
  if (!porcentagem || porcentagem <= 0) return formatarValor(valorBase);
  const final = valorBase * (1 - porcentagem / 100);
  return formatarValor(final);
}

export function sugerirCampanhas() {
  const hoje = new Date();
  const diaSemana = hoje.getDay();
  const dicas = [];

  // Sugestões inteligentes baseadas no momento
  if (diaSemana >= 2 && diaSemana <= 4) {
    dicas.push({
      titulo: '🔥 Promoção de Meio de Semana',
      ideia: 'Desconto especial para agendamentos de terça a quinta — movimenta os dias mais calmos',
      servicos: ['bronze', 'prata', 'ducha']
    });
  }

  dicas.push({
    titulo: '🚗✨ Retorno às Aulas / Fim de Semana',
    ideia: 'Preparar o carro para a rotina — pacote família com desconto na higienização',
    servicos: ['vip', 'prata']
  });

  dicas.push({
    titulo: '🌟 Novos Clientes — Primeira Visita',
    ideia: '10% de boas-vindas + brinde de ducha na próxima visita',
    servicos: ['bronze', 'prata', 'ouro']
  });

  dicas.push({
    titulo: '🏆 Os 3 Primeiros de Amanhã',
    ideia: 'Urgência: 20% para os primeiros clientes, independente de cadastro',
    servicos: ['prata', 'ouro', 'vip']
  });

  return dicas;
}

export function registrarAprovacao(tipo, servicoId, estrutura) {
  CATALOGO.memoriaCampanhas.push({
    data: new Date().toISOString(),
    tipo,
    servico: servicoId,
    estrutura
  });
  // Salva no localStorage para persistir
  localStorage.setItem('cleancar_memoria', JSON.stringify(CATALOGO.memoriaCampanhas));
}
