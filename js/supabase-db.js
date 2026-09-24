import CONFIG from './config.js';

// Se a biblioteca não carregar (internet, bloqueador), o painel abre e avisa em vez de quebrar tudo.
const db = window.supabase?.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
const SEM_DB = { erro: 'Não consegui conectar ao banco. Verifique a internet ou bloqueadores e atualize a página.' };

function traduz(msg = '') {
  if (/invalid login/i.test(msg)) return 'E-mail ou senha incorretos';
  if (/not confirmed/i.test(msg)) return 'Confirme o e-mail antes de entrar';
  if (/signups? (not allowed|disabled)/i.test(msg)) return 'Cadastro fechado. Peça acesso ao administrador.';
  if (/already registered/i.test(msg)) return 'Este e-mail já tem conta';
  if (/password/i.test(msg)) return 'Senha fraca: use pelo menos 6 caracteres';
  return msg;
}

// Login novo (Supabase Auth): e-mail + senha, com senha protegida pelo Supabase.
// Login antigo (sem @): só continua funcionando até o RLS ser ativado; depois é bloqueado pelo banco.
export async function logar(login, senha) {
  if (!db) return SEM_DB;
  if (login.includes('@')) {
    const { data, error } = await db.auth.signInWithPassword({ email: login, password: senha });
    if (error) return { erro: traduz(error.message) };
    return { usuario: { id: data.user.id, username: data.user.email } };
  }
  const { data } = await db.from('users').select('*').eq('username', login).maybeSingle();
  if (!data || data.password !== senha) return { erro: 'Usuário ou senha incorretos. Se o painel foi atualizado, entre com seu e-mail.' };
  localStorage.setItem('cleancar_user', data.username);
  localStorage.setItem('cleancar_id', data.id);
  return { usuario: data };
}

// Contas novas só nascem no Supabase Auth (nunca mais senha em texto puro).
export async function criarUsuario(email, senha) {
  if (!db) return SEM_DB;
  const { error } = await db.auth.signUp({ email, password: senha });
  return error ? { erro: traduz(error.message) } : { ok: true };
}

export async function sessaoAtual() {
  if (db) {
    const { data } = await db.auth.getSession();
    const u = data?.session?.user;
    if (u) return { id: u.id, username: u.email };
  }
  const id = localStorage.getItem('cleancar_id');
  const username = localStorage.getItem('cleancar_user');
  return id && username ? { id, username } : null;
}

export function sair() {
  db?.auth.signOut();
  localStorage.removeItem('cleancar_user');
  localStorage.removeItem('cleancar_id');
}

export async function salvarPedido(tipo, conteudo) {
  const u = await sessaoAtual();
  if (!u || !db) return false;
  const { error } = await db.from('pedidos').insert({ user_id: u.id, tipo, conteudo });
  return !error;
}

export async function listarPedidos() {
  const u = await sessaoAtual();
  if (!u || !db) return [];
  const { data } = await db.from('pedidos').select('*').eq('user_id', u.id).order('created_at', { ascending: false });
  return data || [];
}
