import { CATALOGO, buscarServico, formatarValor, calcularDesconto, registrarAprovacao } from './catalogo.js';

// ==============================================
// ✍️ GERADOR DE CONTEÚDO — MULTIPLATAFORMA
// ==============================================
export function criarCampanha(pedidoUsuario, opcoes = {}) {
  const { formato = 'todos' } = opcoes;
  
  // Extrair dados do pedido
  const descontos = (pedidoUsuario.match(/(\d+)%/g) || []).map(d => parseInt(d));
  const servicosMencionados = identificarServicosNoTexto(pedidoUsuario);
  const datasEspeciais = identificarDatas(pedidoUsuario);
  const chamadas = extrairChamadas(pedidoUsuario);

  // Usar serviço padrão se não mencionou
  const servico = servicosMencionados.length > 0 
    ? buscarServico(servicosMencionados[0]) 
    : buscarServico('prata');

  const [descPrincipal, descSecundario] = descontos.length >= 2 ? descontos : [descontos[0] || null, null];

  // Construir campanha com base no catálogo (NADA fixo no código!)
  const campanha = montarEstruturaCampanha({
    servico,
    descPrincipal,
    descSecundario,
    datasEspeciais,
    chamadas,
    pedidoBruto: pedidoUsuario
  });

  // Gerar para cada plataforma
  return {
    servico: campanha.servico,
    descontos: { principal: descPrincipal, secundario: descSecundario },
    formatos: {
      feed: gerarFeed(campanha),
      story: gerarStory(campanha),
      facebook: gerarFacebook(campanha),
      site: gerarSite(campanha)
    },
    promptImagem: gerarPromptImagem(campanha),
    registrarAprovacao: () => registrarAprovacao('campanha', servico.id, campanha)
  };
}

function identificarServicosNoTexto(texto) {
  const t = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const encontrados = [];
  CATALOGO.servicos.forEach(s => {
    const palavras = s.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (t.includes(palavras.replace(/lavagem |interna /g, '')) || t.includes(s.id)) {
      encontrados.push(s.id);
    }
  });
  return encontrados;
}

function identificarDatas(texto) {
  const t = texto.toLowerCase();
  const datas = [];
  if (t.includes('amanha') || t.includes('amanhã')) datas.push('amanha');
  if (t.includes('semana') || t.includes('segunda') || t.includes('terça') || t.includes('quarta') || t.includes('quinta') || t.includes('sexta')) datas.push('semana');
  if (t.includes('fim de semana') || t.includes('sábado') || t.includes('domingo')) datas.push('fim-semana');
  return datas;
}

function extrairChamadas(texto) {
  const chamadas = [];
  const t = texto.toLowerCase();
  if (t.includes('primeiros')) chamadas.push('urgencia-primeiros');
  if (t.includes('limitada') || t.includes('vagas')) chamadas.push('vagas-limitadas');
  if (t.includes('novo') || t.includes('cliente')) chamadas.push('boas-vindas');
  if (t.includes('familia')) chamadas.push('familia');
  return chamadas;
}

function montarEstruturaCampanha(dados) {
  const { servico, descPrincipal, descSecundario, datasEspeciais, chamadas, pedidoBruto } = dados;
  
  const temDoisDescontos = descPrincipal && descSecundario;
  const valorComDesc1 = descPrincipal ? calcularDesconto(servico.valor, descPrincipal) : formatarValor(servico.valor);
  const valorComDesc2 = descSecundario ? calcularDesconto(servico.valor, descSecundario) : null;
  
  let subtitulo = servico.descricao;
  let chamadaUrgencia = '';
  let publicoAlvo = 'clientes';

  if (chamadas.includes('urgencia-primeiros')) {
    chamadaUrgencia = 'VAGAS LIMITADAS — Só para os primeiros!';
  } else if (chamadas.includes('vagas-limitadas')) {
    chamadaUrgencia = 'VAGAS LIMITADAS — Garanta a sua!';
  }

  if (chamadas.includes('boas-vindas')) {
    publicoAlvo = 'novos clientes';
  }

  if (datasEspeciais.includes('amanha')) {
    subtitulo = 'Válido exclusivamente para amanhã!';
  }

  return {
    servico,
    descPrincipal,
    descSecundario,
    valorComDesc1,
    valorComDesc2,
    temDoisDescontos,
    subtitulo,
    chamadaUrgencia,
    publicoAlvo,
    pedidoBruto,
    linkAgendamento: CATALOGO.config.linkAgendamento,
    marca: CATALOGO.config.marca,
    local: CATALOGO.config.local,
    produtos: CATALOGO.config.produtos
  };
}

