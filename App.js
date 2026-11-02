import React from 'react';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from './src/navigation/AppNavigator';

import {
  AuthProvider,
  useAuth,
} from './src/contexts/AuthContext';

import {
  BooksProvider,
} from './src/contexts/BookContext';

// Decide se precisa carregar a estante pessoal.
function AppContent() {
  const { user } = useAuth();

  if (!user) {
    return <AppNavigator />;
  }

  return (
    <BooksProvider
      key={user.id}
      userId={user.id}
      isFirstAccount={user.isFirstAccount}
    >
      <AppNavigator />
    </BooksProvider>
  );
}

// Ponto de entrada do aplicativo.
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}