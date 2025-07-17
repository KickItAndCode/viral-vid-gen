#!/usr/bin/env node

/**
 * Setup script for AI video generation providers
 * This script helps configure API keys and test connections
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

const PROVIDERS = {
  runway: {
    name: "Runway ML Gen-3/4",
    website: "https://runwayml.com/",
    apiUrl: "https://api.runwayml.com/v1",
    pricing: "5 credits/second ($3.00/minute)",
    plans: "Standard: $12/month (625 credits), Pro: $28/month (2,250 credits)",
    features: "4K output, official API, lip-sync, professional editing",
    recommended: true,
    priority: 1,
    setupInstructions: "1. Sign up at runwayml.com\n2. Choose Standard plan ($12/month minimum)\n3. Go to Settings → API\n4. Generate API key (starts with 'rw_')"
  },
  luma: {
    name: "Luma AI Dream Machine",
    website: "https://lumalabs.ai/dream-machine",
    apiUrl: "https://api.lumalabs.ai/v1",
    pricing: "150 generations/month ($29.99 Standard)",
    plans: "Standard: $29.99/month (commercial use), Pro: $99.99/month (480 gens)",
    features: "1080p, physics simulation, 3D capabilities, 10-second videos",
    recommended: true,
    priority: 2,
    setupInstructions: "1. Sign up at lumalabs.ai\n2. Subscribe to Standard plan ($29.99/month)\n3. Navigate to API section\n4. Generate API credentials"
  },
  veo: {
    name: "Google Veo 3",
    website: "https://cloud.google.com/vertex-ai",
    apiUrl: "https://videogeneration.googleapis.com/v1",
    pricing: "$249/month Google AI Ultra subscription",
    plans: "Google AI Ultra: $249/month, Vertex AI: Pay-per-use + $300 trial",
    features: "1080p, native audio, lip-sync, 8-second videos, enterprise-grade",
    recommended: false,
    priority: 3,
    note: "Premium option - very expensive but highest quality",
    setupInstructions: "1. Create Google Cloud Project\n2. Enable Vertex AI API\n3. Subscribe to Google AI Ultra ($249/month)\n4. Create service account credentials"
  }
};

async function main() {
  console.log("🎬 ViralAI - AI Provider Setup");
  console.log("===============================\n");

  console.log("This script will help you configure AI video generation providers.\n");

  // Check current .env file
  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    console.log("✅ Found existing .env.local file\n");
  } else {
    console.log("📝 Creating new .env.local file\n");
  }

  console.log("Available AI Video Generation Providers:");
  console.log("=======================================\n");

  Object.entries(PROVIDERS)
    .sort(([,a], [,b]) => (a.priority || 999) - (b.priority || 999))
    .forEach(([key, provider]) => {
      console.log(`${provider.recommended ? '⭐' : '  '} ${provider.name} ${provider.priority ? `(Priority ${provider.priority})` : ''}`);
      console.log(`   Website: ${provider.website}`);
      console.log(`   Pricing: ${provider.pricing}`);
      console.log(`   Plans: ${provider.plans}`);
      console.log(`   Features: ${provider.features}`);
      if (provider.note) {
        console.log(`   Note: ${provider.note}`);
      }
      console.log('');
    });

  console.log("💡 Recommended Setup Strategy:");
  console.log("1. START WITH: Runway ML ($12/month) - Most reliable API, professional quality");
  console.log("2. ADD SECOND: Luma AI ($29.99/month) - Great for physics/3D content");
  console.log("3. PREMIUM ONLY: Google Veo 3 ($249/month) - Highest quality with audio");
  console.log("\n📊 Cost Analysis:");
  console.log("• Runway: ~2 minutes of video/month on Standard plan");
  console.log("• Luma: 150 generations/month on Standard plan");
  console.log("• Veo 3: Premium pricing for enterprise-quality output\n");

  const setupProvider = await question("Would you like to set up API keys now? (y/n): ");
  
  if (setupProvider.toLowerCase() !== 'y') {
    console.log("\n📝 Manual setup instructions:");
    console.log("1. Sign up for AI provider accounts");
    console.log("2. Get API keys from provider dashboards");
    console.log("3. Add them to your .env.local file:");
    console.log("   RUNWAY_API_KEY=your-runway-key");
    console.log("   LUMA_API_KEY=your-luma-key");
    console.log("   VEO_API_KEY=your-veo-key");
    console.log("\n4. Restart your development server");
    rl.close();
    return;
  }

  // Collect API keys
  const apiKeys = {};
  
  for (const [key, provider] of Object.entries(PROVIDERS).sort(([,a], [,b]) => (a.priority || 999) - (b.priority || 999))) {
    console.log(`\n${provider.name} Setup:`);
    console.log(`${provider.recommended ? '⭐ RECOMMENDED' : '  Optional'} - Priority ${provider.priority || 'Low'}`);
    console.log(`Website: ${provider.website}`);
    console.log(`Pricing: ${provider.pricing}`);
    console.log(`\nSetup Instructions:`);
    console.log(provider.setupInstructions.split('\n').map(line => `  ${line}`).join('\n'));
    
    const hasKey = await question(`\nDo you have a ${provider.name} API key? (y/n): `);
    
    if (hasKey.toLowerCase() === 'y') {
      const apiKey = await question(`Enter your ${provider.name} API key: `);
      if (apiKey.trim()) {
        apiKeys[key.toUpperCase() + '_API_KEY'] = apiKey.trim();
        apiKeys[key.toUpperCase() + '_API_URL'] = provider.apiUrl;
        console.log(`✅ ${provider.name} API key saved`);
      }
    } else {
      console.log(`⏭️  Skipping ${provider.name} for now`);
      if (provider.recommended) {
        console.log(`💡 TIP: ${provider.name} is highly recommended for production use`);
      }
    }
  }

  // Update .env file
  if (Object.keys(apiKeys).length > 0) {
    let newEnvContent = envContent;
    
    // Add AI provider section if not exists
    if (!newEnvContent.includes('# AI Video Generation APIs')) {
      newEnvContent += '\n\n# AI Video Generation APIs\n';
    }
    
    Object.entries(apiKeys).forEach(([key, value]) => {
      const envVar = `${key}=${value}`;
      
      if (newEnvContent.includes(`${key}=`)) {
        // Replace existing
        newEnvContent = newEnvContent.replace(
          new RegExp(`${key}=.*`),
          envVar
        );
      } else {
        // Add new
        newEnvContent += `${envVar}\n`;
      }
    });

    fs.writeFileSync(envPath, newEnvContent);
    console.log(`\n✅ Updated ${envPath} with API keys`);
  }

  // Test connection option
  const testConnection = await question("\nWould you like to test the API connections? (y/n): ");
  
  if (testConnection.toLowerCase() === 'y') {
    console.log("\n🧪 Testing API connections...");
    console.log("(This feature will be implemented in the next phase)");
    
    // TODO: Implement actual API testing
    console.log("✅ Connection testing will be available after provider integration");
  }

  console.log("\n🎉 Setup complete!");
  console.log("\nNext steps:");
  console.log("1. Restart your development server (pnpm dev)");
  console.log("2. Try creating a video in the app");
  console.log("3. Check the console for video generation worker logs");
  console.log("\n💡 Pro tip: Start with Runway ML for the most reliable experience");

  rl.close();
}

main().catch(console.error);