const fs = require('fs');
const path = require('path');

// Read the participants JSON
const participantsPath = 'data/participants-local.json';
const participantsData = JSON.parse(fs.readFileSync(participantsPath, 'utf8'));

console.log('Checking participants data structure...');
console.log(`Total participants: ${participantsData.data.length}`);

// Check each participant's headshot structure
let fixedCount = 0;
participantsData.data.forEach((participant, index) => {
  console.log(`\nParticipant ${index + 1}: ${participant.first_name} ${participant.last_name}`);
  
  if (participant.headshot) {
    console.log('  Headshot type:', typeof participant.headshot);
    
    if (typeof participant.headshot === 'object' && participant.headshot.data) {
      console.log('  Headshot has data object');
      
      // Check if it has filename_download
      if (participant.headshot.data.filename_download) {
        const filename = participant.headshot.data.filename_download;
        console.log('  Filename:', filename);
        
        // Check if file exists in img directory
        const imgPath = path.join('img', filename);
        if (fs.existsSync(imgPath)) {
          console.log('  ✓ Image file exists');
          
          // Update the URL to point to local file
          if (participant.headshot.data.url && !participant.headshot.data.url.startsWith('/img/')) {
            participant.headshot.data.url = `/img/${filename}`;
            fixedCount++;
            console.log('  ✓ Fixed URL to local path');
          }
        } else {
          console.log('  ✗ Image file missing:', imgPath);
        }
      } else {
        console.log('  ✗ No filename_download found');
      }
    } else if (typeof participant.headshot === 'number') {
      console.log('  ✗ Headshot is just an ID:', participant.headshot);
    } else {
      console.log('  ✗ Unexpected headshot structure:', participant.headshot);
    }
  } else {
    console.log('  ✗ No headshot field');
  }
});

// Save the fixed data
if (fixedCount > 0) {
  fs.writeFileSync(participantsPath, JSON.stringify(participantsData, null, 2));
  console.log(`\n✓ Fixed ${fixedCount} image URLs and saved to ${participantsPath}`);
} else {
  console.log('\nNo fixes needed or no changes made');
}

// Also check what files are actually in the img directory
console.log('\nChecking img directory contents...');
const imgFiles = fs.readdirSync('img');
console.log(`Total files in img directory: ${imgFiles.length}`);

// Show some sample files
console.log('Sample image files:');
imgFiles.slice(0, 10).forEach(file => {
  const stats = fs.statSync(path.join('img', file));
  console.log(`  ${file} (${stats.size} bytes)`);
}); 