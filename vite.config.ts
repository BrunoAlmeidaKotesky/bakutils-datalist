import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { libInjectCss } from 'vite-plugin-lib-inject-css'
import { glob } from 'glob'
import { extname, join, relative, resolve } from 'path'
import { fileURLToPath } from 'node:url'
import { readdir, stat, readFile, unlink } from 'fs'

const directoryPath = join(__dirname, 'dist');
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    libInjectCss(),
    dts({
      include: ['lib'],
      afterBuild: (_emited) => {
        deleteEmptyJsFiles(directoryPath);
      }
    })
  ],
  build: {
    emptyOutDir: false,

    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      formats: ['es']
    },
    copyPublicDir: false,
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      input: Object.fromEntries(
        glob.sync('lib/**/*.{ts,tsx}').map(file => [
          // The name of the entry point
          // lib/nested/foo.ts becomes nested/foo
          relative(
            'lib',
            file.slice(0, file.length - extname(file).length)
          ),
          // The absolute path to the entry file
          // lib/nested/foo.ts becomes /project/lib/nested/foo.ts
          fileURLToPath(new URL(file, import.meta.url))
        ])
      ),
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        assetFileNames: 'assets/[name][extname]',
        entryFileNames: '[name].js',
      }
    }
  }
});

function deleteEmptyJsFiles(dirPath: string) {
  readdir(dirPath, (err, files) => {
    if (err) throw err;

    files.forEach(file => {
      const filePath = join(dirPath, file);
      stat(filePath, (err, stats) => {
        if (err) throw err;

        if (stats.isDirectory()) {
          deleteEmptyJsFiles(filePath);
        } else if (file.endsWith('.js')) {
          readFile(filePath, 'utf8', (err, data) => {
            if (err) throw err;
            if (!data.trim()) {
              unlink(filePath, (err) => {
                if (err) throw err;
                console.log(`Deleted empty file: ${filePath}`);
              });
            }
          });
        }
      });
    });
  });
}