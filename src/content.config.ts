// Conteúdo editado pelo Sveltia CMS (public/admin/config.yml, collection "sections"): um JSON por seção em
// /content/sections na raiz do repo. Campos precisam bater com o config.yml.
// Imagens ficam em /public/uploads e chegam aqui como caminho público (/uploads/x.png).
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const base = './content/sections';
// campo opcional do CMS: some do JSON ou vem vazio ("")
const optional = z.string().trim().optional();

const button = z.object({ label: z.string(), link: z.string() });

const hero = defineCollection({
	loader: glob({ pattern: 'hero.json', base }),
	schema: z.object({
		image: z.string(),
		show_outline: z.boolean().default(true),
		// até 2: no desktop um fica de cada lado do contorno
		buttons: z.array(button).max(2).default([]),
	}),
});

const about = defineCollection({
	loader: glob({ pattern: 'about.json', base }),
	schema: z.object({
		title: z.string(),
		body: z.string(),
		photo: z.string(),
		photo_alt: z.string(),
		socials: z
			.object({
				instagram: optional,
				tiktok: optional,
				spotify: optional,
				x: optional,
				email: optional,
			})
			.default({}),
		press_kit: optional,
		merch: optional,
	}),
});

const mySound = defineCollection({
	loader: glob({ pattern: 'my-sound.json', base }),
	schema: z.object({
		title: z.string(),
		body: z.string(),
		songs: z
			.array(
				z.object({
					title: z.string(),
					type: z.enum(['EP', 'Single', 'Álbum']),
					year: z.coerce.number().int(),
					cover: z.string(),
					buttons: z.array(button).default([]),
				}),
			)
			.default([]),
	}),
});

const gallery = defineCollection({
	loader: glob({ pattern: 'gallery.json', base }),
	schema: z.object({
		title: z.string(),
		photos: z
			.array(
				z.object({
					image: z.string(),
					caption: optional,
					alt: z.string(),
					window: z.boolean().default(true),
				}),
			)
			.default([]),
	}),
});

const press = defineCollection({
	loader: glob({ pattern: 'press.json', base }),
	schema: z.object({
		title: z.string(),
		body: z.string(),
		news: z
			.array(
				z.object({
					outlet: z.string(),
					title: z.string(),
					image: z.string(),
					button: button,
				}),
			)
			.default([]),
	}),
});

const footer = defineCollection({
	loader: glob({ pattern: 'footer.json', base }),
	schema: z.object({
		body: z.string(),
	}),
});

export const collections = { hero, about, mySound, gallery, press, footer };
