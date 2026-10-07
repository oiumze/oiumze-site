// Inclinação do celular (giroscópio) normalizada em -1…1 nos eixos da tela, compartilhada entre os efeitos
// (parallax do Hero, card do Sobre). Um único listener de deviceorientation para todos os inscritos.
//
// beta/gamma crus dão saltos com o celular em pé (gimbal lock) e ignoram a rotação da tela, então
// convertemos para o vetor da gravidade no plano da tela (contínuo em qualquer posição) e giramos
// pelo ângulo da tela (retrato/paisagem). A base segue a pose devagar: o movimento é relativo a como
// a pessoa está segurando, e segurando parado o valor volta a 0.
// x > 0 = celular inclinado para a direita; y > 0 = topo do celular inclinado para trás.

type Listener = (x: number, y: number) => void;

const RANGE = 0.3; // ~17° de inclinação a partir da base = valor máximo
const BASE_EASE = 0.02; // por leitura (~60Hz): a base alcança a pose em ~2s

const listeners = new Set<Listener>();
let base: { x: number; y: number } | null = null;
let started = false;

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

function orientation(e: DeviceOrientationEvent) {
	if (e.beta === null || e.gamma === null) return;
	const beta = (e.beta * Math.PI) / 180;
	const gamma = (e.gamma * Math.PI) / 180;
	// gravidade nos eixos do aparelho (x → direita, y → topo do aparelho)
	const gx = Math.cos(beta) * Math.sin(gamma);
	const gy = -Math.sin(beta);
	// eixos do aparelho → eixos da tela (y da tela para baixo, como no CSS)
	const angle = ((screen.orientation?.angle ?? 0) * Math.PI) / 180;
	const x = gx * Math.cos(angle) + gy * Math.sin(angle);
	const y = -(-gx * Math.sin(angle) + gy * Math.cos(angle));
	base ??= { x, y };
	base.x += (x - base.x) * BASE_EASE;
	base.y += (y - base.y) * BASE_EASE;
	const tx = clamp((x - base.x) / RANGE);
	const ty = clamp((y - base.y) / RANGE);
	for (const fn of listeners) fn(tx, ty);
}

function start() {
	if (started) return;
	started = true;
	// girou a tela: recomeça a base na nova pose
	screen.orientation?.addEventListener('change', () => (base = null));
	// Escuta sempre: onde não precisa de permissão os eventos já chegam. Onde precisa (iOS 13+, Chrome recente
	// também expõe requestPermission), pede no primeiro gesto do usuário; liberado, os eventos passam a chegar.
	addEventListener('deviceorientation', orientation);
	addEventListener('devicemotion', motion);
	type WithPermission = { requestPermission?: () => Promise<PermissionState> } | undefined;
	const DOE = window.DeviceOrientationEvent as unknown as WithPermission;
	const DME = window.DeviceMotionEvent as unknown as WithPermission;
	if (typeof DOE?.requestPermission === 'function' || typeof DME?.requestPermission === 'function') {
		addEventListener(
			'pointerup',
			() => {
				DOE?.requestPermission?.().catch(() => {});
				DME?.requestPermission?.().catch(() => {});
			},
			{ once: true },
		);
	}
}

// Giro em volta do eixo vertical da tela (celular em pé, virando para os lados como quem vira uma foto).
// A gravidade não muda nesse movimento, então vem da velocidade de rotação (devicemotion.rotationRate, °/s),
// integrada num ângulo que vaza de volta a 0: parado, volta ao centro em ~1s.
type TurnListener = (degrees: number) => void;
const turnListeners = new Set<TurnListener>();
const TURN_DECAY = 3; // por segundo: fração do ângulo perdida (exponencial)
let turn = 0;
let lastMotion = 0;

function motion(e: DeviceMotionEvent) {
	const r = e.rotationRate;
	if (!r || r.beta === null || r.gamma === null) return;
	const now = e.timeStamp;
	const dt = lastMotion ? Math.min(0.1, (now - lastMotion) / 1000) : 0;
	lastMotion = now;
	// eixo vertical da tela nos eixos do aparelho: retrato = y (gamma), paisagem = x (beta)
	const angle = screen.orientation?.angle ?? 0;
	const rate = angle === 90 ? r.beta : angle === 180 ? -r.gamma : angle === 270 ? -r.beta : r.gamma;
	turn = turn * Math.exp(-TURN_DECAY * dt) + rate * dt;
	for (const fn of turnListeners) fn(turn);
}

/** Inscreve um callback no giro horizontal do aparelho (graus, relativo, volta a 0 parado). */
export function onTurn(fn: TurnListener): () => void {
	start();
	turnListeners.add(fn);
	return () => turnListeners.delete(fn);
}

/** Inscreve um callback na inclinação do aparelho; devolve a função para cancelar. */
export function onTilt(fn: Listener): () => void {
	start();
	listeners.add(fn);
	return () => listeners.delete(fn);
}
