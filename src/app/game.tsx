import { Text, View, StyleSheet, Pressable,
	useWindowDimensions
 } from "react-native";
import { styles } from "../styles";
import {useState, useEffect, useRef, forwardRef, useImperativeHandle} from "react";
import { router } from "expo-router";
import { PanResponder, Animated } from "react-native";

const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
};

//estados que puede tener una celda, usados para su apariencia y comportamiento
const enum CellState{
	idle,  //celda en estado normal
	picked, //celda está siendo arrastrada
	released, //la celda fue soltada y regresa a su posición original
	hovered, //la celda debajo de la picked, cuando no es destino valido
	matched //la celda debajo de la picked, cuando es destino valido
}

type CellHandle={
	pick: () => void;
    setOffset: (dx: number, dy: number) => void;
	hover: (value: boolean) => void;
	release: () => void;
}

const Cell = forwardRef<CellHandle, {row: number, col: number, size: number}>(({row, col, size}, ref) => {
	const [state, setState] = useState<CellState>(CellState.idle);
	const pan = useRef(new Animated.ValueXY()).current;
	
	const debugDisplay=true;

	useImperativeHandle(ref, () => ({
		pick: () => {
			setState(CellState.picked);
		},
		setOffset: (dx, dy) => {
			pan.setValue({ x: dx, y: dy });
		},
		release: () => {
			//no regresa a idle directamente porque queremos que se vea la animación de regreso a la posición original
			setState(CellState.released);
			//resortito para que se vea bonito
			Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start(
				//start recibe un callback, usamos el de finished para que cuando termine la animación de regreso se cambie el estado a idle
				({finished}) => {
					if(finished){
						setState(CellState.idle);
					}});
		},
		hover: (value) => {
			setState( s=> s === CellState.picked || s === CellState.released ? s : (value ? CellState.hovered : CellState.idle)

			);
		}
	}));

	const bgColor:Record<CellState, string> = {
		[CellState.idle]: "#fff",
		[CellState.picked]: "#efff97",
		[CellState.released]: "#ccc",
		[CellState.hovered]: "#ffcccb",
		[CellState.matched]: "#baff9e"
	};

	return (
		<Animated.View
			pointerEvents="none"
			style={[
				{width: size, height: size},
				(state === CellState.picked || state === CellState.released) ? {
					zIndex: 99,
					elevation: 99,
					transform: [{ translateX: pan.x }, { translateY: pan.y }]
				} : { zIndex: 1, elevation: 1 },
			]}>
			<View style={{
				width: size, 
				height: size,
				borderWidth: 1,
				borderColor: "#8f8f8f",
				justifyContent: "center",
				alignItems: "center",
				backgroundColor: bgColor[state]
				}}>
				<Text style={styles.buttonText}>N</Text>
				{
					debugDisplay && (
						<Text style={{
							fontSize:8,
							color:"#999",
						}}>
							[{row},{col}]
						</Text>
					)
				}
			</View>
		</Animated.View>
	)
});

