/**
 * Theme palettes. Each theme defines a light and a dark variant from five tokens;
 * `themes.css` derives the whole gray and accent scale used by the Tailwind utilities
 * (`gray-*`, `indigo-*`, `white`) from them, so components need no per-theme classes.
 */
export interface Palette {
	/** Page background in light mode / brightest text in dark mode. */
	light: string;
	/** Strongest text in light mode / page background in dark mode. */
	dark: string;
	/** Card/input surface (`bg-white` in light mode, bright text `text-white` in dark mode). */
	surface: string;
	accent: string;
	/** Text on a solid accent background. */
	onAccent: string;
}

export interface Theme {
	id: string;
	name: string;
	light: Palette;
	dark: Palette;
}

export const THEMES = [
	{
		id: 'default',
		name: 'ChapterLane',
		light: {
			light: '#f9fafb',
			dark: '#030712',
			surface: '#ffffff',
			accent: '#4f46e5',
			onAccent: '#ffffff'
		},
		dark: {
			light: '#f3f4f6',
			dark: '#030712',
			surface: '#ffffff',
			accent: '#6366f1',
			onAccent: '#ffffff'
		}
	},
	{
		id: 'nord',
		name: 'Nord',
		light: {
			light: '#eceff4',
			dark: '#2e3440',
			surface: '#f6f8fb',
			accent: '#577aa4',
			onAccent: '#eceff4'
		},
		dark: {
			light: '#eceff4',
			dark: '#2e3440',
			surface: '#eceff4',
			accent: '#88c0d0',
			onAccent: '#2e3440'
		}
	},
	{
		id: 'catppuccin',
		name: 'Catppuccin',
		light: {
			light: '#eff1f5',
			dark: '#3c3e55',
			surface: '#f8f9fc',
			accent: '#8839ef',
			onAccent: '#eff1f5'
		},
		dark: {
			light: '#cdd6f4',
			dark: '#1e1e2e',
			surface: '#cdd6f4',
			accent: '#cba6f7',
			onAccent: '#1e1e2e'
		}
	},
	{
		id: 'gruvbox',
		name: 'Gruvbox',
		light: {
			light: '#fbf1c7',
			dark: '#3c3836',
			surface: '#fdf7da',
			accent: '#af3a03',
			onAccent: '#fbf1c7'
		},
		dark: {
			light: '#ebdbb2',
			dark: '#282828',
			surface: '#ebdbb2',
			accent: '#fe8019',
			onAccent: '#282828'
		}
	},
	{
		id: 'solarized',
		name: 'Solarized',
		light: {
			light: '#fdf6e3',
			dark: '#073642',
			surface: '#fffaf0',
			accent: '#2076b5',
			onAccent: '#fdf6e3'
		},
		dark: {
			light: '#eee8d5',
			dark: '#002b36',
			surface: '#eee8d5',
			accent: '#3d9ee6',
			onAccent: '#002b36'
		}
	},
	{
		id: 'dracula',
		name: 'Dracula',
		light: {
			light: '#fffbeb',
			dark: '#1f1f1f',
			surface: '#fffef5',
			accent: '#644ac9',
			onAccent: '#fffbeb'
		},
		dark: {
			light: '#f8f8f2',
			dark: '#282a36',
			surface: '#f8f8f2',
			accent: '#bd93f9',
			onAccent: '#282a36'
		}
	},
	{
		id: 'tokyo-night',
		name: 'Tokyo Night',
		light: {
			light: '#e1e2e7',
			dark: '#343b58',
			surface: '#eef0f6',
			accent: '#1569d3',
			onAccent: '#eef0f6'
		},
		dark: {
			light: '#c0caf5',
			dark: '#1a1b26',
			surface: '#c0caf5',
			accent: '#7aa2f7',
			onAccent: '#1a1b26'
		}
	},
	{
		id: 'rose-pine',
		name: 'Rosé Pine',
		light: {
			light: '#faf4ed',
			dark: '#433e5e',
			surface: '#fffaf3',
			accent: '#7a6595',
			onAccent: '#fffaf3'
		},
		dark: {
			light: '#e0def4',
			dark: '#191724',
			surface: '#e0def4',
			accent: '#c4a7e7',
			onAccent: '#191724'
		}
	}
] as const satisfies readonly Theme[];

export const COLOR_MODES = ['system', 'light', 'dark'] as const;

export type ThemeId = (typeof THEMES)[number]['id'];
export type ColorMode = (typeof COLOR_MODES)[number];

export interface Appearance {
	theme: ThemeId;
	mode: ColorMode;
}

export const DEFAULT_APPEARANCE: Appearance = { theme: 'default', mode: 'system' };

export const APPEARANCE_COOKIE = 'chapterlane_appearance';

export function isThemeId(value: unknown): value is ThemeId {
	return THEMES.some((t) => t.id === value);
}

export function isColorMode(value: unknown): value is ColorMode {
	return COLOR_MODES.some((m) => m === value);
}

/** Validates untrusted values; anything unknown falls back to the default. */
export function parseAppearance(theme: unknown, mode: unknown): Appearance {
	return {
		theme: isThemeId(theme) ? theme : DEFAULT_APPEARANCE.theme,
		mode: isColorMode(mode) ? mode : DEFAULT_APPEARANCE.mode
	};
}

export function parseAppearanceCookie(value: string | undefined): Appearance {
	const [theme, mode] = (value ?? '').split('.');
	return parseAppearance(theme, mode);
}

export function serializeAppearanceCookie(a: Appearance): string {
	return `${a.theme}.${a.mode}`;
}

function tokens(p: Palette): string {
	return `--t-light:${p.light};--t-dark:${p.dark};--t-surface:${p.surface};--t-accent:${p.accent};--t-on-accent:${p.onAccent}`;
}

/** CSS custom properties for every non-default theme, in light and dark variants. */
export const THEME_CSS = THEMES.filter((t) => t.id !== 'default')
	.map(
		(t) =>
			`[data-theme='${t.id}']{${tokens(t.light)}}[data-theme='${t.id}'].dark{${tokens(t.dark)}}`
	)
	.join('');

/** Whether the page renders dark for a mode, given the OS preference (used for 'system'). */
export function isDark(mode: ColorMode, prefersDark: boolean): boolean {
	return mode === 'dark' || (mode === 'system' && prefersDark);
}

/** Applies an appearance to the document root. Client only. */
export function applyAppearance(root: HTMLElement, a: Appearance): void {
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	root.dataset.theme = a.theme;
	root.dataset.mode = a.mode;
	root.classList.toggle('dark', isDark(a.mode, prefersDark));
}
