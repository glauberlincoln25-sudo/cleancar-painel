import CONFIG from './config.js';

// O script UMD do supabase-js (carregado no index.html) expõe window.supabase.
// Não podemos declarar outra constante chamada "supabase" aqui, senão dá erro de
// "Cannot access 'supabase' before initialization".
// Se a biblioteca não carregar (internet, bloqueador), o painel abre e avisa em vez de quebrar tudo.
const db = window.supabase?.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
const SEM_DB = { erro: 'Não consegui conectar ao banco. Verifique a internet ou bloqueadores e atualize a página.' };

let usuarioAtual = null;

export async function criarUsuario(username, senha) {
  if (!db) return SEM_DB;
  const { data: existente } = await db
    .from('users')
    .select('username')
    .eq('username', username)
    .maybeSingle();

  if (existente) return { erro: 'Usuário já existe!' };

  // Sem a coluna "role": a tabela atual só tem username e password.
  const { data, error } = await db
    .from('users')
    .insert({ username, password: senha })
    .select()
    .single();

  if (error) return { erro: 'Erro ao criar conta: ' + error.message };
  return { usuario: data };
}

export async function logar(username, senha) {
  if (!db) return SEM_DB;
  const { data, error } = await db
    .from('users')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  if (error || !data || data.password !== senha) {
    return { erro: 'Usuário ou senha incorretos' };
  }

  usuarioAtual = data;
  localStorage.setItem('cleancar_user', data.username);
  localStorage.setItem('cleancar_id', data.id);
  return { usuario: data };
}

export function sair() {
  usuarioAtual = null;
  localStorage.removeItem('cleancar_user');
  localStorage.removeItem('cleancar_id');
}

export async function salvarPedido(tipo, conteudo) {
  const userId = usuarioAtual?.id || localStorage.getItem('cleancar_id');
  if (!userId || !db) return;
  await db.from('pedidos').insert({ user_id: userId, tipo, conteudo });
}

export async function listarPedidos() {
  const userId = localStorage.getItem('cleancar_id');
  if (!userId || !db) return [];
  const { data } = await db
    .from('pedidos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
}
