import React, { useEffect, useRef, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { searchBooks } from '../services/OpenLibrary';
import SearchResultCard from '../components/SearchResultCard';

const FILTERS = [
  { label: 'Todos', value: 'all' },
  { label: 'Por título', value: 'title' },
  { label: 'Por autor', value: 'author' },
];

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('all');

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [submittedTerm, setSubmittedTerm] = useState('');

  // Identifica a pesquisa mais recente.
  const requestIdRef = useRef(0);

  // Invalida requisições antigas ao sair da tela.
  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
    };
  }, []);

  // Executa a pesquisa usando a API.
  const handleSearch = async () => {
    const term = query.trim();
    const currentRequest = ++requestIdRef.current;

    if (!term) {
      setError('Digite o nome de um livro ou autor.');
      setResults([]);
      setHasSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);
    setSubmittedTerm(term);
    setHasSearched(true);

    try {
      const data = await searchBooks(term, searchType);

      // Ignora resultados de pesquisas anteriores.
      if (currentRequest !== requestIdRef.current) {
        return;
      }

      setResults(data.docs || []);
    } catch (err) {
      if (currentRequest !== requestIdRef.current) {
        return;
      }

      console.error('Erro ao pesquisar livros:', err);
      setError('Não foi possível realizar a pesquisa.');
    } finally {
      if (currentRequest === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  // Abre a tela de detalhes.
  const handleBookPress = (book) => {
    navigation.navigate('BookDetails', {
      workId: book.key,
      title: book.title,
      authorName: book.author_name?.[0] || 'Autor não informado',
      coverId: book.cover_i || null,
      firstPublishYear: book.first_publish_year || null,
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#76563C" />
          <Text style={styles.infoText}>
            Pesquisando livros...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>

          {hasSearched && (
            <Pressable
              onPress={handleSearch}
              style={styles.retryButton}
              accessibilityRole="button"
            >
              <Text style={styles.retryText}>
                Tentar novamente
              </Text>
            </Pressable>
          )}
        </View>
      );
    }

    if (!hasSearched) {
      return (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>
            Encontre sua próxima leitura!
          </Text>
          <Text style={styles.infoText}>
            Digite um título ou o nome de um autor
            para começar sua pesquisa.
          </Text>
        </View>
      );
    }

    if (results.length === 0) {
      return (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>
            Nenhum livro encontrado
          </Text>
          <Text style={styles.infoText}>
            Tente pesquisar outro título ou autor.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsCount}>
          Exibindo {results.length} resultado(s) para
          {' "'}{submittedTerm}{'"'}
        </Text>

        <FlatList
          data={results}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <SearchResultCard
              book={item}
              onPress={() => handleBookPress(item)}
            />
          )}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      </View>
    );
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['bottom']}
    >
      <View style={styles.searchArea}>
        <Text style={styles.title}>
          O que você quer ler?
        </Text>

        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Digite o livro ou autor..."
          placeholderTextColor="#888888"
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          autoCorrect={false}
          accessibilityLabel="Campo de pesquisa de livros"
        />

        <View style={styles.filters}>
          {FILTERS.map((filter) => {
            const selected = searchType === filter.value;

            return (
              <Pressable
                key={filter.value}
                onPress={() => setSearchType(filter.value)}
                style={[
                  styles.filterButton,
                  selected && styles.filterSelected,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`Filtro ${filter.label}`}
              >
                <Text
                  style={[
                    styles.filterText,
                    selected && styles.filterTextSelected,
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={[
            styles.searchButton,
            loading && styles.disabledButton,
          ]}
          onPress={handleSearch}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Buscar livros"
        >
          <Text style={styles.searchButtonText}>
            Buscar
          </Text>
        </Pressable>
      </View>

      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F4EF',
  },
  searchArea: {
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAE5DE',
  },
  title: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#493726',
    marginBottom: 15,
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#C8BFB4',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#333333',
    backgroundColor: '#F9F7F4',
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
    marginBottom: 16,
  },
  filterButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 15,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#C8BFB4',
    backgroundColor: '#FFFFFF',
  },
  filterSelected: {
    backgroundColor: '#76563C',
    borderColor: '#76563C',
  },
  filterText: {
    color: '#594735',
    fontSize: 13,
  },
  filterTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  searchButton: {
    backgroundColor: '#76563C',
    padding: 14,
    borderRadius: 9,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#493726',
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#777777',
    textAlign: 'center',
  },
  errorText: {
    color: '#B52D2D',
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#76563C',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    minHeight: 44,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsCount: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8,
    fontSize: 13,
    color: '#777777',
  },
  list: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 25,
  },
});