const fs = require('fs');
const path = require('path');

// Directus API configuration
const DIRECTUS_URL = 'https://directus.thegovlab.com';
const PROJECT = 'odpl-incubator';

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Function to fetch data from Directus API using the correct endpoint format
async function fetchFromDirectus(endpoint, params = {}) {
  // Use the correct Directus API endpoint format based on the working URL
  const url = new URL(`/odpl-incubator/items/${endpoint}`, DIRECTUS_URL);
  
  // Add query parameters
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined) {
      url.searchParams.append(key, JSON.stringify(params[key]));
    }
  });
  
  console.log(`Fetching ${endpoint} from: ${url.toString()}`);
  
  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error.message);
    return null;
  }
}

// Function to save data to JSON file
function saveToJson(filename, data) {
  const filepath = path.join(dataDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`✅ Saved ${filename}`);
}

// Main function to download all data
async function downloadAllData() {
  console.log('🚀 Starting data download for ODPL Incubator...\n');

  // Download mentors data
  console.log('📥 Downloading mentors...');
  const mentorsData = await fetchFromDirectus('mentors');
  if (mentorsData) {
    saveToJson('mentors-local.json', mentorsData);
  }

  // Download participants data
  console.log('📥 Downloading participants...');
  const participantsData = await fetchFromDirectus('selected_participants');
  if (participantsData) {
    saveToJson('participants-local.json', participantsData);
  }

  // Download press/news data
  console.log('📥 Downloading press/news...');
  const pressData = await fetchFromDirectus('news');
  if (pressData) {
    saveToJson('press-local.json', pressData);
  }

  // Download featured press data - we'll filter this later
  console.log('📥 Downloading featured press...');
  const featuredPressData = await fetchFromDirectus('news');
  if (featuredPressData) {
    // Filter for featured items locally
    const filteredData = {
      ...featuredPressData,
      data: featuredPressData.data.filter(item => item.feature === '1')
    };
    saveToJson('featured-press-local.json', filteredData);
  }

  // Download FAQ data
  console.log('📥 Downloading FAQ...');
  const faqData = await fetchFromDirectus('faq');
  if (faqData) {
    saveToJson('faq-local.json', faqData);
  }

  // Download alert banner data
  console.log('📥 Downloading alert banners...');
  const alertData = await fetchFromDirectus('alert_banner');
  if (alertData) {
    saveToJson('alerts-local.json', alertData);
  }

  console.log('\n✅ All data downloaded successfully!');
  console.log(`📁 Data saved to: ${dataDir}`);
  
  // Create a summary file
  const summary = {
    timestamp: new Date().toISOString(),
    totalFiles: 6,
    files: [
      'mentors-local.json',
      'participants-local.json', 
      'press-local.json',
      'featured-press-local.json',
      'faq-local.json',
      'alerts-local.json'
    ]
  };
  
  saveToJson('download-summary.json', summary);
  console.log('📋 Summary saved to: data/download-summary.json');
}

// Run the download
downloadAllData().catch(console.error); 