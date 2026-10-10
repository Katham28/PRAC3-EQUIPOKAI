import { Text, View, StyleSheet, Pressable } from "react-native";
import { styles } from "../styles";
import { router } from "expo-router";
export default function Index() {

	const onNewGame = () => {
		router.replace('/');
	}

  return (
    <View style={styles.container}>
      <Text>GAME OVER</Text>
		<Pressable style={styles.button} onPress={onNewGame}>
			<Text style={styles.buttonText}>Jugar de nuevo</Text>
		</Pressable>
		
    </View>
  );
}