import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getBookDetails,
  getCoverUrl,
} from '../services/OpenLibrary';

import { useFavorites } from '../contexts/BookContext';
import RatingStars from '../components/RatingStars';

// Converte a descrição da API em texto simples.
function cleanDescription(description) {
  if (!description) {
    return 'Descrição não disponível para este livro.';
  }

  const text =
    typeof description === 'string'
      ? description
      : description.value;

  if (typeof text !== 'string') {
    return 'Descrição não disponível para este livro.';
  }

  const cleaned = text
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return cleaned || 'Descrição não disponível para este livro.';
}

export default function BookDetailsScreen({
  route,
  navigation,
}) {
  const {
    workId,
    title,
    authorName,
    coverId,
    firstPublishYear,
  } = route.params;

  // Acessa o contexto global da estante.
  const {
    toggleFavorite,
    isFavorite,
    markRead,
    removeRead,
    rateBook,
    isRead,
    getRating,
  } = useFavorites();

  const favorite = isFavorite(workId);
  const read = isRead(workId);
  const rating = getRating(workId);

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // Carrega os detalhes completos do livro.
  useEffect(() => {
    let active = true;

    const loadDetails = async () => {
      setLoading(true);
      setError('');
      setBook(null);

      try {
        const data = await getBookDetails(workId);

        if (active) {
          setBook(data);
        }
      } catch (err) {
        console.error('Erro ao carregar detalhes:', err);

        if (active) {
          setError(
            'Não foi possível carregar os detalhes do livro.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDetails();

    return () => {
      active = false;
    };
  }, [workId, retryCount]);

  // Atualiza o título do cabeçalho.
  useEffect(() => {
    navigation.setOptions({
      title: book?.title || title || 'Detalhes do livro',
    });
  }, [navigation, book?.title, title]);

  // Prepara os dados para salvar no contexto.
  const getSavedBook = () => {
    if (!book) return null;

    const validCover = Array.isArray(book.covers)
      ? book.covers.find(
          (id) => Number.isInteger(id) && id > 0
        )
      : null;

    return {
      key: workId,
      title: book.title || title,
      author_name: authorName ? [authorName] : [],
      cover_i: validCover || coverId || null,
      first_publish_year: firstPublishYear || null,
    };
  };

  // Favorita ou desfavorita.
  const handleFavoritePress = () => {
    const savedBook = getSavedBook();

    if (savedBook) {
      toggleFavorite(savedBook);
    }
  };

  // Marca o livro como lido ou remove da lista.
  const handleReadPress = () => {
    if (read) {
      removeRead(workId);
      return;
    }

    const savedBook = getSavedBook();

    if (savedBook) {
      markRead(savedBook);
    }
  };

  // Salva ou altera a avaliação.
  const handleRatingChange = (newRating) => {
    if (!read) return;

    const savedBook = getSavedBook();

    if (savedBook) {
      rateBook(savedBook, newRating);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={['bottom']}>
        <ActivityIndicator size="large" color="#76563C" />
        <Text style={styles.infoText}>
          Carregando detalhes...
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !book) {
    return (
      <SafeAreaView style={styles.center} edges={['bottom']}>
        <Text style={styles.errorText}>
          {error || 'Livro não encontrado.'}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={() => setRetryCount((n) => n + 1)}
          accessibilityRole="button"
        >
          <Text style={styles.retryText}>
            Tentar novamente
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const savedBook = getSavedBook();
  const imageUrl = getCoverUrl(savedBook?.cover_i);

  const description = cleanDescription(book.description);

  const subjects = Array.isArray(book.subjects)
    ? book.subjects.slice(0, 8)
    : [];

  return (
    <SafeAreaView
      style={styles.container}
      edges={['bottom']}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Informações principais */}
        <View style={styles.coverContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.cover}
              resizeMode="contain"
              accessibilityLabel={`Capa de ${book.title || title}`}
            />
          ) : (
            <View style={[styles.cover, styles.placeholder]}>
              <Text style={styles.infoText}>
                Sem capa
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.title} accessibilityRole="header">
          {book.title || title}
        </Text>

        <Text style={styles.author}>
          {authorName || 'Autor não informado'}
        </Text>

        {(book.first_publish_date || firstPublishYear) && (
          <Text style={styles.year}>
            Primeira publicação:{' '}
            {book.first_publish_date || firstPublishYear}
          </Text>
        )}

        {/* Favoritos */}
        <Pressable
          style={[
            styles.favoriteButton,
            favorite && styles.favoriteButtonActive,
          ]}
          onPress={handleFavoritePress}
          accessibilityRole="button"
          accessibilityState={{ selected: favorite }}
          accessibilityLabel={
            favorite
              ? 'Remover dos favoritos'
              : 'Adicionar aos favoritos'
          }
        >
          <Text
            style={[
              styles.favoriteText,
              favorite && styles.favoriteTextActive,
            ]}
          >
            {favorite
              ? '♥  Remover dos favoritos'
              : '♡  Adicionar aos favoritos'}
          </Text>
        </Pressable>

        <View style={styles.divider} />

        {/* Seção de livros lidos */}
        <Text style={styles.sectionTitle}>
          Minha Leitura
        </Text>

        <Pressable
          style={[
            styles.readButton,
            read && styles.readButtonActive,
          ]}
          onPress={handleReadPress}
          accessibilityRole="button"
          accessibilityState={{ selected: read }}
          accessibilityLabel={
            read
              ? 'Remover livro dos lidos'
              : 'Marcar livro como lido'
          }
        >
          <Text
            style={[
              styles.readButtonText,
              read && styles.readButtonTextActive,
            ]}
          >
            {read
              ? '✓  Lido — Remover da lista'
              : '✓  Marcar como lido'}
          </Text>
        </Pressable>

        <View style={styles.ratingSection}>
          <Text style={styles.ratingTitle}>
            Minha avaliação
          </Text>

          <RatingStars
            value={rating || 0}
            onChange={handleRatingChange}
            disabled={!read}
          />

          <Text style={styles.ratingDescription}>
            {!read
              ? 'Marque o livro como lido para avaliá-lo.'
              : rating
              ? `Sua avaliação: ${rating} de 5 estrelas`
              : 'Selecione de 1 a 5 estrelas.'}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Descrição */}
        <Text style={styles.sectionTitle}>
          Sinopse / Descrição
        </Text>

        <Text style={styles.description}>
          {description}
        </Text>

        {/* Assuntos */}
        {subjects.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Assuntos relacionados
            </Text>

            <View style={styles.subjectContainer}>
              {subjects.map((subject) => (
                <View
                  key={subject}
                  style={styles.subjectTag}
                >
                  <Text style={styles.subjectText}>
                    {subject}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F4EF',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F7F4EF',
    gap: 14,
  },
  content: {
    paddingHorizontal: 22,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  coverContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  cover: {
    width: 205,
    height: 290,
    borderRadius: 10,
    backgroundColor: '#EDE8E0',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#493726',
    textAlign: 'center',
  },
  author: {
    fontSize: 16,
    color: '#76563C',
    textAlign: 'center',
    marginTop: 10,
  },
  year: {
    fontSize: 13,
    color: '#777777',
    textAlign: 'center',
    marginTop: 8,
  },
  favoriteButton: {
    marginTop: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: '#C24B53',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: '#C24B53',
  },
  favoriteText: {
    color: '#C24B53',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  favoriteTextActive: {
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#DED8CF',
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#493726',
    marginBottom: 14,
  },
  readButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#51765A',
    borderRadius: 10,
    minHeight: 50,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readButtonActive: {
    backgroundColor: '#51765A',
  },
  readButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#51765A',
    textAlign: 'center',
  },
  readButtonTextActive: {
    color: '#FFFFFF',
  },
  ratingSection: {
    alignItems: 'center',
    marginTop: 22,
    gap: 8,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#493726',
  },
  ratingDescription: {
    color: '#777777',
    fontSize: 13,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#444444',
    lineHeight: 24,
    marginBottom: 20,
  },
  subjectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectTag: {
    backgroundColor: '#E9DFD3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  subjectText: {
    fontSize: 12,
    color: '#594735',
  },
  infoText: {
    color: '#666666',
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
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});