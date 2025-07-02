const fs = require('fs');
const https = require('https');
const path = require('path');

const endpoints = [
  {
    url: 'https://directus.thegovlab.com/odpl-incubator/items/mentors?sort=-last_name&fields=*.*',
    file: 'data/mentors-local.json',
  },
  {
    url: 'https://directus.thegovlab.com/odpl-incubator/items/selected_participants?sort=last_name&fields=*.*',
    file: 'data/participants-local.json',
  },
  {
    url: 'https://directus.thegovlab.com/odpl-incubator/items/news?fields=*.*',
    file: 'data/press-local.json',
  },
  {
    url: 'https://directus.thegovlab.com/odpl-incubator/items/news?filter[feature]=1&fields=*.*',
    file: 'data/featured-press-local.json',
  },
  {
    url: 'https://directus.thegovlab.com/odpl-incubator/items/faq?fields=*.*',
    file: 'data/faq-local.json',
  },
  {
    url: 'https://directus.thegovlab.com/odpl-incubator/items/alert_banner?fields=*.*',
    file: 'data/alerts-local.json',
  },
];

function download(url, file) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          // Try to parse to check for errors
          const parsed = JSON.parse(data);
          fs.writeFileSync(file, JSON.stringify(parsed, null, 2));
          console.log(`Saved: ${file}`);
          resolve();
        } catch (e) {
          console.error(`Error parsing JSON from ${url}`);
          console.error(data);
          reject(e);
        }
      });
    }).on('error', (err) => {
      console.error(`Error downloading ${url}`);
      reject(err);
    });
  });
}

async function main() {
  // Ensure data directory exists
  if (!fs.existsSync('data')) {
    fs.mkdirSync('data');
  }
  for (const endpoint of endpoints) {
    try {
      await download(endpoint.url, endpoint.file);
    } catch (e) {
      console.error(`Failed to download ${endpoint.url}`);
    }
  }
  console.log('All downloads complete.');
}

main(); 