export default function GameScreen() {
	const { width, height } = useWindowDimensions();
	const N = 4; //tablero de 4x4 celdas
	const boardSize = width * 0.9; //ojito que esto está definido de forma independiente en el style
	const cellSize = boardSize / 4; //tablero de 4x4 celdas
	const [timer, setTimer] = useState(1000); //tiempo inicial en segundos
	const [score, setScore] = useState(0); //puntaje inicial

	//celda seleccionada al comenzar el drag
	const picked = useRef<{row: number, col: number} | null>(null);
	//celda actual hovereada
	const hovered = useRef<{row: number, col: number} | null>(null);
	//lista de celdas
	const cellRefs = useRef<(CellHandle | null)[]>([]);	

	//detectar de forma rudimentaria las "colisiones" del touch con las celdas del tablero
	const pickCell = (x: number, y: number) => {
		console.log(`Cell picked on: [${x}, ${y}]`);
		const col = Math.floor(x / cellSize);
		const row = Math.floor(y / cellSize);
		//error loco nunca debería pasar
		if (row < 0 || row >= N || col < 0 || col >= N) return;
		picked.current = {row, col};
		//llamar al método pick de la celda correspondiente como debe ser según el GOM y no este loco modelo declarativo
		cellRefs.current[row * N + col]?.pick();
		console.log(`Cell : [ ${picked.current.col}, ${picked.current.row} ] `);
	}

	const setHovered = (next: {row: number, col: number} | null) => {
		const prev = hovered.current;
		if (prev?.row === next?.row && prev?.col === next?.col) return;
		if (prev) cellRefs.current[prev.row * N + prev.col]?.hover(false);
		if (next) cellRefs.current[next.row * N + next.col]?.hover(true);
		hovered.current = next;
	};

	//checa si la celda hovereada es válida como destino
	const checkCell = (x: number, y: number) => {
		const hovrCol = Math.floor(x / cellSize);
		const hovrRow = Math.floor(y / cellSize);
		const p=picked.current;
		const invalidPos = hovrRow < 0 || hovrRow >= N || hovrCol < 0 || hovrCol >= N;
		const isPicked = p && p.row === hovrRow && p.col === hovrCol;
		//establecemos hovered solo si:
		//1. la celda hovereada es válida (dentro del tablero)
		//2. la celda hovereada no es la misma que la celda picked
		setHovered(invalidPos || isPicked ? null : {row: hovrRow, col: hovrCol});

		//implementar según tu gameplay jsjsjd
	}

	const panResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: (evt, gestureState) => true,
			onMoveShouldSetPanResponder: () => true,
			onPanResponderGrant: (evt, gestureState) => {
				// The gesture has started. Show visual feedback so the user knows
				// what is happening!
				// gestureState.d{x,y} will be set to zero now
				console.log("The gesture has started.");
				pickCell(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
			},
			onPanResponderMove: (evt, gestureState) => {
				// The most recent move distance is gestureState.move{X,Y}
				// The accumulated gesture distance since becoming responder is
				// gestureState.d{x,y}
				const p=picked.current;
				if(p){
					cellRefs.current[p.row * N + p.col]?.setOffset(gestureState.dx, gestureState.dy);
					checkCell(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
				}
			},
			onPanResponderRelease: (evt, gestureState) => { 
				setHovered(null);
				const p=picked.current;
				if(p){
					console.log(`The gesture has ended. Cell: [${p.col}, ${p.row}]`);
					cellRefs.current[p.row * N + p.col]?.release();
					picked.current = null;
				}
			},
			onPanResponderTerminate: (evt, gestureState) => {
			// Another component has become the responder, so this gesture
			// should be cancelled
			},
		}),
	).current;
	

	//este effect es llamado al cargar el componente
	//crea un intervalo que es llamado cada 1000 milisegundos
	useEffect(() => {
		const interval = setInterval(() => {
			setTimer(prev => prev - 1);
		}, 1000);

		return () => clearInterval(interval);
	}, []);
	//este effect es llamado cada vez que el valor de timer cambia.
	useEffect(() => {
		if (timer <= 0) {
			onGameOver();
		}
	}, [timer]);

	const onGameOver = () => {
		console.log("game over");
		router.replace('/gameover');
	}

	const gamestyles = StyleSheet.create({
	board:{
		backgroundColor: "#ddd",
		width: boardSize,
		height: boardSize,
		flexDirection: "row",
		flexWrap: "wrap"
	}
});

  return (
    <View style={styles.container}>
		<Text style={styles.buttonText}>{formatTime(timer)}</Text>
		<Text style={styles.buttonText}>Score: {score}</Text>
		<View style={gamestyles.board} {...panResponder.panHandlers}>
			{
			[0,1,2,3].map(row=>(
				[0,1,2,3].map(col=>(
					<Cell key={`${row}-${col}`} 
						ref={h => {cellRefs.current[row * N + col] = h; }}
						row={row} col={col} size={cellSize}
					 />
					)
				)
			))}
		</View>
		<Pressable style={styles.button} onPress={onGameOver}>
			<Text style={styles.buttonText}>Terminar juego</Text>
		</Pressable>
    </View>
  );
}
