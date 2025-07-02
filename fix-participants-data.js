const fs = require('fs');
const path = require('path');
const https = require('https');

// Function to make HTTPS request
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

// Function to download image
function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filename);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filename, () => {}); // Delete the file async
            reject(err);
        });
    });
}

async function fixParticipantsData() {
    try {
        console.log('Fetching participants data with expanded image objects...');
        
        // Fetch participants with expanded headshot objects
        const participantsUrl = 'https://directus.thegovlab.com/odpl-incubator/items/participants?fields=*,headshot.*.*';
        const participantsData = await makeRequest(participantsUrl);
        
        console.log(`Found ${participantsData.data.length} participants`);
        
        // Process each participant
        for (const participant of participantsData.data) {
            console.log(`Processing participant: ${participant.name || participant.id}`);
            
            // If headshot is an object with image data, download the image
            if (participant.headshot && typeof participant.headshot === 'object' && participant.headshot.filename_download) {
                const imageUrl = `https://directus.thegovlab.com/odpl-incubator/assets/${participant.headshot.id}?key=directus-medium-contain`;
                const localFilename = `img/${participant.headshot.filename_download}`;
                
                // Ensure img directory exists
                if (!fs.existsSync('img')) {
                    fs.mkdirSync('img');
                }
                
                try {
                    console.log(`Downloading image: ${localFilename}`);
                    await downloadImage(imageUrl, localFilename);
                    
                    // Update the headshot URL to point to local file
                    participant.headshot.url = `/${localFilename}`;
                    participant.headshot.thumbnails = {
                        "directus-medium-contain": {
                            "url": `/${localFilename}`,
                            "width": participant.headshot.width || 400,
                            "height": participant.headshot.height || 400
                        }
                    };
                } catch (error) {
                    console.log(`Failed to download image for ${participant.name}: ${error.message}`);
                    // Create placeholder image reference
                    participant.headshot.url = '/img/placeholder-headshot.jpg';
                    participant.headshot.thumbnails = {
                        "directus-medium-contain": {
                            "url": "/img/placeholder-headshot.jpg",
                            "width": 400,
                            "height": 400
                        }
                    };
                }
            } else if (participant.headshot && typeof participant.headshot === 'string') {
                // If headshot is just a string ID, create placeholder
                participant.headshot = {
                    url: '/img/placeholder-headshot.jpg',
                    thumbnails: {
                        "directus-medium-contain": {
                            "url": "/img/placeholder-headshot.jpg",
                            "width": 400,
                            "height": 400
                        }
                    }
                };
            } else {
                // No headshot, create placeholder
                participant.headshot = {
                    url: '/img/placeholder-headshot.jpg',
                    thumbnails: {
                        "directus-medium-contain": {
                            "url": "/img/placeholder-headshot.jpg",
                            "width": 400,
                            "height": 400
                        }
                    }
                };
            }
        }
        
        // Save the fixed participants data
        fs.writeFileSync('data/participants-local.json', JSON.stringify(participantsData, null, 2));
        console.log('Participants data saved with fixed image references');
        
        // Also fetch and fix press data
        console.log('Fetching press data with expanded image objects...');
        const pressUrl = 'https://directus.thegovlab.com/odpl-incubator/items/press?fields=*,thumbnail.*.*';
        const pressData = await makeRequest(pressUrl);
        
        console.log(`Found ${pressData.data.length} press items`);
        
        // Process each press item
        for (const pressItem of pressData.data) {
            console.log(`Processing press item: ${pressItem.title || pressItem.id}`);
            
            if (pressItem.thumbnail && typeof pressItem.thumbnail === 'object' && pressItem.thumbnail.filename_download) {
                const imageUrl = `https://directus.thegovlab.com/odpl-incubator/assets/${pressItem.thumbnail.id}?key=directus-medium-contain`;
                const localFilename = `img/${pressItem.thumbnail.filename_download}`;
                
                try {
                    console.log(`Downloading press image: ${localFilename}`);
                    await downloadImage(imageUrl, localFilename);
                    
                    // Update the thumbnail URL to point to local file
                    pressItem.thumbnail.url = `/${localFilename}`;
                    pressItem.thumbnail.thumbnails = {
                        "directus-medium-contain": {
                            "url": `/${localFilename}`,
                            "width": pressItem.thumbnail.width || 400,
                            "height": pressItem.thumbnail.height || 400
                        }
                    };
                } catch (error) {
                    console.log(`Failed to download press image for ${pressItem.title}: ${error.message}`);
                    pressItem.thumbnail.url = '/img/placeholder-press.jpg';
                    pressItem.thumbnail.thumbnails = {
                        "directus-medium-contain": {
                            "url": "/img/placeholder-press.jpg",
                            "width": 400,
                            "height": 400
                        }
                    };
                }
            } else {
                // No thumbnail, create placeholder
                pressItem.thumbnail = {
                    url: '/img/placeholder-press.jpg',
                    thumbnails: {
                        "directus-medium-contain": {
                            "url": "/img/placeholder-press.jpg",
                            "width": 400,
                            "height": 400
                        }
                    }
                };
            }
        }
        
        // Save the fixed press data
        fs.writeFileSync('data/press-local.json', JSON.stringify(pressData, null, 2));
        console.log('Press data saved with fixed image references');
        
        console.log('All data fetching and image downloading completed!');
        
    } catch (error) {
        console.error('Error:', error);
    }
}

fixParticipantsData(); 