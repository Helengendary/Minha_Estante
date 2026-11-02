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

export default function RegisterScreen() {
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (loading) return;

    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError('Preencha todos os campos.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signUp(name, email, password);
      // O usuário será levado ao catálogo automaticamente.
    } catch (err) {
      setError(err.message || 'Não foi possível cadastrar.');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['bottom']}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text
            style={styles.title}
            accessibilityRole="header"
          >
            Crie sua conta
          </Text>

          <Text style={styles.subtitle}>
            Organize suas leituras em um só lugar.
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Nome completo</Text>

            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Seu nome"
              autoCapitalize="words"
              autoComplete="name"
              accessibilityLabel="Nome completo"
            />

            <Text style={styles.label}>E-mail</Text>

            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="seuemail@exemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              accessibilityLabel="E-mail"
            />

            <Text style={styles.label}>Senha</Text>

            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo de 8 caracteres"
              secureTextEntry
              autoCapitalize="none"
              accessibilityLabel="Senha"
            />

            <Text style={styles.label}>Confirmar senha</Text>

            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Digite novamente sua senha"
              secureTextEntry
              autoCapitalize="none"
              accessibilityLabel="Confirmação da senha"
            />

            {error ? (
              <Text style={styles.error}>{error}</Text>
            ) : null}

            <Pressable
              style={[
                styles.button,
                loading && styles.disabled,
              ]}
              onPress={handleRegister}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Criar conta"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>
                  Criar minha conta
                </Text>
              )}
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
  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#493726',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#806E5F',
    textAlign: 'center',
    marginTop: 9,
    marginBottom: 24,
  },
  form: {
    gap: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#493726',
  },
  input: {
    minHeight: 49,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C8BFB4',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#333333',
    marginBottom: 7,
  },
  button: {
    backgroundColor: '#76563C',
    borderRadius: 10,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
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
    fontSize: 13,
    textAlign: 'center',
  },
});