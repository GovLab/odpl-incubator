const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Function to download a file
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const file = fs.createWriteStream(filepath);
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${path.basename(filepath)}`);
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete the file if there was an error
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Function to fetch JSON data with full fields
async function fetchJsonData(endpoint, filename) {
  try {
    const response = await fetch(`https://directus.thegovlab.com/odpl-incubator/items/${endpoint}?fields=*.*`);
    const data = await response.json();
    
    fs.writeFileSync(`data/${filename}`, JSON.stringify(data, null, 2));
    console.log(`✅ Downloaded ${filename}`);
    return data;
  } catch (error) {
    console.log(`❌ Failed to download ${filename}: ${error.message}`);
    return null;
  }
}

// Function to download images using private_hash from JSON data
async function downloadImagesFromData() {
  console.log('\n🖼️  Downloading missing images...\n');
  
  try {
    // Read the JSON files to get image data
    const participantsData = JSON.parse(fs.readFileSync('data/participants-local.json', 'utf8'));
    const pressData = JSON.parse(fs.readFileSync('data/press-local.json', 'utf8'));
    
    const imageDownloads = [];
    
    // Collect all image downloads from participants
    if (participantsData.data) {
      participantsData.data.forEach(participant => {
        if (participant.headshot && participant.headshot.private_hash && participant.headshot.filename_download) {
          imageDownloads.push({
            private_hash: participant.headshot.private_hash,
            filename: participant.headshot.filename_download,
            type: 'headshot'
          });
        }
      });
    }
    
    // Collect all image downloads from press
    if (pressData.data) {
      pressData.data.forEach(press => {
        if (press.thumbnail && press.thumbnail.private_hash && press.thumbnail.filename_download) {
          imageDownloads.push({
            private_hash: press.thumbnail.private_hash,
            filename: press.thumbnail.filename_download,
            type: 'thumbnail'
          });
        }
      });
    }
    
    console.log(`📁 Found ${imageDownloads.length} images to download\n`);
    
    // Download each image using the private_hash
    for (const image of imageDownloads) {
      const url = `https://directus.thegovlab.com/odpl-incubator/assets/${image.private_hash}?key=directus-medium-contain`;
      const filepath = `img/${image.filename}`;
      
      try {
        await downloadFile(url, filepath);
      } catch (error) {
        console.log(`❌ Failed to download ${image.filename}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.log(`❌ Error downloading images: ${error.message}`);
  }
}

// Main execution
async function main() {
  console.log('🚀 Fixing participants and press data...\n');
  
  // Step 1: Re-download participants and press data with full fields
  console.log('📊 Step 1: Re-downloading data with full fields...\n');
  await fetchJsonData('participants', 'participants-local.json');
  await fetchJsonData('press', 'press-local.json');
  
  // Step 2: Download missing images
  await downloadImagesFromData();
  
  // Step 3: Fix JSON structure
  console.log('\n🔧 Step 3: Fixing JSON structure...\n');
  const { execSync } = require('child_process');
  try {
    execSync('node fix-json-structure.js', { stdio: 'inherit' });
  } catch (error) {
    console.log('❌ Error running fix script:', error.message);
  }
  
  console.log('\n✅ Participants and press data fixed!');
}

// Run the script
main().catch(console.error); 