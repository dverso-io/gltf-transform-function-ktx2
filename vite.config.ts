import dts from "vite-plugin-dts";
import path from "path";
import { defineConfig, UserConfig } from "vite";
import wasm from "vite-plugin-wasm";
import arraybuffer from "vite-plugin-arraybuffer"
import topLevelAwait from "vite-plugin-top-level-await";
export default defineConfig({
  base: "./",
  plugins: [
    dts({ rollupTypes: true }),
    wasm(),
    arraybuffer(),
    topLevelAwait()
  ],
  build: {
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "mylib",
      formats: ["es", "cjs", "umd", "iife"],
      fileName: (format) => `index.${format}.js`,
    },
  },
} satisfies UserConfig);
