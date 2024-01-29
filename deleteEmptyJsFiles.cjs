import { join } from 'path';
import { readFile, stat, readdir, unlink } from 'fs';

const directoryPath = join(__dirname, 'dist'); // Ajuste para o caminho correto do seu diretório 'dist'

function deleteEmptyJsFiles(dirPath) {
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

deleteEmptyJsFiles(directoryPath);