import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

import {
  getBooks,
  BOOKS_PER_PAGE,
} from '../services/OpenLibrary';

export default function useBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [pageError, setPageError] = useState('');
  const [hasMore, setHasMore] = useState(true);

  // Guarda a última página carregada.
  const pageRef = useRef(0);

  // Evita requisições simultâneas.
  const requestingRef = useRef(false);

  const checkHasMore = (data, currentPage) => {
    const items = data.docs || [];
    const total = data.numFound ?? data.num_found;

    return (
      items.length === BOOKS_PER_PAGE &&
      (typeof total !== 'number' ||
        currentPage * BOOKS_PER_PAGE < total)
    );
  };

  // Carrega ou atualiza a primeira página.
  const loadFirstPage = useCallback(async (isRefresh = false) => {
    if (requestingRef.current) return;

    requestingRef.current = true;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');
    setPageError('');

    try {
      const data = await getBooks(1);
      const newBooks = data.docs || [];

      setBooks(newBooks);
      pageRef.current = 1;

      const total = data.numFound ?? data.num_found;

      setHasMore(
        newBooks.length === BOOKS_PER_PAGE &&
        (typeof total !== 'number' ||
          BOOKS_PER_PAGE < total)
      );
    } catch (err) {
      console.error('Erro ao carregar livros:', err);
      setError('Não foi possível carregar os livros.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      requestingRef.current = false;
    }
  }, []);

  // Carrega a próxima página, sem apagar as anteriores.
  const loadMore = useCallback(async () => {
    if (
      requestingRef.current ||
      !hasMore ||
      pageRef.current === 0
    ) {
      return;
    }

    requestingRef.current = true;
    setLoadingMore(true);
    setPageError('');

    try {
      const nextPage = pageRef.current + 1;
      const data = await getBooks(nextPage);
      const newBooks = data.docs || [];

      // Evita duplicar livros na lista.
      setBooks((currentBooks) => {
        const existingKeys = new Set(
          currentBooks.map((book) => book.key)
        );

        const uniqueBooks = newBooks.filter((book) => {
          if (existingKeys.has(book.key)) return false;

          existingKeys.add(book.key);
          return true;
        });

        return [...currentBooks, ...uniqueBooks];
      });

      pageRef.current = nextPage;
      setHasMore(checkHasMore(data, nextPage));
    } catch (err) {
      console.error('Erro na paginação:', err);
      setPageError('Não foi possível carregar mais livros.');
    } finally {
      setLoadingMore(false);
      requestingRef.current = false;
    }
  }, [hasMore]);

  // Busca os livros ao abrir a tela.
  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const refresh = () => loadFirstPage(true);

  return {
    books,
    loading,
    loadingMore,
    refreshing,
    error,
    pageError,
    hasMore,
    loadFirstPage,
    loadMore,
    refresh,
  };
}