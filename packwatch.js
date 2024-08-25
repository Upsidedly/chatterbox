import { $ } from "bun";
import chkdr from 'chokidar'

chkdr.watch('./src/**/*.{ts,luau}').on('change', async () => {
    console.log('[PACKWATCH] :: Packing...')
    const s = await $`bun pack`
    console.log('[PACKWATCH] :: Packed!')
    await $`cd ../cb-test && bun reinstall && cd ../chatterbox`
    console.log('[PACKWATCH] :: Installed!')
})