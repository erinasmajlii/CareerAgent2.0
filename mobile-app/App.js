import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthProvider, useAuth }         from './src/context/AuthContext';
import { ThemeProvider, useTheme }       from './src/context/ThemeContext';
import { DrawerProvider, useDrawer }     from './src/context/DrawerContext';

import SideDrawer    from './src/components/SideDrawer';
import GlassTabBar   from './src/components/GlassTabBar';

import OnboardingScreen  from './src/screens/OnboardingScreen';
import LoginScreen       from './src/screens/LoginScreen';
import HomeScreen        from './src/screens/HomeScreen';
import AnalyzeScreen     from './src/screens/AnalyzeScreen';
import GenerateScreen    from './src/screens/GenerateScreen';
import PrepScreen        from './src/screens/PrepScreen';
import QuestionScreen    from './src/screens/QuestionScreen';
import ProfileScreen     from './src/screens/ProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import ChatBotScreen     from './src/screens/ChatBotScreen';
import SettingsScreen    from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();
const ONBOARDING_KEY = '@careeragent_onboarding';

// ── 3-Tab Navigator ─────────────────────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home"     component={HomeScreen}     />
      <Tab.Screen name="Analyze"  component={AnalyzeScreen}  />
      <Tab.Screen name="Generate" component={GenerateScreen} />
    </Tab.Navigator>
  );
}

// ── Main Layout ───────────────────────────────────────────────────────────────
function MainLayout() {
  return (
    <DrawerProvider>
      <View style={{ flex: 1 }}>
        <MainTabs />
        <SideDrawer />
      </View>
    </DrawerProvider>
  );
}

// ── Root Navigator ─────────────────────────────────────────────────────────────
function RootNavigator() {
  const { session, loading } = useAuth();
  const { colors: C, ready } = useTheme();
  const [seenOnboarding, setSeen] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((v) => setSeen(v === 'true'));
  }, []);

  if (loading || seenOnboarding === null || !ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg }}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {session ? (
        <>
          <Stack.Screen name="Main"        component={MainLayout}       />
          <Stack.Screen name="Profile"     component={ProfileScreen}     options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="Prep"        component={PrepScreen}        options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="Question"    component={QuestionScreen}    options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="ChatBot"     component={ChatBotScreen}     options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="Settings"    component={SettingsScreen}    options={{ animation: 'slide_from_right' }} />
        </>
      ) : (
        <>
          {!seenOnboarding && (
            <Stack.Screen name="Onboarding">
              {(props) => (
                <OnboardingScreen
                  {...props}
                  onDone={async () => {
                    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
                    setSeen(true);
                    props.navigation.replace('Login');
                  }}
                />
              )}
            </Stack.Screen>
          )}
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

function AppShell() {
  const { isDark, colors } = useTheme();
  return (
    <>
      <StatusBar hidden />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({});
