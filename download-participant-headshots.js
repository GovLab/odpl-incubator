const fs = require('fs');
const path = require('path');
const https = require('https');

const participantsPath = 'data/participants-local.json';
const imgDir = 'img';
const participantsData = JSON.parse(fs.readFileSync(participantsPath, 'utf8'));

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        return reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
      }
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

(async () => {
  let updated = false;
  for (const participant of participantsData.data) {
    if (participant.headshot && participant.headshot.data) {
      const urlField = participant.headshot.data.full_url || participant.headshot.data.url;
      if (urlField) {
        const filename = urlField.split('/').pop();
        const localPath = path.join(imgDir, filename);
        // Download if missing or 0 bytes
        let needsDownload = false;
        if (!fs.existsSync(localPath)) {
          needsDownload = true;
        } else {
          const stats = fs.statSync(localPath);
          if (stats.size === 0) needsDownload = true;
        }
        if (needsDownload) {
          console.log(`Downloading: ${urlField} -> ${localPath}`);
          try {
            await downloadImage(urlField, localPath);
          } catch (e) {
            console.error(`  ✗ Failed to download: ${urlField}`);
          }
        } else {
          console.log(`Already exists: ${localPath}`);
        }
        // Update JSON for offline use
        if (participant.headshot.data.url !== `/img/${filename}`) {
          participant.headshot.data.url = `/img/${filename}`;
          updated = true;
        }
      }
    }
  }
  if (updated) {
    fs.writeFileSync(participantsPath, JSON.stringify(participantsData, null, 2));
    console.log(`\n✓ Updated participant JSON with local image URLs.`);
  } else {
    console.log(`\nNo JSON updates needed.`);
  }
})(); 