// ==============================================
// 📱 FORMATOS POR PLATAFORMA
// ==============================================
function gerarFeed(c) {
  if (c.temDoisDescontos) {
    return `🔥 PROMOÇÃO RELÂMPAGO — AMANHÃ! 🔥

${c.servico.nome}

✅ ${c.descPrincipal}% DE DESCONTO → ${c.valorComDesc1}
   Para todos os ${c.publicoAlvo}!

✅ ${c.descSecundario}% DE DESCONTO → ${c.valorComDesc2}
   Para os 3 PRIMEIROS de amanhã!
   (Válido para novos OU já cadastrados!)

⏰ ${c.chamadaUrgencia || 'Aproveite enquanto há vaga!'}
✅ ${c.produtos}
✅ Atendimento profissional
✅ ${c.local}

👉 Garanta sua vaga:
${c.linkAgendamento}

#CleanCar #Promoção #EsteticaAutomotiva #MogiDasCruzes`;
  }

  return `🔥 PROMOÇÃO EXCLUSIVA 🔥

${c.servico.nome}

${c.servico.descricao}

${c.descPrincipal 
  ? `De ${formatarValor(c.servico.valor)} → POR ${c.valorComDesc1}
✅ ${c.descPrincipal}% DE DESCONTO!` 
  : `A partir de ${formatarValor(c.servico.valor)}`}

⏰ ${c.subtitulo}
✅ ${c.produtos}
✅ ${c.local}

👉 Agende: ${c.linkAgendamento}

#CleanCar #EsteticaAutomotiva #MogiDasCruzes`;
}

function gerarStory(c) {
  if (c.temDoisDescontos) {
    return `PROMOÇÃO RELÂMPAGO 🔥

${c.servico.nome}

✅ ${c.descPrincipal}%
Novos clientes

✅ ${c.descSecundario}%
3 primeiros de amanhã

Válido para todos!

${c.valorComDesc1} → ${c.valorComDesc2}

${c.chamadaUrgencia}

👉 CLIQUE AQUI
${c.linkAgendamento}`;
  }

  return `${c.servico.nome.toUpperCase()}

${c.descPrincipal ? `${c.descPrincipal}% DE DESCONTO` : 'ESTILO E CUIDADO'}

${c.valorComDesc1}

${c.subtitulo}

👉 Agende: ${c.linkAgendamento}

${c.marca}`;
}

function gerarFacebook(c) {
  return gerarFeed(c) + `

---
💬 Tem dúvidas? Envie mensagem!
📍 ${c.local}
📸 ${CATALOGO.config.instagram}`;
}

function gerarSite(c) {
  return `
<div class="promocao-card">
  <h3>🔥 ${c.servico.nome}</h3>
  <p class="subtitulo">${c.subtitulo}</p>
  ${c.temDoisDescontos 
    ? `<div class="descontos">
         <p><strong>${c.descPrincipal}% OFF</strong> para novos clientes → ${c.valorComDesc1}</p>
         <p><strong>${c.descSecundario}% OFF</strong> para os primeiros → ${c.valorComDesc2}</p>
       </div>` 
    : `<p class="valor">${c.valorComDesc1}</p>`}
  <a href="${c.linkAgendamento}" class="btn-agendar">Agendar Agora</a>
</div>`;
}

function gerarPromptImagem(c) {
  return `
Campanha Clean Car, fundo escuro com luzes neon verde vibrante, carro branco brilhante com gotas de água, pintura reflexiva.
Texto chamativo:
"PROMOÇÃO RELÂMPAGO"
"${c.servico.nome}"
"${c.descPrincipal}% para novos clientes"
"${c.descSecundario ? c.descSecundario + '% para os 3 primeiros' : ''}"
"VAGAS LIMITADAS"
Estilo profissional, cores verde neon e branco sobre escuro, sem marca d'água, sem placa.
  `.trim();
}
