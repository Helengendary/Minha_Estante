import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from 'react-native';

import {
  registerLocal,
  loginLocal,
  restoreLocalSession,
  logoutLocal,
} from '../services/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [startupError, setStartupError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // Recupera a sessão quando o aplicativo abre.
  useEffect(() => {
    let active = true;

    const initializeSession = async () => {
      setInitializing(true);
      setStartupError('');

      try {
        const savedUser = await restoreLocalSession();

        if (active) {
          setUser(savedUser);
        }
      } catch (error) {
        console.error('Erro ao recuperar sessão:', error);

        if (active) {
          setStartupError(
            'Não foi possível recuperar sua sessão.'
          );
        }
      } finally {
        if (active) {
          setInitializing(false);
        }
      }
    };

    initializeSession();

    return () => {
      active = false;
    };
  }, [retryCount]);

  // Cadastro de usuário.
  const signUp = useCallback(async (name, email, password) => {
    const registeredUser = await registerLocal({
      name,
      email,
      password,
    });

    setUser(registeredUser);
  }, []);

  // Login.
  const signIn = useCallback(async (email, password) => {
    const loggedUser = await loginLocal(email, password);
    setUser(loggedUser);
  }, []);

  // Logout.
  const signOut = useCallback(async () => {
    await logoutLocal();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      signUp,
      signIn,
      signOut,
    }),
    [user, signUp, signIn, signOut]
  );

  // Aguarda a recuperação da sessão.
  if (initializing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#76563C"
        />
        <Text style={styles.info}>
          Verificando sua sessão...
        </Text>
      </View>
    );
  }

  if (startupError) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{startupError}</Text>

        <Pressable
          style={styles.button}
          onPress={() => setRetryCount((n) => n + 1)}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>
            Tentar novamente
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para acessar autenticação em qualquer tela.
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth deve ser usado dentro de AuthProvider'
    );
  }

  return context;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F4EF',
    padding: 24,
    gap: 14,
  },
  info: {
    color: '#665748',
    fontSize: 15,
  },
  error: {
    color: '#B52D2D',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#76563C',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    minHeight: 44,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});