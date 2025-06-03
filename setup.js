#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function setup() {
    console.log('🚀 Trello Time Tracker Power-Up Setup\n');
    console.log('This setup will help you configure your environment variables.\n');

    const config = {};

    // Server Configuration
    config.PORT = await question('Server Port (default: 3000): ') || '3000';

    // Email Configuration
    console.log('\n📧 Email Configuration for Reports:');
    config.EMAIL_USER = await question('Email address (Gmail recommended): ');
    config.EMAIL_PASS = await question('Email app password: ');
    
    // SMTP Configuration
    console.log('\n🔧 SMTP Configuration:');
    config.SMTP_HOST = await question('SMTP Host (default: smtp.gmail.com): ') || 'smtp.gmail.com';
    config.SMTP_PORT = await question('SMTP Port (default: 587): ') || '587';

    // Optional Trello API
    console.log('\n🔑 Trello API (Optional - for future enhancements):');
    const includeTrelloAPI = await question('Include Trello API configuration? (y/n): ');
    if (includeTrelloAPI.toLowerCase() === 'y') {
        config.TRELLO_API_KEY = await question('Trello API Key: ');
        config.TRELLO_API_SECRET = await question('Trello API Secret: ');
    }

    // Environment
    config.NODE_ENV = await question('Environment (development/production, default: development): ') || 'development';

    // Create .env file
    const envContent = Object.entries(config)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    fs.writeFileSync('.env', envContent);

    console.log('\n✅ Environment configuration saved to .env file');
    console.log('\n📋 Gmail App Password Setup:');
    console.log('1. Enable 2-Factor Authentication on your Gmail account');
    console.log('2. Go to Google Account settings');
    console.log('3. Security → 2-Step Verification → App passwords');
    console.log('4. Generate password for "Mail"');
    console.log('5. Use the generated password in EMAIL_PASS');

    console.log('\n🚀 Next Steps:');
    console.log('1. Run: npm install');
    console.log('2. Run: npm start (or npm run dev for development)');
    console.log('3. Add the Power-Up to your Trello board using your server URL');

    rl.close();
}

setup().catch(console.error); 