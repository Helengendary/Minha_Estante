import React, { useRef, useState } from 'react';

import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import BookCard from '../components/BookCard';
import useBooks from '../hooks/useBooks';

import { useFavorites } from '../contexts/BookContext';
import { useAuth } from '../contexts/AuthContext';

export default function CatalogScreen({ navigation }) {
  const { user, signOut } = useAuth();

  const {
    favorites,
    readBooks,
    waitForPendingSaves,
  } = useFavorites();

  const [signingOut, setSigningOut] = useState(false);

  const {
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
  } = useBooks();

  const canLoadMoreRef = useRef(false);

  // Encerra a sessão sem apagar os dados.
  const handleLogout = async () => {
    if (signingOut) return;

    setSigningOut(true);

    try {
      await waitForPendingSaves();
      await signOut();
    } catch (err) {
      console.error('Erro no logout:', err);

      Alert.alert(
        'Erro',
        'Não foi possível sair da conta. Tente novamente.'
      );

      setSigningOut(false);
    }
  };

  // Abre os detalhes de um livro.
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

  // Controla a paginação.
  const handleEndReached = () => {
    if (!canLoadMoreRef.current) return;

    canLoadMoreRef.current = false;
    loadMore();
  };

  // Exibe o rodapé da lista.
  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View
          style={styles.footer}
          accessibilityLiveRegion="polite"
        >
          <ActivityIndicator
            size="small"
            color="#76563C"
            accessibilityLabel="Carregando mais livros"
          />

          <Text style={styles.footerText}>
            Carregando mais livros...
          </Text>
        </View>
      );
    }

    if (pageError) {
      return (
        <View
          style={styles.footer}
          accessibilityLiveRegion="polite"
        >
          <Text style={styles.errorText}>
            {pageError}
          </Text>

          <Pressable
            onPress={loadMore}
            style={styles.retryButton}
            accessibilityRole="button"
            accessibilityLabel="Tentar carregar mais livros novamente"
          >
            <Text style={styles.retryText}>
              Tentar novamente
            </Text>
          </Pressable>
        </View>
      );
    }

    if (!hasMore && books.length > 0) {
      return (
        <Text style={styles.footerText}>
          Você chegou ao fim da lista!
        </Text>
      );
    }

    return null;
  };

  // Erro de atualização mantendo livros anteriores.
  const renderRefreshError = () => {
    if (!error || books.length === 0) return null;

    return (
      <View
        style={styles.errorBanner}
        accessibilityLiveRegion="polite"
      >
        <Text style={styles.errorBannerText}>
          {error}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={() => loadFirstPage(true)}
          accessibilityRole="button"
          accessibilityLabel="Tentar atualizar o catálogo novamente"
        >
          <Text style={styles.retryText}>
            Tentar novamente
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userRow}>
          <Text style={styles.greeting} numberOfLines={1}>
            Olá, {user?.name?.split(' ')[0] || 'leitor'}!
          </Text>

          <Pressable
            onPress={handleLogout}
            disabled={signingOut}
            style={styles.logoutButton}
            accessibilityRole="button"
            accessibilityLabel="Sair da conta"
            accessibilityState={{
              disabled: signingOut,
            }}
          >
            <Text style={styles.logoutText}>
              {signingOut ? 'Saindo...' : 'Sair'}
            </Text>
          </Pressable>
        </View>

        <Text
          style={styles.title}
          accessibilityRole="header"
        >
          Minha Estante
        </Text>

        <Text style={styles.subtitle}>
          Descubra sua próxima leitura
        </Text>

        <View style={styles.actions}>
          <Pressable
            style={styles.searchButton}
            onPress={() => navigation.navigate('Search')}
            accessibilityRole="button"
            accessibilityLabel="Buscar livros"
          >
            <Text style={styles.searchButtonText}>
              Buscar livros
            </Text>
          </Pressable>

          <Pressable
            style={styles.favoritesButton}
            onPress={() => navigation.navigate('Favorites')}
            accessibilityRole="button"
            accessibilityLabel={
              `Abrir favoritos. ${favorites.length} livros salvos`
            }
          >
            <Text style={styles.favoritesButtonText}>
              ♥ Favoritos ({favorites.length})
            </Text>
          </Pressable>

          <Pressable
            style={styles.readButton}
            onPress={() => navigation.navigate('ReadBooks')}
            accessibilityRole="button"
            accessibilityLabel={
              `Abrir livros lidos. ${readBooks.length} livros`
            }
          >
            <Text style={styles.readButtonText}>
              ✓ Lidos ({readBooks.length})
            </Text>
          </Pressable>
        </View>
      </View>

      {loading && books.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#76563C"
            accessibilityLabel="Carregando catálogo"
          />

          <Text>Carregando livros...</Text>
        </View>
      ) : error && books.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>
            {error}
          </Text>

          <Pressable
            onPress={() => loadFirstPage()}
            style={styles.retryButton}
            accessibilityRole="button"
            accessibilityLabel="Tentar carregar catálogo novamente"
          >
            <Text style={styles.retryText}>
              Tentar novamente
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          {renderRefreshError()}

          <FlatList
            data={books}
            extraData={favorites}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <BookCard
                book={item}
                onPress={() => handleBookPress(item)}
              />
            )}
            numColumns={2}
            columnWrapperStyle={styles.columns}
            contentContainerStyle={styles.list}
            refreshing={refreshing}
            onRefresh={refresh}
            onScrollBeginDrag={() => {
              canLoadMoreRef.current = true;
            }}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.4}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Nenhum livro encontrado.
              </Text>
            }
          />
        </>
      )}
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
    paddingTop: 12,
    paddingBottom: 14,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  greeting: {
    flex: 1,
    fontSize: 14,
    color: '#76563C',
    fontWeight: 'bold',
  },
  logoutButton: {
    minHeight: 44,
    paddingHorizontal: 15,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#B52D2D',
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 13,
    color: '#B52D2D',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#493726',
  },
  subtitle: {
    fontSize: 13,
    color: '#665748',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  searchButton: {
    backgroundColor: '#76563C',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 9,
    minHeight: 44,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  favoritesButton: {
    borderWidth: 1,
    borderColor: '#C24B53',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 9,
    minHeight: 44,
    justifyContent: 'center',
  },
  favoritesButtonText: {
    color: '#C24B53',
    fontSize: 13,
    fontWeight: 'bold',
  },
  readButton: {
    borderWidth: 1,
    borderColor: '#51765A',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 9,
    minHeight: 44,
    justifyContent: 'center',
  },
  readButtonText: {
    color: '#51765A',
    fontSize: 13,
    fontWeight: 'bold',
  },
  list: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  columns: {
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    textAlign: 'center',
    paddingVertical: 12,
    color: '#665748',
  },
  errorText: {
    textAlign: 'center',
    color: '#B52D2D',
    margin: 12,
  },
  retryButton: {
    backgroundColor: '#76563C',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  errorBanner: {
    backgroundColor: '#FFF1E8',
    padding: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E9C7B6',
  },
  errorBannerText: {
    color: '#8A2929',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    padding: 24,
    color: '#665748',
  },
});