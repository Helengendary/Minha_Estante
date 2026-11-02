import AsyncStorage from '@react-native-async-storage/async-storage';

// Chave utilizada antes da implementação do login.
const LEGACY_KEY = '@minha_estante:library_v1';

// Nova chave individual para cada usuário.
const getUserKey = (userId) =>
  `@minha_estante:library_v2:${userId}`;

const emptyLibrary = () => ({
  favorites: [],
  readBooks: [],
});

// Valida os dados armazenados.
function parseLibrary(saved) {
  const data = JSON.parse(saved);

  if (!data || typeof data !== 'object') {
    throw new Error('Dados da estante inválidos.');
  }

  const favorites = data.favorites ?? [];
  const readBooks = data.readBooks ?? [];

  if (
    !Array.isArray(favorites) ||
    !Array.isArray(readBooks)
  ) {
    throw new Error('Formato da estante inválido.');
  }

  const validBook = (book) =>
    book &&
    typeof book === 'object' &&
    typeof book.key === 'string';

  if (
    !favorites.every(validBook) ||
    !readBooks.every(validBook)
  ) {
    throw new Error('Existem livros inválidos na estante.');
  }

  return { favorites, readBooks };
}

// Recupera a estante do usuário autenticado.
export async function loadLibrary(
  userId,
  isFirstAccount = false
) {
  if (!userId) {
    throw new Error('Usuário não identificado.');
  }

  const userKey = getUserKey(userId);
  const saved = await AsyncStorage.getItem(userKey);

  // Se já possui estante, carrega os dados individuais.
  if (saved !== null) {
    return parseLibrary(saved);
  }

  // Importa a estante antiga somente para a primeira conta.
  if (isFirstAccount) {
    const legacyData = await AsyncStorage.getItem(LEGACY_KEY);

    if (legacyData !== null) {
      const migratedLibrary = parseLibrary(legacyData);

      await AsyncStorage.setItem(
        userKey,
        JSON.stringify(migratedLibrary)
      );

      return migratedLibrary;
    }
  }

  // Conta nova sem livros.
  return emptyLibrary();
}

// Salva apenas a estante do usuário identificado.
export async function saveLibrary(userId, data) {
  if (!userId) {
    throw new Error('Usuário não identificado.');
  }

  const jsonData = JSON.stringify({
    favorites: data.favorites,
    readBooks: data.readBooks,
  });

  await AsyncStorage.setItem(
    getUserKey(userId),
    jsonData
  );
}