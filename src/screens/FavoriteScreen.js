import React from 'react';

import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import BookCard from '../components/BookCard';
import { useFavorites } from '../contexts/BookContext';

export default function FavoritesScreen({ navigation }) {
  const { favorites } = useFavorites();

  // Abre os detalhes de um livro favorito.
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

  // Mensagem exibida quando não houver favoritos.
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.heartIcon}>♡</Text>

      <Text style={styles.emptyTitle}>
        Sua estante de favoritos está vazia
      </Text>

      <Text style={styles.emptyDescription}>
        Explore nosso catálogo e salve os livros que
        mais despertarem seu interesse.
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
          Meus Favoritos
        </Text>

        <Text style={styles.subtitle}>
          {favorites.length === 1
            ? '1 livro favorito'
            : `${favorites.length} livros favoritos`}
        </Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <BookCard
            book={item}
            onPress={() => handleBookPress(item)}
          />
        )}
        numColumns={2}
        columnWrapperStyle={
          favorites.length > 0 ? styles.columns : undefined
        }
        contentContainerStyle={[
          styles.list,
          favorites.length === 0 && styles.emptyList,
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
    paddingBottom: 18,
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
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  columns: {
    justifyContent: 'space-between',
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  heartIcon: {
    fontSize: 66,
    color: '#A47D62',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 19,
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
    justifyContent: 'center',
  },
  exploreButtonText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});