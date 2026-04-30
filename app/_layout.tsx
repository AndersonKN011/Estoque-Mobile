import { Stack } from "expo-router";

export default function Layout() {
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