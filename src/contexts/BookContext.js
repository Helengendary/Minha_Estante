import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';

import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from 'react-native';

import {
  loadLibrary,
  saveLibrary,
} from '../services/storage';

const BooksContext = createContext(null);

export function BooksProvider({
  children,
  userId,
  isFirstAccount = false,
}) {
  const [favorites, setFavorites] = useState([]);
  const [readBooks, setReadBooks] = useState([]);

  const [isHydrated, setIsHydrated] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');

  const [loadRetry, setLoadRetry] = useState(0);
  const [saveRetry, setSaveRetry] = useState(0);

  // Mantém as gravações em sequência.
  const writeQueueRef = useRef(Promise.resolve());

  // 1. Recupera a estante do usuário atual.
  useEffect(() => {
    let active = true;

    const initializeLibrary = async () => {
      setIsHydrated(false);
      setLoadError('');

      try {
        const savedData = await loadLibrary(
          userId,
          isFirstAccount
        );

        if (!active) return;

        setFavorites(savedData.favorites);
        setReadBooks(savedData.readBooks);
        setIsHydrated(true);
      } catch (error) {
        console.error('Erro ao recuperar estante:', error);

        if (active) {
          setLoadError(
            'Não foi possível recuperar sua estante.'
          );
        }
      }
    };

    initializeLibrary();

    return () => {
      active = false;
    };
  }, [userId, isFirstAccount, loadRetry]);

  // 2. Salva as alterações do usuário atual.
  useEffect(() => {
    if (!isHydrated || !userId) return;

    let active = true;

    const dataToSave = {
      favorites,
      readBooks,
    };

    const nextWrite = writeQueueRef.current
      .catch(() => {})
      .then(() => saveLibrary(userId, dataToSave));

    writeQueueRef.current = nextWrite;

    nextWrite
      .then(() => {
        if (active) setSaveError('');
      })
      .catch((error) => {
        console.error('Erro ao salvar estante:', error);

        if (active) {
          setSaveError(
            'Não foi possível salvar sua estante.'
          );
        }
      });

    return () => {
      active = false;
    };
  }, [
    userId,
    favorites,
    readBooks,
    isHydrated,
    saveRetry,
  ]);

  // Aguarda o término das gravações pendentes.
  const waitForPendingSaves = useCallback(async () => {
    await writeQueueRef.current;
  }, []);

  // 3. Favorita ou desfavorita um livro.
  const toggleFavorite = useCallback((book) => {
    if (!book?.key) return;

    setFavorites((current) => {
      const alreadyFavorite = current.some(
        (item) => item.key === book.key
      );

      if (alreadyFavorite) {
        return current.filter(
          (item) => item.key !== book.key
        );
      }

      return [...current, book];
    });
  }, []);

  // 4. Verifica se um livro é favorito.
  const isFavorite = useCallback(
    (workId) =>
      favorites.some((item) => item.key === workId),
    [favorites]
  );

  // 5. Marca um livro como lido.
  const markRead = useCallback((book) => {
    if (!book?.key) return;

    setReadBooks((current) => {
      if (current.some((item) => item.key === book.key)) {
        return current;
      }

      return [...current, { ...book, rating: null }];
    });
  }, []);

  // 6. Remove um livro da lista de lidos.
  const removeRead = useCallback((workId) => {
    setReadBooks((current) =>
      current.filter((item) => item.key !== workId)
    );
  }, []);

  // 7. Salva ou atualiza a nota de 1 a 5.
  const rateBook = useCallback((book, rating) => {
    if (
      !book?.key ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return;
    }

    setReadBooks((current) => {
      const exists = current.some(
        (item) => item.key === book.key
      );

      if (exists) {
        return current.map((item) =>
          item.key === book.key
            ? { ...item, rating }
            : item
        );
      }

      return [...current, { ...book, rating }];
    });
  }, []);

  // 8. Verifica se o livro foi lido.
  const isRead = useCallback(
    (workId) =>
      readBooks.some((item) => item.key === workId),
    [readBooks]
  );

  // 9. Recupera a avaliação do livro.
  const getRating = useCallback(
    (workId) => {
      const book = readBooks.find(
        (item) => item.key === workId
      );

      return book?.rating ?? null;
    },
    [readBooks]
  );

  // Compartilha todas as funcionalidades.
  const value = useMemo(
    () => ({
      favorites,
      readBooks,
      toggleFavorite,
      isFavorite,
      markRead,
      removeRead,
      rateBook,
      isRead,
      getRating,
      waitForPendingSaves,
    }),
    [
      favorites,
      readBooks,
      toggleFavorite,
      isFavorite,
      markRead,
      removeRead,
      rateBook,
      isRead,
      getRating,
      waitForPendingSaves,
    ]
  );

  // Não mostra a estante antes de recuperar os dados.
  if (!isHydrated && !loadError) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#76563C"
        />

        <Text style={styles.infoText}>
          Recuperando sua estante...
        </Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          {loadError}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={() => setLoadRetry((n) => n + 1)}
          accessibilityRole="button"
        >
          <Text style={styles.retryText}>
            Tentar novamente
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <BooksContext.Provider value={value}>
      <View style={styles.appContainer}>
        {saveError ? (
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              {saveError}
            </Text>

            <Pressable
              onPress={() => setSaveRetry((n) => n + 1)}
              accessibilityRole="button"
              style={styles.warningButton}
            >
              <Text style={styles.warningButtonText}>
                Tentar salvar
              </Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.appContent}>
          {children}
        </View>
      </View>
    </BooksContext.Provider>
  );
}

// Permite acessar a estante em qualquer tela.
export function useFavorites() {
  const context = useContext(BooksContext);

  if (!context) {
    throw new Error(
      'useFavorites deve ser usado dentro de BooksProvider'
    );
  }

  return context;
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
  appContent: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F4EF',
    padding: 24,
    gap: 14,
  },
  infoText: {
    color: '#665748',
    textAlign: 'center',
  },
  errorText: {
    color: '#B52D2D',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#76563C',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  warning: {
    backgroundColor: '#FFF1DB',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  warningText: {
    color: '#74431D',
    flex: 1,
    fontSize: 13,
  },
  warningButton: {
    padding: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  warningButtonText: {
    color: '#74431D',
    fontWeight: 'bold',
  },
});