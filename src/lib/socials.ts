// Redes sociais cadastradas no Sobre (content/sections/about.json), com os ícones fixos do Tabler (outline).
// Só entram as redes com link. Usado no Sobre e no rodapé.
import { getEntry } from 'astro:content';
import Instagram from '@tabler/icons/outline/brand-instagram.svg';
import Tiktok from '@tabler/icons/outline/brand-tiktok.svg';
import Spotify from '@tabler/icons/outline/brand-spotify.svg';
import X from '@tabler/icons/outline/brand-x.svg';
import Mail from '@tabler/icons/outline/mail.svg';

export async function getSocials() {
	const { data } = (await getEntry('about', 'about'))!;
	return [
		{ key: 'instagram', label: 'Instagram', href: data.socials.instagram, Icon: Instagram },
		{ key: 'tiktok', label: 'TikTok', href: data.socials.tiktok, Icon: Tiktok },
		{ key: 'spotify', label: 'Spotify', href: data.socials.spotify, Icon: Spotify },
		{ key: 'x', label: 'X (Twitter)', href: data.socials.x, Icon: X },
		{ key: 'email', label: 'E-mail', href: data.socials.email, Icon: Mail },
	].filter((social): social is typeof social & { href: string } => Boolean(social.href));
}
