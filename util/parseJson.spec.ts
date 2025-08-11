import fs from 'fs';
import path from 'path';


export function parseJson(fileName: string): any {
    const absolutePath = path.resolve(__dirname, '../data', fileName );
    console.log(`Parsing JSON file at: ${absolutePath}`);
    if (!fs.existsSync(absolutePath)) {
        throw new Error(`File not found: ${absolutePath}`);
    }

   const fileContent = fs.readFileSync(absolutePath, 'utf-8');
    try {
        const Jsonparse = JSON.parse(fileContent);
        return Jsonparse.result?.resources || {};
    } catch (error) {
        throw new Error(`Error parsing JSON from file: ${absolutePath}. ${error.message}`);
    }
}



