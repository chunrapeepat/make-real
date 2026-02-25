import { atom } from 'tldraw'
import { NOVEMBER_19_2025 } from '../prompt'

export const PROVIDERS = [
	{
		id: 'openai',
		name: 'OpenAI',
		models: [
			'gpt-5',
			'gpt-4.1-2025-04-14',
			'gpt-4o',
			'gpt-4o-mini',
			'o3-pro-2025-06-10',
			'o4-mini-2025-04-16',
		],
		prompt: NOVEMBER_19_2025,
		help: 'https://tldraw.notion.site/Make-Real-Help-93be8b5273d14f7386e14eb142575e6e#a9b75e58b1824962a1a69a2f29ace9be',
		validate: (key: string) => key.startsWith('sk-'),
	},
	{
		id: 'anthropic',
		name: 'Anthropic',
		models: [
			'claude-opus-4-6',
			'claude-sonnet-4-6',
			'claude-haiku-4-5',
			'claude-sonnet-4-5',
			'claude-sonnet-4-20250514',
			'claude-3-7-sonnet-20250219',
			'claude-3-7-sonnet-20250219 (thinking)',
			'claude-3-5-sonnet-20241022',
		],
		prompt: NOVEMBER_19_2025,
		help: 'https://tldraw.notion.site/Make-Real-Help-93be8b5273d14f7386e14eb142575e6e#3444b55a2ede405286929956d0be6e77',
		validate: (key: string) => key.startsWith('sk-'),
	},
	{
		id: 'google',
		name: 'Google',
		models: [
			'gemini-3-pro-preview',
			'gemini-3-flash-preview',
			'gemini-2.5-pro',
			'gemini-2.5-flash',
		],
		prompt: NOVEMBER_19_2025,
		help: '',
		validate: (key: string) => key.startsWith('AIza'),
	},
	{
		id: 'qwen',
		name: 'Qwen',
		models: ['qwen3.5-plus', 'qwen-max', 'qwen-plus', 'qwen-turbo'],
		prompt: NOVEMBER_19_2025,
		help: '',
		validate: (key: string) => key.startsWith('sk-'),
		hasServerDefault: true,
	},
]

export const makeRealSettings = atom('make real settings', {
	provider: 'qwen' as (typeof PROVIDERS)[number]['id'] | 'all',
	models: Object.fromEntries(PROVIDERS.map((provider) => [provider.id, provider.models[0]])),
	keys: { openai: '', anthropic: '', google: '', qwen: '' },
	prompts: {
		system: NOVEMBER_19_2025,
		openai: NOVEMBER_19_2025,
		anthropic: NOVEMBER_19_2025,
		google: NOVEMBER_19_2025,
		qwen: NOVEMBER_19_2025,
	},
})

type Settings = ReturnType<typeof makeRealSettings.get>

export const MIGRATION_VERSION = 14

export function applySettingsMigrations(settings: Settings, version: number | undefined) {
	const { keys, ...rest } = settings

	const settingsWithModelsProperty: Settings = {
		provider: 'qwen',
		models: Object.fromEntries(PROVIDERS.map((provider) => [provider.id, provider.models[0]])),
		keys: { openai: '', anthropic: '', google: '', qwen: '', ...keys },
		...rest,
		prompts: {
			system: NOVEMBER_19_2025,
			openai: NOVEMBER_19_2025,
			anthropic: NOVEMBER_19_2025,
			google: NOVEMBER_19_2025,
			qwen: NOVEMBER_19_2025,
		},
	}

	if (!version || version < 3) {
		settingsWithModelsProperty.models.google = 'gemini-2.5-pro-preview-06-05'
		settingsWithModelsProperty.models.openai = 'gpt-4.1-2025-04-14'
		settingsWithModelsProperty.models.anthropic = 'claude-sonnet-4-20250514'
	}

	if (version < 4) {
		if (settingsWithModelsProperty.models.google === 'gemini-2.5-pro-preview-06-05') {
			settingsWithModelsProperty.models.google = 'gemini-2.5-pro'
		}

		if (settingsWithModelsProperty.models.openai === 'gemini-2.5-flash-preview-05-20') {
			settingsWithModelsProperty.models.openai = 'gemini-2.5-flash'
		}
	}

	if (version < 6) {
		settingsWithModelsProperty.models.openai = 'gpt-5'
	}

	if (version < 7) {
		settingsWithModelsProperty.models.anthropic = 'claude-sonnet-4-5'
	}

	if (version < 8) {
		settingsWithModelsProperty.models.google = 'gemini-3-pro'
	}

	if (version < 9) {
		settingsWithModelsProperty.models.google = 'gemini-3-pro-preview'
	}

	if (version < 10) {
		settingsWithModelsProperty.models.openai = 'gpt-5-main'
	}

	if (version < 11) {
		settingsWithModelsProperty.models.google = 'gemini-3-pro-preview'
		settingsWithModelsProperty.models.openai = 'gpt-5'
	}

	if (version < 12) {
		settingsWithModelsProperty.prompts.system = NOVEMBER_19_2025
		settingsWithModelsProperty.prompts.openai = NOVEMBER_19_2025
		settingsWithModelsProperty.prompts.anthropic = NOVEMBER_19_2025
		settingsWithModelsProperty.prompts.google = NOVEMBER_19_2025
	}

	if (version < 13) {
		settingsWithModelsProperty.models.anthropic = 'claude-sonnet-4-6'
	}

	if (version < 14) {
		settingsWithModelsProperty.models.qwen = 'qwen3.5-plus'
	}

	return settingsWithModelsProperty
}
