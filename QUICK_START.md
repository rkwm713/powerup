# Quick Start Guide

Get your Trello Time Tracker Power-Up running in 5 minutes!

## 1. Install Dependencies
```bash
npm install
```

## 2. Configure Environment
Run the interactive setup:
```bash
npm run setup
```

This will ask you for:
- Email address for reports (Gmail recommended)
- Email app password (see Gmail setup below)
- Server port (default: 3000)

## 3. Gmail App Password Setup
1. Go to [Google Account settings](https://myaccount.google.com/)
2. **Security** → **2-Step Verification** → **App passwords**
3. Generate password for **"Mail"**
4. Use this 16-character password in the setup

## 4. Start the Server
```bash
npm start
```

Your server will be running at `http://localhost:3000`

## 5. Add to Trello
1. Open your Trello board
2. Click **"Power-Ups"** in the board menu
3. Click **"Custom Power-Up"**
4. Enter: `http://localhost:3000` (or your deployed URL)
5. Click **"Add"**

## 6. Start Tracking Time!
1. Open any card on your board
2. Click the **"Time Tracker"** button
3. Start tracking time!

## Features You'll Get:
- ⏱️ **Timer**: Start/stop/reset with visual display
- 📊 **Time Entries**: Manual and automatic time logging
- 🔄 **Card Movement Tracking**: See when cards move between lists
- 📧 **Daily Reports**: Automatic emails at 5 PM Central
- 👥 **Team Tracking**: See who worked on what and for how long

## Deployment (Optional)
For production use, deploy to:
- **Heroku**: `git push heroku main`
- **Railway**: Connect your GitHub repo
- **Render**: Deploy from GitHub

Then use your deployed URL instead of localhost in Trello.

---

**Need Help?** Check the full README.md for detailed instructions and troubleshooting. 