// Ajudantes para renderizar o que vem do CMS (src/content.config.ts).

/** Parágrafos de um campo de texto: separados por linha em branco. */
export const paragraphs = (text: string) =>
	text
		.split(/\n\s*\n/)
		.map((p) => p.trim())
		.filter(Boolean);

/** Atributos de um link cadastrado no CMS: e-mail sem "mailto:" ganha o prefixo; link externo abre em nova aba. */
export function link(href: string) {
	const url = href.includes('@') && !href.includes(':') ? `mailto:${href}` : href;
	return /^https?:\/\//.test(url) ? { href: url, target: '_blank', rel: 'noopener noreferrer' } : { href: url };
}
