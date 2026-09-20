import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

export default defineConfig([
  ...nextVitals,
  {
    files: ['**/*.{js,jsx,mjs,ts,tsx,mts,cts}'],
    // Keep compiler migration advice visible while enforcing Hooks and Next.js
    // correctness rules. This app does not enable the React Compiler yet.
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])
