import { Text, View, StyleSheet, Pressable,Image } from "react-native";
import { styles } from "../styles";
import { useRouter } from 'expo-router';

export default function Index() {
	const router = useRouter();
	return (
		<View style={styles.container}>
			<Image source={require("../../assets/images/gems/flor1.png")} style={styles.flowerttile} />
			<Text style={styles.title}>FLOWER MATCH</Text>


			<View style={styles.card}>
							<Text style={styles.subtitle}>Equipo KAI</Text>
							<Text style={styles.smallText}>ALONDRA HERNANDEZ MARTINEZ</Text>
							<Text style={styles.smallText}>ISAI CANDELARIO SANDOVAL</Text>
							<Text style={styles.smallText}>KATIA MARCELA CARPIO DOMINGUEZ</Text>
						</View>
			<Pressable 
				style={styles.button}
				onPress={() => 
					router.replace('/game')}>
				<Text style={styles.buttonText}>Jugar</Text>
			</Pressable>
		</View>
	);
}
