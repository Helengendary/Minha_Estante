import React from 'react';

import {
  Pressable,
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';

import { getCoverUrl } from '../services/OpenLibrary';
import { useFavorites } from '../contexts/BookContext';

export default function BookCard({ book, onPress }) {
  const { isFavorite } = useFavorites();

  const favorite = isFavorite(book.key);
  const coverUrl = getCoverUrl(book.cover_i);

  const author =
    book.author_name?.[0] || 'Autor desconhecido';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        `Abrir detalhes de ${book.title}, de ${author}. ` +
        (favorite ? 'Livro favorito.' : 'Livro não favorito.')
      }
      accessibilityHint="Abre a tela de detalhes do livro"
    >
      <View style={styles.coverContainer}>
        {coverUrl ? (
          <Image
            source={{ uri: coverUrl }}
            style={styles.cover}
            resizeMode="contain"
            accessibilityLabel={`Capa de ${book.title}`}
          />
        ) : (
          <View style={[styles.cover, styles.placeholder]}>
            <Text style={styles.placeholderText}>
              Sem capa
            </Text>
          </View>
        )}

        {favorite && (
          <View style={styles.favoriteBadge}>
            <Text style={styles.heartIcon}>♥</Text>
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {book.title}
      </Text>

      <Text style={styles.author} numberOfLines={2}>
        {author}
      </Text>

      {book.first_publish_year && (
        <Text style={styles.year}>
          {book.first_publish_year}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    minHeight: 270,
    marginBottom: 14,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  cardPressed: {
    opacity: 0.65,
  },
  coverContainer: {
    position: 'relative',
  },
  cover: {
    width: '100%',
    height: 170,
    backgroundColor: '#F3F0EA',
    borderRadius: 8,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#777777',
    fontSize: 13,
  },
  favoriteBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    backgroundColor: '#FFFFFF',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  heartIcon: {
    color: '#C24B53',
    fontSize: 24,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 8,
  },
  author: {
    fontSize: 12,
    color: '#666666',
    marginTop: 5,
  },
  year: {
    fontSize: 11,
    color: '#888888',
    marginTop: 5,
  },
});