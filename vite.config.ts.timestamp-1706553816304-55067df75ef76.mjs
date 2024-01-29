// vite.config.ts
import { defineConfig } from "file:///F:/Projetos%20Individuais/bakutils-datalist/node_modules/vite/dist/node/index.js";
import react from "file:///F:/Projetos%20Individuais/bakutils-datalist/node_modules/@vitejs/plugin-react/dist/index.mjs";
import dts from "file:///F:/Projetos%20Individuais/bakutils-datalist/node_modules/vite-plugin-dts/dist/index.mjs";
import { libInjectCss } from "file:///F:/Projetos%20Individuais/bakutils-datalist/node_modules/vite-plugin-lib-inject-css/dist/index.mjs";
import { glob } from "file:///F:/Projetos%20Individuais/bakutils-datalist/node_modules/glob/dist/esm/index.js";
import { extname, join, relative, resolve } from "path";
import { fileURLToPath } from "node:url";
import { readdir, stat, readFile, unlink } from "fs";
var __vite_injected_original_dirname = "F:\\Projetos Individuais\\bakutils-datalist";
var __vite_injected_original_import_meta_url = "file:///F:/Projetos%20Individuais/bakutils-datalist/vite.config.ts";
var directoryPath = join(__vite_injected_original_dirname, "dist");
var vite_config_default = defineConfig({
  plugins: [
    react(),
    libInjectCss(),
    dts({
      include: ["lib"],
      afterBuild: (_emited) => {
        deleteEmptyJsFiles(directoryPath);
      }
    })
  ],
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__vite_injected_original_dirname, "lib/main.ts"),
      formats: ["es"]
    },
    copyPublicDir: false,
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      input: Object.fromEntries(
        glob.sync("lib/**/*.{ts,tsx}").map((file) => [
          // The name of the entry point
          // lib/nested/foo.ts becomes nested/foo
          relative(
            "lib",
            file.slice(0, file.length - extname(file).length)
          ),
          // The absolute path to the entry file
          // lib/nested/foo.ts becomes /project/lib/nested/foo.ts
          fileURLToPath(new URL(file, __vite_injected_original_import_meta_url))
        ])
      ),
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM"
        },
        assetFileNames: "assets/[name][extname]",
        entryFileNames: "[name].js"
      }
    }
  }
});
function deleteEmptyJsFiles(dirPath) {
  readdir(dirPath, (err, files) => {
    if (err)
      throw err;
    files.forEach((file) => {
      const filePath = join(dirPath, file);
      stat(filePath, (err2, stats) => {
        if (err2)
          throw err2;
        if (stats.isDirectory()) {
          deleteEmptyJsFiles(filePath);
        } else if (file.endsWith(".js")) {
          readFile(filePath, "utf8", (err3, data) => {
            if (err3)
              throw err3;
            if (!data.trim()) {
              unlink(filePath, (err4) => {
                if (err4)
                  throw err4;
                console.log(`Deleted empty file: ${filePath}`);
              });
            }
          });
        }
      });
    });
  });
}
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJGOlxcXFxQcm9qZXRvcyBJbmRpdmlkdWFpc1xcXFxiYWt1dGlscy1kYXRhbGlzdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRjpcXFxcUHJvamV0b3MgSW5kaXZpZHVhaXNcXFxcYmFrdXRpbHMtZGF0YWxpc3RcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Y6L1Byb2pldG9zJTIwSW5kaXZpZHVhaXMvYmFrdXRpbHMtZGF0YWxpc3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IGR0cyBmcm9tICd2aXRlLXBsdWdpbi1kdHMnXG5pbXBvcnQgeyBsaWJJbmplY3RDc3MgfSBmcm9tICd2aXRlLXBsdWdpbi1saWItaW5qZWN0LWNzcydcbmltcG9ydCB7IGdsb2IgfSBmcm9tICdnbG9iJ1xuaW1wb3J0IHsgZXh0bmFtZSwgam9pbiwgcmVsYXRpdmUsIHJlc29sdmUgfSBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ25vZGU6dXJsJ1xuaW1wb3J0IHsgcmVhZGRpciwgc3RhdCwgcmVhZEZpbGUsIHVubGluayB9IGZyb20gJ2ZzJ1xuXG5jb25zdCBkaXJlY3RvcnlQYXRoID0gam9pbihfX2Rpcm5hbWUsICdkaXN0Jyk7XG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgbGliSW5qZWN0Q3NzKCksXG4gICAgZHRzKHtcbiAgICAgIGluY2x1ZGU6IFsnbGliJ10sXG4gICAgICBhZnRlckJ1aWxkOiAoX2VtaXRlZCkgPT4ge1xuICAgICAgICBkZWxldGVFbXB0eUpzRmlsZXMoZGlyZWN0b3J5UGF0aCk7XG4gICAgICB9XG4gICAgfSlcbiAgXSxcbiAgYnVpbGQ6IHtcbiAgICBlbXB0eU91dERpcjogZmFsc2UsXG5cbiAgICBsaWI6IHtcbiAgICAgIGVudHJ5OiByZXNvbHZlKF9fZGlybmFtZSwgJ2xpYi9tYWluLnRzJyksXG4gICAgICBmb3JtYXRzOiBbJ2VzJ11cbiAgICB9LFxuICAgIGNvcHlQdWJsaWNEaXI6IGZhbHNlLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGV4dGVybmFsOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC9qc3gtcnVudGltZSddLFxuICAgICAgaW5wdXQ6IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgZ2xvYi5zeW5jKCdsaWIvKiovKi57dHMsdHN4fScpLm1hcChmaWxlID0+IFtcbiAgICAgICAgICAvLyBUaGUgbmFtZSBvZiB0aGUgZW50cnkgcG9pbnRcbiAgICAgICAgICAvLyBsaWIvbmVzdGVkL2Zvby50cyBiZWNvbWVzIG5lc3RlZC9mb29cbiAgICAgICAgICByZWxhdGl2ZShcbiAgICAgICAgICAgICdsaWInLFxuICAgICAgICAgICAgZmlsZS5zbGljZSgwLCBmaWxlLmxlbmd0aCAtIGV4dG5hbWUoZmlsZSkubGVuZ3RoKVxuICAgICAgICAgICksXG4gICAgICAgICAgLy8gVGhlIGFic29sdXRlIHBhdGggdG8gdGhlIGVudHJ5IGZpbGVcbiAgICAgICAgICAvLyBsaWIvbmVzdGVkL2Zvby50cyBiZWNvbWVzIC9wcm9qZWN0L2xpYi9uZXN0ZWQvZm9vLnRzXG4gICAgICAgICAgZmlsZVVSTFRvUGF0aChuZXcgVVJMKGZpbGUsIGltcG9ydC5tZXRhLnVybCkpXG4gICAgICAgIF0pXG4gICAgICApLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgICByZWFjdDogJ1JlYWN0JyxcbiAgICAgICAgICAncmVhY3QtZG9tJzogJ1JlYWN0RE9NJ1xuICAgICAgICB9LFxuICAgICAgICBhc3NldEZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV1bZXh0bmFtZV0nLFxuICAgICAgICBlbnRyeUZpbGVOYW1lczogJ1tuYW1lXS5qcycsXG4gICAgICB9XG4gICAgfVxuICB9XG59KTtcblxuZnVuY3Rpb24gZGVsZXRlRW1wdHlKc0ZpbGVzKGRpclBhdGg6IHN0cmluZykge1xuICByZWFkZGlyKGRpclBhdGgsIChlcnIsIGZpbGVzKSA9PiB7XG4gICAgaWYgKGVycikgdGhyb3cgZXJyO1xuXG4gICAgZmlsZXMuZm9yRWFjaChmaWxlID0+IHtcbiAgICAgIGNvbnN0IGZpbGVQYXRoID0gam9pbihkaXJQYXRoLCBmaWxlKTtcbiAgICAgIHN0YXQoZmlsZVBhdGgsIChlcnIsIHN0YXRzKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHRocm93IGVycjtcblxuICAgICAgICBpZiAoc3RhdHMuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgIGRlbGV0ZUVtcHR5SnNGaWxlcyhmaWxlUGF0aCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZmlsZS5lbmRzV2l0aCgnLmpzJykpIHtcbiAgICAgICAgICByZWFkRmlsZShmaWxlUGF0aCwgJ3V0ZjgnLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB0aHJvdyBlcnI7XG4gICAgICAgICAgICBpZiAoIWRhdGEudHJpbSgpKSB7XG4gICAgICAgICAgICAgIHVubGluayhmaWxlUGF0aCwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgRGVsZXRlZCBlbXB0eSBmaWxlOiAke2ZpbGVQYXRofWApO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAg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
