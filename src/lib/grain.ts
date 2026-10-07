// Configuração do grão de filme (Grain.astro).

export interface GrainConfig {
	/** Tamanho do grão: maior = mais fino. */
	baseFrequency: number;
	/** Camadas de detalhe do ruído (1–5). */
	numOctaves: number;
	type: 'fractalNoise' | 'turbulence';
	/** Contraste; o intercept é derivado para manter o ruído centrado. */
	slope: number;
	/** 0 = preto e branco, >0 = grão colorido. */
	saturate: number;
	/** Lado do tile que se repete, em px. */
	tile: number;
	opacity: number;
	blend: string;
	/** Saltos aleatórios por segundo (0 = parado). */
	fps: number;
	/** Saltos por segundo em telas de toque (celular): mais leve para GPUs fracas. */
	fpsTouch: number;
	/** Raio do círculo sem grão em volta do cursor, em px (0 = desligado). */
	holeRadius: number;
	/** Fração do raio usada como borda suave (0 = borda dura, 1 = degradê do centro). */
	holeFeather: number;
}

export const grainDefaults: GrainConfig = {
	baseFrequency: 2,
	numOctaves: 3,
	type: 'fractalNoise',
	slope: 2.3,
	saturate: 0,
	tile: 320,
	opacity: 0.35,
	// overlay: o grão modula a luminância do que está embaixo (preto segue preto),
	// como grão de foto — normal/hard-light jogam um véu claro sobre áreas escuras
	blend: 'overlay',
	fps: 30,
	fpsTouch: 12,
	holeRadius: 60,
	holeFeather: 0.15,
};

/** SVG de ruído com primitivas extras no fim do filtro, como `url(...)`. */
function noiseUrl(c: GrainConfig, extra = ''): string {
	const intercept = (1 - c.slope) / 2;
	const fn = (ch: string) => `<feFunc${ch} type='linear' slope='${c.slope}' intercept='${intercept}'/>`;
	const svg =
		`<svg xmlns='http://www.w3.org/2000/svg' width='${c.tile}' height='${c.tile}'>` +
		`<filter id='n'>` +
		`<feTurbulence type='${c.type}' baseFrequency='${c.baseFrequency}' numOctaves='${c.numOctaves}' stitchTiles='stitch'/>` +
		`<feColorMatrix type='saturate' values='${c.saturate}'/>` +
		// feTurbulence também gera ruído no alpha; forçar opaco deixa o grão uniforme
		`<feColorMatrix type='matrix' values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0 1'/>` +
		`<feComponentTransfer>${fn('R')}${fn('G')}${fn('B')}</feComponentTransfer>` +
		extra +
		`</filter>` +
		`<rect width='100%' height='100%' filter='url(#n)'/>` +
		`</svg>`;
	return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** `url(...)` com o SVG de ruído, pronto para `background-image`. */
export function grainNoiseUrl(c: GrainConfig): string {
	return noiseUrl(c);
}

/**
 * Mesmo ruído como máscara de alpha (`mask-image`): alpha = floor + (1 − floor) × ruído.
 * Para elementos de cor saturada, onde o overlay do grão quase não aparece.
 */
export function grainMaskUrl(c: GrainConfig, floor: number): string {
	return noiseUrl(c, `<feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${1 - floor} 0 0 0 ${floor}'/>`);
}

/** Estilos inline do container `#grain` para uma config (a textura desce por CSS var). */
export function grainStyle(c: GrainConfig): Record<string, string> {
	return {
		'--grain-noise': grainNoiseUrl(c),
		'--grain-tile': `${c.tile}px`,
		opacity: String(c.opacity),
		'mix-blend-mode': c.blend,
		'--grain-hole': `${c.holeRadius}px`,
		'--grain-feather': String(c.holeFeather),
	};
}
