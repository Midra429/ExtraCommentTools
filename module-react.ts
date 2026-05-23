import 'wxt'

import { addImportPreset, addViteConfig, defineWxtModule } from 'wxt/modules'
import babel from '@rolldown/plugin-babel'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'

/**
 * @see https://github.com/wxt-dev/wxt/blob/main/packages/module-react/modules/react.ts
 */

export default defineWxtModule({
  name: '@midra/module-react',
  configKey: 'react',
  setup(wxt, options) {
    const { vite, vitePluginsBefore } = options ?? {}

    addViteConfig(wxt, () => ({
      plugins: [
        ...(vitePluginsBefore ?? []),
        react(vite),
        babel({
          presets: [reactCompilerPreset()],
        }),
      ],
    }))

    addImportPreset(wxt, 'react')

    // Enable auto-imports for JSX files
    wxt.hook('config:resolved', (wxt) => {
      // In older versions of WXT, `wxt.config.imports` could be false
      if (!wxt.config.imports) return

      wxt.config.imports.dirsScanOptions ??= {}
      wxt.config.imports.dirsScanOptions.filePatterns = [
        // Default plus JSX/TSX
        '*.{ts,js,mjs,cjs,mts,cts,jsx,tsx}',
      ]
    })
  },
})
