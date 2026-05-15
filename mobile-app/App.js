import React from 'react';
import { StatusBar, View, Text, TouchableOpacity, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import AnalyzeScreen from './src/screens/AnalyzeScreen';
import GenerateScreen from './src/screens/GenerateScreen';
import PrepScreen from './src/screens/PrepScreen';
import QuestionScreen from './src/screens/QuestionScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import { C, GRAD } from './src/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const PrepStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

const TABS = [
  { name: 'Home', icon: '⌂', label: 'Home' },
  { name: 'Analyze', icon: '🔍', label: 'Analyze' },
  { name: 'Generate', icon: '✦', label: 'Generate' },
  { name: 'Prep', icon: '📚', label: 'Prep' },
  { name: 'Profile', icon: '◉', label: 'Profile' },
];

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={tabStyles.container}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const tab = TABS.find(t => t.name === route.name) || {};
        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}
            style={tabStyles.tab}
          >
            {focused && <View style={tabStyles.activePill} />}
            <Text style={[tabStyles.icon, focused && tabStyles.iconActive]}>
              {tab.icon}
            </Text>
            <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tabStyles = {
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 10,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3, position: 'relative' },
  activePill: {
    position: 'absolute', top: -10, width: 32, height: 3,
    backgroundColor: C.primary, borderBottomLeftRadius: 3, borderBottomRightRadius: 3,
  },
  icon: { fontSize: 20, color: '#9CA3AF' },
  iconActive: { color: C.primary },
  label: { fontSize: 10, color: '#9CA3AF', fontWeight: '500' },
  labelActive: { color: C.primary, fontWeight: '700' },
};

function PrepNavigator() {
  return (
    <PrepStack.Navigator screenOptions={{ headerShown: false }}>
      <PrepStack.Screen name="PrepHome" component={PrepScreen} />
      <PrepStack.Screen name="Question" component={QuestionScreen} />
    </PrepStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: C.bg, shadowColor: 'transparent', elevation: 0 },
        headerTitleStyle: { fontWeight: '800', fontSize: 18, color: C.text },
        headerTintColor: C.text,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Analyze" component={AnalyzeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Generate" component={GenerateScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Prep" component={PrepNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileNavigator} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Onboarding">
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
