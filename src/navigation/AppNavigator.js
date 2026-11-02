import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../contexts/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

import CatalogScreen from '../screens/CatalogScreen';
import BookDetailsScreen from '../screens/BookDetailsScreen';
import SearchScreen from '../screens/SearchScreen';
import FavoritesScreen from '../screens/FavoriteScreen';
import ReadBooksScreen from '../screens/ReadBooksScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#F7F4EF',
          },
          headerTintColor: '#493726',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#F7F4EF',
          },
        }}
      >
        {user ? (
          // Telas disponíveis somente após o login.
          <Stack.Group navigationKey={`account-${user.id}`}>
            <Stack.Screen
              name="Catalog"
              component={CatalogScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="Search"
              component={SearchScreen}
              options={{ title: 'Buscar livros' }}
            />

            <Stack.Screen
              name="Favorites"
              component={FavoritesScreen}
              options={{ title: 'Favoritos' }}
            />

            <Stack.Screen
              name="ReadBooks"
              component={ReadBooksScreen}
              options={{ title: 'Livros lidos' }}
            />

            <Stack.Screen
              name="BookDetails"
              component={BookDetailsScreen}
              options={{ title: 'Detalhes do livro' }}
            />
          </Stack.Group>
        ) : (
          // Telas disponíveis sem autenticação.
          <Stack.Group navigationKey="guest">
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Criar conta' }}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}