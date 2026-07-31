import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base: './' にすることで、GitHub Pages のサブパス配信でも
// アセットの参照が壊れないようにする
export default defineConfig({
  plugins: [react()],
  base: './',
})
