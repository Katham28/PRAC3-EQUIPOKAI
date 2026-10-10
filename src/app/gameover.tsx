import { Text, View, StyleSheet, Pressable,Image } from "react-native";
import { styles } from "../styles";
import { router, useLocalSearchParams } from "expo-router";
export default function Index() {

	//puntaje que manda game.tsx
	const { score } = useLocalSearchParams<{ score: string }>();

	const onNewGame = () => {
		router.replace('/');
	}

  return (
    <View style={styles.container}>
       <Image source={require("../../assets/images/gems/flor1.png")} style={styles.flowerttile} />
      <Text style={styles.title}>GAME OVER</Text>
     
    <View style={styles.card}>
							<Text style={styles.subtitle}>Tu puntuaje</Text>
							<Text style={styles.bigNumber}>{score ?? 0}</Text>
						</View>


		<Pressable style={styles.buttonSecondary} onPress={onNewGame}>
			<Text style={styles.buttonText}>Menu principal</Text>
		</Pressable>
		
    </View>
  );
}