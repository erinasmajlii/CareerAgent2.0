import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import { Animated, Dimensions, Easing } from 'react-native';

const { width } = Dimensions.get('window');
export const DRAWER_WIDTH = width * 0.72;

const DrawerContext = createContext(null);

export function DrawerProvider({ children }) {
  const [isOpen, setIsOpen]   = useState(false);
  const translateX             = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity         = translateX.interpolate({
    inputRange: [-DRAWER_WIDTH, 0],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const open = useCallback(() => {
    setIsOpen(true);
    Animated.timing(translateX, {
      toValue: 0, duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [translateX]);

  const close = useCallback(() => {
    Animated.timing(translateX, {
      toValue: -DRAWER_WIDTH, duration: 280,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => setIsOpen(false));
  }, [translateX]);

  const toggle = useCallback(() => {
    isOpen ? close() : open();
  }, [isOpen, open, close]);

  return (
    <DrawerContext.Provider value={{ isOpen, open, close, toggle, translateX, overlayOpacity }}>
      {children}
    </DrawerContext.Provider>
  );
}

export const useDrawer = () => {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error('useDrawer must be inside DrawerProvider');
  return ctx;
};
