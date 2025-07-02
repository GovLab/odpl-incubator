const fs = require('fs');
const path = require('path');
const https = require('https');

const pressPath = 'data/press-local.json';
const featuredPressPath = 'data/featured-press-local.json';
const imgDir = 'img';

// Load both press JSON files
const pressData = JSON.parse(fs.readFileSync(pressPath, 'utf8'));
const featuredPressData = JSON.parse(fs.readFileSync(featuredPressPath, 'utf8'));

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

async function processPressItems(pressItems, sourceName) {
  console.log(`Processing ${pressItems.length} ${sourceName}...`);
  
  let downloadedCount = 0;
  let updatedCount = 0;
  
  for (let i = 0; i < pressItems.length; i++) {
    const press = pressItems[i];
    console.log(`\n${sourceName} ${i + 1}: ${press.title || 'Untitled'}`);
    
    if (press.thumbnail && press.thumbnail.data) {
      const thumbnailData = press.thumbnail.data;
      
      // Try full_url, then url
      const urlField = thumbnailData.full_url || thumbnailData.url;
      
      if (urlField) {
        // Extract filename from URL
        const filename = urlField.split('/').pop();
        const localPath = path.join(imgDir, filename);
        
        console.log(`  URL: ${urlField}`);
        console.log(`  Filename: ${filename}`);
        
        // Check if file exists and has content
        if (!fs.existsSync(localPath) || fs.statSync(localPath).size === 0) {
          try {
            console.log(`  Downloading to: ${localPath}`);
            await downloadImage(urlField, localPath);
            downloadedCount++;
            console.log(`  ✓ Downloaded successfully`);
          } catch (error) {
            console.log(`  ✗ Download failed: ${error.message}`);
          }
        } else {
          console.log(`  ✓ File already exists: ${localPath}`);
        }
        
        // Update the JSON to use local path
        if (press.thumbnail.data.url !== `/img/${filename}`) {
          press.thumbnail.data.url = `/img/${filename}`;
          updatedCount++;
          console.log(`  ✓ Updated JSON to use local path: /img/${filename}`);
        }
      } else {
        console.log(`  ✗ No URL found in thumbnail data`);
      }
    } else {
      console.log(`  ✗ No thumbnail data found`);
    }
  }
  
  return { downloadedCount, updatedCount };
}

async function processAllPress() {
  console.log('Processing all press images...\n');
  
  // Process regular press
  const pressResults = await processPressItems(pressData.data, 'Press Item');
  
  // Process featured press
  const featuredResults = await processPressItems(featuredPressData.data, 'Featured Press Item');
  
  // Save updated JSON files if needed
  if (pressResults.updatedCount > 0) {
    fs.writeFileSync(pressPath, JSON.stringify(pressData, null, 2));
    console.log(`\n✓ Updated ${pressResults.updatedCount} press records in JSON`);
  }
  
  if (featuredResults.updatedCount > 0) {
    fs.writeFileSync(featuredPressPath, JSON.stringify(featuredPressData, null, 2));
    console.log(`\n✓ Updated ${featuredResults.updatedCount} featured press records in JSON`);
  }
  
  console.log(`\nSummary:`);
  console.log(`- Downloaded: ${pressResults.downloadedCount + featuredResults.downloadedCount} new images`);
  console.log(`- Updated: ${pressResults.updatedCount + featuredResults.updatedCount} JSON records`);
  console.log(`- Total press items processed: ${pressData.data.length + featuredPressData.data.length}`);
}

processAllPress().catch(console.error); 