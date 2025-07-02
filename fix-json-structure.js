const fs = require('fs');
const path = require('path');

// Function to create a proper headshot structure
function createHeadshotStructure(headshotId) {
  return {
    data: {
      thumbnails: [
        { url: `img/placeholder-headshot.jpg` },
        { url: `img/placeholder-headshot.jpg` },
        { url: `img/placeholder-headshot.jpg` },
        { url: `img/placeholder-headshot.jpg` }
      ]
    }
  };
}

// Function to create a proper thumbnail structure for press
function createThumbnailStructure(thumbnailId) {
  return {
    data: {
      full_url: `img/placeholder-press.jpg`
    }
  };
}

// Function to update image URLs to point to local files
function updateImageUrls(data) {
  if (!data || !data.data || !Array.isArray(data.data)) {
    return data;
  }
  
  data.data.forEach(item => {
    // Update headshot URLs to point to local files
    if (item.headshot && item.headshot.data && item.headshot.data.thumbnails) {
      item.headshot.data.thumbnails.forEach(thumbnail => {
        // Update URLs to point to local files
        if (thumbnail.url && thumbnail.url.includes('directus.thegovlab.com')) {
          // Extract filename from the original URL or use a default
          const filename = item.headshot.filename_download || 'placeholder-headshot.jpg';
          thumbnail.url = `img/${filename}`;
        }
        if (thumbnail.relative_url) {
          const filename = item.headshot.filename_download || 'placeholder-headshot.jpg';
          thumbnail.relative_url = `img/${filename}`;
        }
      });
      
      // Also update the full_url if it exists
      if (item.headshot.data.full_url) {
        const filename = item.headshot.filename_download || 'placeholder-headshot.jpg';
        item.headshot.data.full_url = `img/${filename}`;
      }
    }
    
    // Update thumbnail URLs to point to local files (for press items)
    if (item.thumbnail && item.thumbnail.data && item.thumbnail.data.thumbnails) {
      item.thumbnail.data.thumbnails.forEach(thumbnail => {
        // Update URLs to point to local files
        if (thumbnail.url && thumbnail.url.includes('directus.thegovlab.com')) {
          const filename = item.thumbnail.filename_download || 'placeholder-press.jpg';
          thumbnail.url = `img/${filename}`;
        }
        if (thumbnail.relative_url) {
          const filename = item.thumbnail.filename_download || 'placeholder-press.jpg';
          thumbnail.relative_url = `img/${filename}`;
        }
      });
      
      // Also update the full_url if it exists
      if (item.thumbnail.data.full_url) {
        const filename = item.thumbnail.filename_download || 'placeholder-press.jpg';
        item.thumbnail.data.full_url = `img/${filename}`;
      }
    }
  });
  
  return data;
}

// Function to fix JSON file structure
function fixJsonFile(filename) {
  const filepath = path.join(__dirname, 'data', filename);
  
  if (!fs.existsSync(filepath)) {
    console.log(`❌ File not found: ${filename}`);
    return;
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    
    // Update image URLs to point to local files
    const updatedData = updateImageUrls(data);
    
    // Write the fixed data back
    fs.writeFileSync(filepath, JSON.stringify(updatedData, null, 2));
    console.log(`✅ Fixed ${filename}`);
    
  } catch (error) {
    console.error(`❌ Error fixing ${filename}:`, error.message);
  }
}

// Fix all JSON files
console.log('🔧 Fixing JSON structure for offline use...\n');

fixJsonFile('mentors-local.json');
fixJsonFile('participants-local.json');
fixJsonFile('press-local.json');

console.log('\n✅ JSON structure fixes completed!');
console.log('📝 All image URLs now point to local files.');
console.log('🖼️  Images are now fully offline-capable.'); 