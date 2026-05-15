import React from 'react';
import { StatusBar, View, Text, TouchableOpacity, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const C = { green: '#00FF41', amber: '#FFBF00', bg: '#000', card: '#0A0A0A', border: '#1A1A1A', muted: '#444' };

const AppTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: C.green,
    background: C.bg,
    card: C.card,
    text: '#fff',
    border: C.border,
    notification: C.green,
  },
};

function TabBar({ state, descriptors, navigation }) {
  const icons = { Home: '⌂', Profile: '◉', Settings: '⚙' };
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: C.card,
      borderTopWidth: 1,
      borderTopColor: C.border,
      paddingBottom: Platform.OS === 'ios' ? 24 : 12,
      paddingTop: 10,
    }}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const color = focused ? C.green : C.muted;
        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}
            style={{ flex: 1, alignItems: 'center', gap: 4 }}
          >
            <Text style={{ fontSize: 20, color }}>{icons[route.name]}</Text>
            <Text style={{ fontSize: 9, color, letterSpacing: 2 }}>{route.name.toUpperCase()}</Text>
            {focused && (
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: C.green, marginTop: 2 }} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={C.bg} />
        <NavigationContainer theme={AppTheme}>
          <Tab.Navigator
            tabBar={props => <TabBar {...props} />}
            screenOptions={{
              headerStyle: { backgroundColor: C.bg, borderBottomColor: C.border, borderBottomWidth: 1 },
              headerTintColor: C.green,
              headerTitleStyle: { fontWeight: '900', letterSpacing: 2, fontSize: 14 },
              headerRight: () => (
                <Text style={{ color: C.muted, fontSize: 10, marginRight: 16, letterSpacing: 2 }}>
                  ONLINE
                </Text>
              ),
            }}
          >
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'CAREER AGENT' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'MY PROFILE' }} />
            <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'SETTINGS' }} />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
