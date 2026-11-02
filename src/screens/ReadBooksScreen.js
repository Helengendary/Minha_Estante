import React from 'react';

import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useFavorites } from '../contexts/BookContext';
import { getCoverUrl } from '../services/OpenLibrary';

export default function ReadBooksScreen({ navigation }) {
  const { readBooks } = useFavorites();

  // Abre os detalhes do livro selecionado.
  const handleBookPress = (book) => {
    navigation.navigate('BookDetails', {
      workId: book.key,
      title: book.title,
      authorName:
        book.author_name?.[0] || 'Autor não informado',
      coverId: book.cover_i || null,
      firstPublishYear: book.first_publish_year || null,
    });
  };

  // Exibe a avaliação do livro.
  const renderRating = (rating) => {
    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return (
        <Text style={styles.unrated}>
          Ainda não avaliado
        </Text>
      );
    }

    return (
      <View style={styles.ratingContainer}>
        <Text style={styles.stars}>
          {'★'.repeat(rating)}
          {'☆'.repeat(5 - rating)}
        </Text>

        <Text style={styles.ratingText}>
          {rating}/5
        </Text>
      </View>
    );
  };

  // Renderiza cada livro da lista.
  const renderBook = ({ item }) => {
    const coverUrl = getCoverUrl(item.cover_i);
    const author =
      item.author_name?.[0] || 'Autor não informado';

    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && styles.pressed,
        ]}
        onPress={() => handleBookPress(item)}
        accessibilityRole="button"
        accessibilityLabel={
          `Abrir livro lido: ${item.title}. ` +
          (item.rating
            ? `Avaliação: ${item.rating} de 5 estrelas`
            : 'Ainda não avaliado')
        }
      >
        {coverUrl ? (
          <Image
            source={{ uri: coverUrl }}
            style={styles.cover}
            resizeMode="contain"
            accessibilityLabel={`Capa de ${item.title}`}
          />
        ) : (
          <View style={[styles.cover, styles.placeholder]}>
            <Text style={styles.placeholderText}>
              Sem capa
            </Text>
          </View>
        )}

        <View style={styles.bookInfo}>
          <Text
            style={styles.bookTitle}
            numberOfLines={3}
          >
            {item.title}
          </Text>

          <Text
            style={styles.author}
            numberOfLines={2}
          >
            {author}
          </Text>

          {renderRating(item.rating)}
        </View>
      </Pressable>
    );
  };

  // Mensagem quando não houver livros lidos.
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>☆</Text>

      <Text style={styles.emptyTitle}>
        Nenhum livro lido ainda
      </Text>

      <Text style={styles.emptyDescription}>
        Quando terminar uma leitura, marque o livro
        como lido e registre sua avaliação aqui.
      </Text>

      <Pressable
        style={styles.exploreButton}
        onPress={() => navigation.navigate('Catalog')}
        accessibilityRole="button"
        accessibilityLabel="Explorar catálogo"
      >
        <Text style={styles.exploreButtonText}>
          Explorar livros
        </Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView
      style={styles.container}
      edges={['bottom']}
    >
      <View style={styles.header}>
        <Text
          style={styles.title}
          accessibilityRole="header"
        >
          Minhas Leituras
        </Text>

        <Text style={styles.subtitle}>
          {readBooks.length === 1
            ? '1 livro lido'
            : `${readBooks.length} livros lidos`}
        </Text>
      </View>

      <FlatList
        data={readBooks}
        keyExtractor={(item) => item.key}
        renderItem={renderBook}
        contentContainerStyle={[
          styles.list,
          readBooks.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={renderEmpty}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F4EF',
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 15,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#493726',
  },
  subtitle: {
    fontSize: 14,
    color: '#806E5F',
    marginTop: 6,
  },
  list: {
    paddingHorizontal: 14,
    paddingBottom: 24,
    flexGrow: 1,
  },
  emptyList: {
    justifyContent: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    minHeight: 142,
  },
  pressed: {
    opacity: 0.65,
  },
  cover: {
    width: 78,
    height: 112,
    borderRadius: 6,
    backgroundColor: '#EDE8E0',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 11,
    color: '#777777',
  },
  bookInfo: {
    flex: 1,
    paddingLeft: 14,
    gap: 7,
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#493726',
  },
  author: {
    fontSize: 13,
    color: '#777777',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 5,
  },
  stars: {
    fontSize: 21,
    color: '#D4A32C',
  },
  ratingText: {
    fontSize: 12,
    color: '#665748',
  },
  unrated: {
    color: '#888888',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 65,
    color: '#A47D62',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#493726',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#777777',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#76563C',
    borderRadius: 9,
    paddingHorizontal: 24,
    paddingVertical: 14,
    minHeight: 44,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});