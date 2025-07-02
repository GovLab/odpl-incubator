const fs = require('fs');
const path = require('path');
const https = require('https');

const mentorsPath = 'data/mentors-local.json';
const imgDir = 'img';
const mentorsData = JSON.parse(fs.readFileSync(mentorsPath, 'utf8'));

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

async function processMentors() {
  console.log(`Processing ${mentorsData.data.length} mentors...`);
  
  let downloadedCount = 0;
  let updatedCount = 0;
  
  for (let i = 0; i < mentorsData.data.length; i++) {
    const mentor = mentorsData.data[i];
    console.log(`\nMentor ${i + 1}: ${mentor.first_name} ${mentor.last_name}`);
    
    if (mentor.headshot && mentor.headshot.data) {
      const headshotData = mentor.headshot.data;
      
      // Try full_url, then url
      const urlField = headshotData.full_url || headshotData.url;
      
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
        if (mentor.headshot.data.url !== `/img/${filename}`) {
          mentor.headshot.data.url = `/img/${filename}`;
          updatedCount++;
          console.log(`  ✓ Updated JSON to use local path: /img/${filename}`);
        }
      } else {
        console.log(`  ✗ No URL found in headshot data`);
      }
    } else {
      console.log(`  ✗ No headshot data found`);
    }
  }
  
  // Save updated JSON
  if (updatedCount > 0) {
    fs.writeFileSync(mentorsPath, JSON.stringify(mentorsData, null, 2));
    console.log(`\n✓ Updated ${updatedCount} mentor records in JSON`);
  }
  
  console.log(`\nSummary:`);
  console.log(`- Downloaded: ${downloadedCount} new images`);
  console.log(`- Updated: ${updatedCount} JSON records`);
  console.log(`- Total mentors processed: ${mentorsData.data.length}`);
}

processMentors().catch(console.error); 