import { Text, View, StyleSheet, Pressable, Image,
	useWindowDimensions
 } from "react-native";
import { styles, colors } from "../styles";
import {useState, useEffect, useRef, forwardRef, useImperativeHandle} from "react";
import { router } from "expo-router";
import { PanResponder, Animated } from "react-native";

const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
};

//---------------- Lógica Match-3 ----------------
const N = 4; //tablero de 4x4 celdas
//tipos de gema (imágenes en assets/images/gems/)
const GEMS = [
	require("../../assets/images/gems/flor1.png"),
	require("../../assets/images/gems/flor2.png"),
	require("../../assets/images/gems/flor3.png"),
	require("../../assets/images/gems/flor4.png"),
	require("../../assets/images/gems/flor5.png"),
];
const randomGem = () => Math.floor(Math.random() * GEMS.length);

//regresa los índices de todas las celdas que forman parte de 3 o más iguales en línea
const findMatches = (b: number[]) => {
	const matches = new Set<number>();
	for (let r = 0; r < N; r++) {
		for (let c = 0; c < N; c++) {
			const i = r * N + c;
			//horizontal
			if (c <= N - 3 && b[i] === b[i + 1] && b[i] === b[i + 2]) {
				matches.add(i); matches.add(i + 1); matches.add(i + 2);
			}
			//vertical
			if (r <= N - 3 && b[i] === b[i + N] && b[i] === b[i + 2 * N]) {
				matches.add(i); matches.add(i + N); matches.add(i + 2 * N);
			}
		}
	}
	return matches;
};

//quita las celdas con match, deja caer las de arriba y rellena con gemas nuevas.
//se repite mientras haya matches (cascadas). Regresa el tablero nuevo y cuántas celdas se eliminaron
const resolveBoard = (board: number[]) => {
	let b = [...board];
	let cleared = 0;
	let matches = findMatches(b);
	while (matches.size > 0) {
		cleared += matches.size;
		for (let c = 0; c < N; c++) {
			//gemas que sobreviven en la columna, de abajo hacia arriba
			const column: number[] = [];
			for (let r = N - 1; r >= 0; r--) {
				if (!matches.has(r * N + c)) column.push(b[r * N + c]);
			}
			//reacomodar la columna y rellenar arriba con gemas nuevas
			for (let r = N - 1, k = 0; r >= 0; r--, k++) {
				b[r * N + c] = k < column.length ? column[k] : randomGem();
			}
		}
		matches = findMatches(b);
	}
	return { board: b, cleared };
};

//tablero inicial sin matches
const newBoard = () => resolveBoard(Array.from({ length: N * N }, randomGem)).board;

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
	hover: (value: boolean, valid?: boolean) => void;
	release: () => void;
}

const Cell = forwardRef<CellHandle, {row: number, col: number, size: number, gem: number}>(({row, col, size, gem}, ref) => {
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
		hover: (value, valid) => {
			setState( s=> s === CellState.picked || s === CellState.released ? s : (value ? (valid ? CellState.matched : CellState.hovered) : CellState.idle)

			);
		}
	}));

	const bgColor:Record<CellState, string> = {
		[CellState.idle]: colors.blanco,
		[CellState.picked]: colors.lavanda,
		[CellState.released]: colors.rosaClaro,
		[CellState.hovered]: colors.rosa,
		[CellState.matched]: colors.salvia
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
				borderColor: colors.rosaClaro,
				justifyContent: "center",
				alignItems: "center",
				backgroundColor: bgColor[state]
				}}>
				<Image source={GEMS[gem]} style={{width: size * 0.7, height: size * 0.7}} resizeMode="contain" />
				{
					debugDisplay && (
						<Text style={{
							fontSize:8,
							color: colors.salviaOscuro,
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
	const boardSize = width * 0.8; //ojito que esto está definido de forma independiente en el style
	const cellSize = boardSize / N; //tablero de 4x4 celdas
	const [timer, setTimer] = useState(5*60); //tiempo inicial en segundos
	const [score, setScore] = useState(0); //puntaje inicial
	const [board, setBoard] = useState<number[]>(newBoard); //gema de cada celda
	//copia del tablero para el PanResponder (que se crea una sola vez y no ve el state actualizado)
	const boardRef = useRef(board);
	boardRef.current = board;

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

	//solo se puede intercambiar con una celda vecina (arriba, abajo, izquierda o derecha)
	const isAdjacent = (a: {row: number, col: number}, b: {row: number, col: number}) =>
		Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;

	const setHovered = (next: {row: number, col: number} | null) => {
		const prev = hovered.current;
		if (prev?.row === next?.row && prev?.col === next?.col) return;
		if (prev) cellRefs.current[prev.row * N + prev.col]?.hover(false);
		const p = picked.current;
		if (next) cellRefs.current[next.row * N + next.col]?.hover(true, !!p && isAdjacent(p, next));
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

	}

	//intenta intercambiar dos celdas; solo se queda el cambio si genera un match
	const trySwap = (a: {row: number, col: number}, b: {row: number, col: number}) => {
		if (!isAdjacent(a, b)) return;
		const next = [...boardRef.current];
		const i = a.row * N + a.col;
		const j = b.row * N + b.col;
		[next[i], next[j]] = [next[j], next[i]];
		const result = resolveBoard(next);
		if (result.cleared === 0) return; //sin match: no se hace el cambio
		setBoard(result.board);
		setScore(s => s + result.cleared * 10);
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
				const h=hovered.current;
				setHovered(null);
				const p=picked.current;
				if(p){
					if(h) trySwap(p, h);
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
		//mandamos el puntaje a la pantalla de gameover
		router.replace({
			pathname: '/gameover',
			params: { score: score },
		});
	}

	const gamestyles = StyleSheet.create({
	board:{
		backgroundColor: colors.rosaClaro,
		width: boardSize,
		height: boardSize,
		flexDirection: "row",
		flexWrap: "wrap"
	}
});

  return (
    <View style={styles.container}>
		<Image source={require("../../assets/images/gems/flor1.png")} style={styles.flowerjuego} />
		<Text style={styles.mintitle}>FLOWER MATCH</Text>
		<View style={styles.row}>
			<View style={styles.card}>
				<Text style={styles.subtitle}>Tiempo</Text>
				<Text style={styles.bigNumber}>{formatTime(timer)}</Text>
			</View>
			<View style={styles.card}>
				<Text style={styles.subtitle}>Puntaje</Text>
				<Text style={styles.bigNumber}>{score}</Text>
			</View>
		</View>
		{}
		<View style={styles.board}>
		<View style={gamestyles.board} {...panResponder.panHandlers}>
			{
			[...Array(N).keys()].map(row=>(
				[...Array(N).keys()].map(col=>(
					<Cell key={`${row}-${col}`} 
						ref={h => {cellRefs.current[row * N + col] = h; }}
						row={row} col={col} size={cellSize} gem={board[row * N + col]}
					 />
					)
				)
			))}
		</View>
		</View>
		<Pressable style={styles.buttonOutline} onPress={onGameOver}>
			<Text style={styles.buttonOutlineText}>Terminar juego</Text>
		</Pressable>
    </View>
  );
}
