import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKUP_DIR = path.join(__dirname, '../backups');
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

export const takeMySQLBackup = (req, res) => {
  try {

    console.log(req.body);
    const { host, port = '3306', username, password, dbName } = req.body || {};

    if (!host || !username || !password || !dbName) {
      return res.status(400).json({ error: 'Missing required fields for MySQL backup' });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `mysql-backup-${timestamp}.sql`;
    const filePath = path.join(BACKUP_DIR, fileName);

    const mysqldumpPath = `"C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe"`; // Adjust as needed

    const dumpCommand = `${mysqldumpPath} -h ${host} -P ${port} -u ${username} -p${password} ${dbName} > "${filePath}"`;

    exec(dumpCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(stderr);
        return res.status(500).json({ error: 'MySQL backup failed', details: stderr });
      }

      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', 'application/sql');

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      fileStream.on('end', () => {
        // Optionally delete the file after sending
        // fs.unlinkSync(filePath);
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong', details: err.message });
  }
};
