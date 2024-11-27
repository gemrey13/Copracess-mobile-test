import { StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { useFonts } from "expo-font";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import SplashScreenComponent from "@/components/SplashScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const StackLayout = () => {
  const { authState } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(protected)";

    if (!authState?.authenticated && inAuthGroup) {
      router.replace("/");
    } else if (authState?.data.role === "COPRA_BUYER") {
      router.replace("/(protected)/buyerhome");
    } else {
      router.replace("/(protected)/oilhome");
    }
  }, [authState]);

  return (
    <Stack>
      <Stack.Screen name="signIn" options={{ headerShown: false }} />
      <Stack.Screen name="roleSelect" options={{ headerShown: false }} />
      <Stack.Screen name="oilsignUp" options={{ headerShown: false }} />
      <Stack.Screen name="buyersignUp" options={{ headerShown: false }} />
      <Stack.Screen name="(protected)" options={{ headerShown: true }} />
    </Stack>
  );
};

const rootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });

  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    if (error) {
      throw error;
    }
    if (fontsLoaded) {
      setTimeout(() => {
        SplashScreen.hideAsync();
        setIsAppReady(true);
      }, 1000);
    }
  }, [fontsLoaded, error]);

  const isSplashVisible = !fontsLoaded || !isAppReady;

  return isSplashVisible ? (
    <SplashScreenComponent
      onFinish={() => setIsAppReady(true)}
      isFontsLoaded={fontsLoaded}
      isAppReady={isAppReady}
    />
  ) : (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StackLayout />
      </AuthProvider>
    </GestureHandlerRootView>
  );
};

export default rootLayout;

const styles = StyleSheet.create({});
