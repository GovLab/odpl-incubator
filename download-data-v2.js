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

// Function to save data to JSON file
function saveToJson(filename, data) {
  const filepath = path.join(dataDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`✅ Saved ${filename}`);
}

// Try different Directus API endpoint formats
async function tryDirectusEndpoint(endpoint, params = {}, format = 'items') {
  let url;
  
  switch (format) {
    case 'items':
      url = new URL(`/api/1.1/items/${endpoint}`, DIRECTUS_URL);
      break;
    case 'tables':
      url = new URL(`/api/1.1/tables/${endpoint}/rows`, DIRECTUS_URL);
      break;
    case 'v2':
      url = new URL(`/api/v2/items/${endpoint}`, DIRECTUS_URL);
      break;
    case 'public':
      url = new URL(`/api/1.1/items/${endpoint}`, DIRECTUS_URL);
      break;
    default:
      url = new URL(`/api/1.1/items/${endpoint}`, DIRECTUS_URL);
  }
  
  // Add query parameters
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined) {
      url.searchParams.append(key, JSON.stringify(params[key]));
    }
  });
  
  console.log(`Trying ${format} format: ${url.toString()}`);
  
  try {
    const response = await fetch(url.toString());
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Success with ${format} format!`);
      return data;
    } else {
      console.log(`❌ ${format} format failed: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ ${format} format error: ${error.message}`);
    return null;
  }
}

// Function to fetch data from Directus API with multiple endpoint attempts
async function fetchFromDirectus(endpoint, params = {}) {
  console.log(`\n🔍 Trying to fetch ${endpoint}...`);
  
  // Try different endpoint formats
  const formats = ['items', 'tables', 'v2', 'public'];
  
  for (const format of formats) {
    const data = await tryDirectusEndpoint(endpoint, params, format);
    if (data) {
      return data;
    }
  }
  
  console.log(`❌ All endpoint formats failed for ${endpoint}`);
  return null;
}

// Main function to download all data
async function downloadAllData() {
  console.log('🚀 Starting data download for ODPL Incubator (v2)...\n');

  // Download mentors data
  console.log('📥 Downloading mentors...');
  const mentorsData = await fetchFromDirectus('mentors', {
    sort: '-last_name',
    fields: ['*.*']
  });
  if (mentorsData) {
    saveToJson('mentors-local.json', mentorsData);
  }

  // Download participants data
  console.log('📥 Downloading participants...');
  const participantsData = await fetchFromDirectus('selected_participants', {
    sort: 'last_name',
    fields: ['*.*']
  });
  if (participantsData) {
    saveToJson('participants-local.json', participantsData);
  }

  // Download press/news data
  console.log('📥 Downloading press/news...');
  const pressData = await fetchFromDirectus('news', {
    fields: ['*.*']
  });
  if (pressData) {
    saveToJson('press-local.json', pressData);
  }

  // Download featured press data
  console.log('📥 Downloading featured press...');
  const featuredPressData = await fetchFromDirectus('news', {
    filter: { feature: '1' },
    fields: ['*.*']
  });
  if (featuredPressData) {
    saveToJson('featured-press-local.json', featuredPressData);
  }

  // Download FAQ data
  console.log('📥 Downloading FAQ...');
  const faqData = await fetchFromDirectus('faq', {
    fields: ['*.*']
  });
  if (faqData) {
    saveToJson('faq-local.json', faqData);
  }

  // Download alert banner data
  console.log('📥 Downloading alert banners...');
  const alertData = await fetchFromDirectus('alert_banner', {
    fields: ['*.*']
  });
  if (alertData) {
    saveToJson('alerts-local.json', alertData);
  }

  console.log('\n✅ Data download attempt completed!');
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