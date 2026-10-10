import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack>
    <Stack.Screen name="index" 
		options={{ title: 'Inicio' }} />
    <Stack.Screen name="game" 
		options={{ title: 'Juego' }} />
    <Stack.Screen name="gameover" 
		options={{ title: 'Fin del juego' }} />
  </Stack>;
}
