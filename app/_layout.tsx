import { Stack } from "expo-router";
import { useEffect } from "react";
import { getEstoque } from "../api";

export default function Layout() {
    useEffect(() => {
        getEstoque();
    }, []);
  return (
      <Stack
        screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        }}
        >
            <Stack.Screen name="cadastro-itens/index" options={{ headerShown: false }} />
            <Stack.Screen name="lista-itens/index" options={{ title: 'Lista de Itens', headerShown: false }} />
        </Stack>
  )
}