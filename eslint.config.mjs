import globals from 'globals';
import { nodeConfig } from 'eslint-config-brightspace'


export default [
	...nodeConfig,
	{
		languageOptions: {
			sourceType: 'commonjs'
		},
		ignores: ['**/*.mjs']
	},
	{
		languageOptions: {
			globals: {
				...globals.mocha,
				expect: true,
				sinon: true,
			},
		},
		files: ['test/**/*']
	}
];
