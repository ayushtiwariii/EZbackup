import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKUP_DIR = path.join(__dirname, '../backups');

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

export const exportFullMongoAsJSON = async (req, res) => {
  const { uri, dbName } = req.body;

  if (!uri || !dbName) {
    return res.status(400).json({ error: 'Missing required fields: uri and dbName' });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const exportDir = path.join(BACKUP_DIR, `mongo-json-${dbName}-${timestamp}`);
  const zipPath = `${exportDir}.zip`;

  try {
    if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });

    // Connect to MongoDB
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    await client.close();

    if (collections.length === 0) {
      return res.status(404).json({ error: 'No collections found in database.' });
    }

    const exportPromises = collections.map(col => {
      const filePath = path.join(exportDir, `${col.name}.json`);
      const exportCommand = `mongoexport --uri="${uri}" --db="${dbName}" --collection="${col.name}" --out="${filePath}" --jsonArray`;

      return new Promise((resolve, reject) => {
        exec(exportCommand, (err, stdout, stderr) => {
          if (err) {
            console.error(`Export error for ${col.name}:`, stderr);
            reject(`Failed to export collection: ${col.name}`);
          } else {
            resolve();
          }
        });
      });
    });

    // Wait for all exports
    await Promise.all(exportPromises);

    // Zip all exported JSON files
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(zipPath)}"`);
      res.setHeader('Content-Type', 'application/zip');
      const fileStream = fs.createReadStream(zipPath);
      fileStream.pipe(res);

      fileStream.on('end', () => {
        // Optionally clean up:
        // fs.rmSync(exportDir, { recursive: true, force: true });
        // fs.unlinkSync(zipPath);
      });
    });

    archive.on('error', err => {
      throw err;
    });

    archive.pipe(output);
    archive.directory(exportDir, false);
    archive.finalize();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Export failed', details: err.message });
  }
};
