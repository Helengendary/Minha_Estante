import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const ACCOUNTS_KEY = '@minha_estante:accounts_v1';
const SESSION_KEY = 'minha_estante_session_v1';

// Chave protegida para cada conta.
const credentialsKey = (id) =>
  `minha_estante_credentials_${id}`;

// Recupera as contas cadastradas neste dispositivo.
async function getAccounts() {
  const saved = await AsyncStorage.getItem(ACCOUNTS_KEY);

  if (saved === null) return [];

  const accounts = JSON.parse(saved);

  if (!Array.isArray(accounts)) {
    throw new Error('Dados de contas inválidos.');
  }

  return accounts;
}

// Cria o hash da senha com um salt individual.
// Solução didática para autenticação local.
async function hashPassword(password, salt) {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${password}`
  );
}

// Valida o formato do e-mail.
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// CADASTRO
export async function registerLocal({
  name,
  email,
  password,
}) {
  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedName.length < 2) {
    throw new Error('Informe um nome com pelo menos 2 caracteres.');
  }

  if (!isValidEmail(normalizedEmail)) {
    throw new Error('Informe um e-mail válido.');
  }

  if (password.length < 8) {
    throw new Error('A senha deve ter pelo menos 8 caracteres.');
  }

  const accounts = await getAccounts();

  const exists = accounts.some(
    (account) => account.email === normalizedEmail
  );

  if (exists) {
    throw new Error('Este e-mail já está cadastrado.');
  }

  const user = {
    id: Crypto.randomUUID(),
    name: normalizedName,
    email: normalizedEmail,
    isFirstAccount: accounts.length === 0,
  };

  // Cada conta recebe seu próprio salt.
  const salt = Crypto.randomUUID();
  const passwordHash = await hashPassword(password, salt);

  // Credenciais armazenadas em local protegido.
  await SecureStore.setItemAsync(
    credentialsKey(user.id),
    JSON.stringify({ salt, passwordHash })
  );

  // A lista pública de contas não possui senhas.
  await AsyncStorage.setItem(
    ACCOUNTS_KEY,
    JSON.stringify([...accounts, user])
  );

  // Mantém o novo usuário conectado.
  await SecureStore.setItemAsync(SESSION_KEY, user.id);

  return user;
}

// LOGIN
export async function loginLocal(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = await getAccounts();

  const user = accounts.find(
    (account) => account.email === normalizedEmail
  );

  if (!user) {
    throw new Error('E-mail ou senha incorretos.');
  }

  const savedCredentials = await SecureStore.getItemAsync(
    credentialsKey(user.id)
  );

  if (!savedCredentials) {
    throw new Error(
      'As credenciais desta conta não estão disponíveis neste dispositivo.'
    );
  }

  const { salt, passwordHash } = JSON.parse(savedCredentials);

  const informedHash = await hashPassword(password, salt);

  if (informedHash !== passwordHash) {
    throw new Error('E-mail ou senha incorretos.');
  }

  await SecureStore.setItemAsync(SESSION_KEY, user.id);

  return user;
}

// RECUPERAÇÃO DA SESSÃO
export async function restoreLocalSession() {
  const userId = await SecureStore.getItemAsync(SESSION_KEY);

  if (!userId) return null;

  const accounts = await getAccounts();

  const user = accounts.find(
    (account) => account.id === userId
  );

  if (!user) {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return null;
  }

  return user;
}

// LOGOUT
export async function logoutLocal() {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}