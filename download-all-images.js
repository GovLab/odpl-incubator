const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Create img directory if it doesn't exist
if (!fs.existsSync('img')) {
  fs.mkdirSync('img');
}

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

// Function to create simple placeholder images using base64 data
function createSimplePlaceholderImages() {
  console.log('\n🎨 Creating simple placeholder images...\n');
  
  // Simple gray placeholder images as base64
  const headshotPlaceholder = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAEsASwDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
  const pressPlaceholder = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAEsASwDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
  
  try {
    // Convert base64 to buffer and save
    const headshotBuffer = Buffer.from(headshotPlaceholder.split(',')[1], 'base64');
    const pressBuffer = Buffer.from(pressPlaceholder.split(',')[1], 'base64');
    
    fs.writeFileSync('img/placeholder-headshot.jpg', headshotBuffer);
    fs.writeFileSync('img/placeholder-press.jpg', pressBuffer);
    
    console.log('✅ Created placeholder-headshot.jpg');
    console.log('✅ Created placeholder-press.jpg');
    console.log('✅ All placeholder images created!');
  } catch (error) {
    console.log(`❌ Error creating placeholders: ${error.message}`);
  }
}

// Function to download images from Directus API
async function downloadImagesFromAPI() {
  console.log('🖼️  Downloading images from Directus API...\n');
  
  try {
    // Get all files from Directus
    const response = await fetch('https://directus.thegovlab.com/odpl-incubator/files');
    const filesData = await response.json();
    
    if (!filesData.data || !Array.isArray(filesData.data)) {
      console.log('❌ No files found in API response');
      return;
    }
    
    console.log(`📁 Found ${filesData.data.length} files to download\n`);
    
    // Download each file using the correct URL format
    for (const file of filesData.data) {
      if (file.id && file.filename_download) {
        // Use the correct URL format: /odpl-incubator/assets/[file-id]?key=directus-medium-contain
        const url = `https://directus.thegovlab.com/odpl-incubator/assets/${file.id}?key=directus-medium-contain`;
        const filepath = `img/${file.filename_download}`;
        
        try {
          await downloadFile(url, filepath);
        } catch (error) {
          console.log(`❌ Failed to download ${file.filename_download}: ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.log(`❌ Error fetching files from API: ${error.message}`);
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting comprehensive image download...\n');
  
  // First try to download from API
  await downloadImagesFromAPI();
  
  // Then create placeholders
  createSimplePlaceholderImages();
  
  console.log('\n✅ Image download process completed!');
  console.log('📁 Check the img/ directory for all downloaded images.');
}

// Run the script
main().catch(console.error); 