import { Platform, StyleSheet } from "react-native";

//paleta girlie del campo 🌸🌿
export const colors = {
	crema: "#fdf6ec", //fondo
	rosa: "#f4a7b9", //botones principales
	rosaClaro: "#fde2e8", //tarjetas, fondos suaves
	salvia: "#a8c3a0", //verde hojita, botones secundarios
	salviaOscuro: "#5f7d57", //texto verde
	cafe: "#6b4f4f", //texto principal
	lavanda: "#d8c8ec", //detalles
	blanco: "#ffffff",
};

//fuentes: serif para títulos (tipo vintage), redondita para lo demás
const fonts = {
	titulo: Platform.select({ ios: "Georgia", android: "serif", default: "Georgia, serif" }),
	texto: Platform.select({ ios: "ui-rounded", default: undefined }),
};

export const styles = StyleSheet.create({
	//---------- contenedores ----------
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.crema,
		padding: 20,
	},
	//tarjeta para agrupar cosas (puntaje, instrucciones, etc.)
	card: {
		backgroundColor: colors.rosaClaro,
		borderRadius: 20,
		padding: 16,
		margin: 10,
		alignItems: "center",
		borderWidth: 2,
		borderColor: colors.rosa,
	},
	//para poner cosas una al lado de otra
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 10,
	},

	//---------- textos ----------
	title: {
		fontFamily: fonts.titulo,
		fontSize: 40,
		fontWeight: "bold",
		color: colors.cafe,
		textAlign: "center",
		marginBottom: 10,
	},

	mintitle: {
		fontFamily: fonts.titulo,
		fontSize: 30,
		fontWeight: "bold",
		color: colors.cafe,
		textAlign: "center",
		marginBottom: 10,
	},
	subtitle: {
		fontFamily: fonts.titulo,
		fontSize: 24,
		fontStyle: "italic",
		color: colors.salviaOscuro,
		textAlign: "center",
		marginBottom: 8,
	},
	text: {
		fontFamily: fonts.texto,
		fontSize: 18,
		color: colors.cafe,
		textAlign: "center",
	},
	smallText: {
		fontFamily: fonts.texto,
		fontSize: 14,
		color: colors.salviaOscuro,
		textAlign: "center",
	},
	//para el timer y el score
	bigNumber: {
		fontFamily: fonts.titulo,
		fontSize: 32,
		fontWeight: "bold",
		color: colors.rosa,
	},

	//---------- botones ----------
	button: {
		backgroundColor: colors.rosa,
		paddingVertical: 12,
		paddingHorizontal: 28,
		margin: 10,
		borderRadius: 30,
		borderWidth: 2,
		borderColor: colors.blanco,
		alignItems: "center",
	},
	buttonText: {
		fontFamily: fonts.texto,
		fontSize: 20,
		fontWeight: "bold",
		color: colors.blanco,
	},
	//botón verde hojita
	buttonSecondary: {
		backgroundColor: colors.salvia,
		paddingVertical: 12,
		paddingHorizontal: 28,
		margin: 10,
		borderRadius: 30,
		borderWidth: 2,
		borderColor: colors.blanco,
		alignItems: "center",
	},
	//botón solo con borde
	buttonOutline: {
		backgroundColor: "transparent",
		paddingVertical: 12,
		paddingHorizontal: 28,
		margin: 10,
		borderRadius: 30,
		borderWidth: 2,
		borderColor: colors.rosa,
		alignItems: "center",
	},
	buttonOutlineText: {
		fontFamily: fonts.texto,
		fontSize: 20,
		fontWeight: "bold",
		color: colors.rosa,
	},

	//---------- juego ----------
	//marco del tablero (combínalo con el gamestyles.board que ya tienes)
	board: {
		backgroundColor: colors.rosaClaro,
		borderRadius: 16,
		borderWidth: 3,
		borderColor: colors.salvia,
	},
	//imágenes de flores sueltas (decoración)
	flower: {
		width: 60,
		height: 60,
		resizeMode: "contain",
	},

	flowerttile: {
		width: 150,
		height: 150,
		resizeMode: "contain",
	},

		flowerjuego: {
		width: 100,
		height: 100,
		resizeMode: "contain",
	},
});
