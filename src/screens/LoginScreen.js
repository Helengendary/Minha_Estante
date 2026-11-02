import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (loading) return;

    if (!email.trim() || !password) {
      setError('Preencha o e-mail e a senha.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
      // A navegação acontecerá automaticamente.
    } catch (err) {
      setError(err.message || 'Não foi possível entrar.');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.icon}>📚</Text>

          <Text
            style={styles.title}
            accessibilityRole="header"
          >
            Minha Estante
          </Text>

          <Text style={styles.subtitle}>
            Entre na sua conta para continuar sua leitura.
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>E-mail</Text>

            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="seuemail@exemplo.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
              accessibilityLabel="E-mail"
            />

            <Text style={styles.label}>Senha</Text>

            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Digite sua senha"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              accessibilityLabel="Senha"
            />

            {error ? (
              <Text style={styles.error}>{error}</Text>
            ) : null}

            <Pressable
              style={[
                styles.button,
                loading && styles.disabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Entrar na conta"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>
                  Entrar
                </Text>
              )}
            </Pressable>

            <Pressable
              style={styles.linkButton}
              onPress={() => navigation.navigate('Register')}
              accessibilityRole="button"
            >
              <Text style={styles.linkText}>
                Não possui conta? Cadastre-se
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F4EF',
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 26,
  },
  icon: {
    fontSize: 54,
    textAlign: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#493726',
    textAlign: 'center',
  },
  subtitle: {
    color: '#806E5F',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 23,
    marginTop: 12,
    marginBottom: 32,
  },
  form: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#493726',
  },
  input: {
    minHeight: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C8BFB4',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 15,
    color: '#333333',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#76563C',
    minHeight: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.6,
  },
  error: {
    color: '#B52D2D',
    textAlign: 'center',
    fontSize: 13,
  },
  linkButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  linkText: {
    color: '#76563C',
    fontSize: 14,
    fontWeight: 'bold',
  },
});