import React from 'react';

import {
  Pressable,
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';

import { getCoverUrl } from '../services/OpenLibrary';

export default function SearchResultCard({ book, onPress }) {
  const coverUrl = getCoverUrl(book.cover_i);

  const author =
    book.author_name?.[0] || 'Autor não informado';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Abrir detalhes de ${book.title}, de ${author}`}
      accessibilityHint="Abre a tela de detalhes do livro"
    >
      {coverUrl ? (
        <Image
          source={{ uri: coverUrl }}
          style={styles.cover}
          resizeMode="contain"
        />
      ) : (
        <View style={[styles.cover, styles.placeholder]}>
          <Text style={styles.placeholderText}>
            Sem capa
          </Text>
        </View>
      )}

      <View style={styles.information}>
        <Text style={styles.title} numberOfLines={3}>
          {book.title}
        </Text>

        <Text style={styles.author} numberOfLines={2}>
          {author}
        </Text>

        {book.first_publish_year && (
          <Text style={styles.year}>
            Primeira publicação: {book.first_publish_year}
          </Text>
        )}
      </View>

      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    minHeight: 135,
    elevation: 1,
  },
  pressed: {
    opacity: 0.65,
  },
  cover: {
    width: 75,
    height: 105,
    borderRadius: 6,
    backgroundColor: '#F3F0EA',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#777777',
    fontSize: 11,
  },
  information: {
    flex: 1,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#493726',
  },
  author: {
    fontSize: 13,
    color: '#666666',
    marginTop: 7,
  },
  year: {
    fontSize: 11,
    color: '#888888',
    marginTop: 8,
  },
  arrow: {
    fontSize: 28,
    color: '#76563C',
  },
});