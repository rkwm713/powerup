# Trello Board Time Tracker & Reporter Power-Up

A comprehensive Trello Power-Up that provides board-wide time tracking and reporting. Monitor card movements across your entire board, track time spent in lists, and generate detailed reports on demand or automatically daily at 5 PM Central Time.

## 🚀 Key Features

### 📊 Board-Wide Dashboard
- **Comprehensive Overview**: View all card activity across your entire board
- **Real-time Statistics**: Total cards, time tracked, and movements at a glance
- **Card Activity Summary**: See which cards have the most activity and time invested

### 📈 Advanced Analytics
- **List Duration Tracking**: Automatically tracks time cards spend in each list across the board
- **Movement History**: Complete log of all card movements with timestamps and member attribution
- **Member Activity**: Track which team members are most active with card movements

### 📧 Flexible Reporting
- **Instant Reports**: Generate and send reports immediately with the click of a button
- **Scheduled Reports**: Automatically generated daily at 5 PM Central Time
- **Professional HTML Reports**: Beautiful, detailed email reports with activity summaries
- **Trigger Lists**: Configure which lists should include cards in reports

### 🎯 Board-Level Management
- **One-Click Access**: Access all board data from a single board-level button
- **Settings Management**: Configure email settings and trigger lists for the entire board
- **Real-time Data**: Refresh board data instantly to see the latest activity

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd powerup
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3000

# Email Configuration for Reports
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# SMTP Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Environment
NODE_ENV=development
```

### 4. Email Setup (Gmail Example)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_PASS`

### 5. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 6. Add to Trello
1. Go to your Trello board
2. Click "Power-Ups" in the board menu
3. Click "Custom" and enter your server URL
4. Enable the power-up

## 📋 Usage

### Accessing the Board Dashboard
1. **Open your Trello board**
2. **Click "Time Tracker & Reporter"** button in the board menu (top-right area)
3. **View the comprehensive dashboard** showing all board activity

### Dashboard Features
- **📈 Board Summary**: See total cards, time tracked, and movements
- **🃏 Cards with Activity**: Review all cards that have movement or time data
- **🔄 Recent Movements**: View the latest card movements across the board
- **⏱️ List Duration Analytics**: See board-wide time spent in each list

### Generate Reports Instantly
1. **Open the board dashboard**
2. **Click "Generate Report Now"** button
3. **Report is sent immediately** to the configured email address

### Settings Configuration
1. Open the Time Tracker dashboard
2. Scroll to the Settings section
3. **Daily Report Email**: Enter email address for reports
4. **Trigger Lists**: Enter list names (comma-separated) that should include cards in reports
5. Click "Save Settings"

### Automatic Reports
- **Daily Schedule**: Reports are automatically generated and sent daily at 5 PM Central Time
- **No Manual Intervention**: Once configured, reports are sent automatically
- **Comprehensive Data**: Includes all board activity for the day

## File Structure

```
powerup/
├── manifest.json          # Trello Power-Up configuration (board-focused)
├── time-tracker.html      # Board dashboard interface
├── styles.css            # Modern dashboard styling
├── power-up.js           # Board-wide tracking logic
├── server.js             # Backend server with email reporting
├── package.json          # Node.js dependencies
└── README.md            # This file
```

## Power-Up Capabilities

### Board Buttons
- **Time Tracker & Reporter**: Opens the comprehensive board dashboard

### Show Settings
- **Settings Interface**: Configure email and trigger list settings

## API Endpoints

### Settings Management
- `POST /api/settings` - Save board settings
- `GET /api/settings/:boardId` - Get board settings

### Report Generation
- `POST /api/send-report` - Send report via email
- `POST /api/generate-immediate-report` - Generate and send immediate report

### Health Check
- `GET /health` - Server health status

## 🎨 Dashboard Features

### Summary Statistics
- **Total Cards**: Number of cards with tracked activity
- **Time Tracked**: Aggregate time across all cards and lists
- **Card Movements**: Total number of movements across the board

### Card Activity Overview
- **Individual Card Summaries**: Each card shows total time, member assignments, and activity counts
- **List Duration Breakdown**: See exactly how long cards spend in each list
- **Member Attribution**: Track which team members are working on which cards

### Movement Analytics
- **Recent Activity Feed**: Latest 20 card movements with full details
- **Movement Patterns**: Identify workflow bottlenecks and patterns
- **Member Activity**: See who is moving cards and when

### List Performance
- **Board-wide List Durations**: Aggregate time spent across all cards in each list
- **Workflow Analysis**: Identify which lists take the most time
- **Process Optimization**: Use data to improve your workflow

## Deployment

### Heroku Deployment
1. Create a new Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy using Git:
```bash
git add .
git commit -m "Deploy board-wide time tracker"
heroku git:remote -a your-app-name
git push heroku main
```

### Railway Deployment
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to main branch

## 📊 Report Features

### Email Reports Include:
- **Board Summary**: Total statistics and key metrics
- **Card Details**: Individual card activity with time tracking
- **Member Activity**: Who worked on what and for how long
- **List Analytics**: Time spent in each workflow stage
- **Movement History**: Complete audit trail of card movements

### Report Delivery:
- **Professional HTML Format**: Clean, readable email reports
- **Automatic Daily Delivery**: Sent every day at 5 PM Central Time
- **On-Demand Generation**: Create reports instantly anytime
- **Reliable Email Delivery**: Uses secure SMTP with app passwords

## Data Storage

### Trello Storage
- **Board Settings**: Stored as shared board data
- **Card Activity**: Movement and duration data stored per card
- **Member Tracking**: Team member assignments and activity

### Server Storage
- **Email Configuration**: Secure environment variable storage
- **Board Settings Cache**: In-memory storage for faster access

## 🔒 Security & Privacy

- **Secure Data Storage**: All data stored in Trello's secure infrastructure
- **Environment Variables**: Sensitive configuration kept in environment variables
- **App Password Authentication**: Uses secure app-specific passwords for email
- **HTTPS Communication**: All API communication secured with HTTPS

## Customization

### Dashboard Styling
Edit `styles.css` to customize the dashboard appearance and branding.

### Report Templates
Update `generateHTMLReport()` in `server.js` to customize email report formatting.

### Analytics Logic
Modify tracking algorithms in `power-up.js` to fit your specific workflow needs.

### Scheduling
Change the cron schedule in `server.js` to modify report generation timing.

## Troubleshooting

### Common Issues

**Dashboard not loading:**
- Check browser console for JavaScript errors
- Verify server is running and accessible
- Ensure Power-Up is properly installed

**Reports not sending:**
- Verify email configuration in environment variables
- Check server logs for email errors
- Confirm SMTP settings and app password

**Missing board data:**
- Use "Refresh Data" button to reload board information
- Check if cards have been moved or modified recently
- Verify Power-Up permissions in Trello

**Settings not saving:**
- Check browser network tab for API errors
- Verify server connectivity
- Ensure board permissions are correct

## 🎯 Best Practices

### Workflow Setup
1. **Configure Trigger Lists**: Set up lists that represent completed work
2. **Train Team Members**: Ensure everyone understands how card movements are tracked
3. **Regular Monitoring**: Use the dashboard regularly to monitor team productivity

### Report Management
1. **Set Appropriate Email**: Use a team email or manager email for reports
2. **Review Daily Reports**: Use automated reports to track daily progress
3. **Generate Manual Reports**: Create ad-hoc reports for meetings or reviews

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with board-wide scenarios
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues, questions, or feature requests, please create an issue in the repository.

---

**🔥 New in This Version**: Complete board-wide redesign! Now track activity across your entire board with a comprehensive dashboard, instant report generation, and improved analytics. No more card-by-card tracking - get the full picture of your team's productivity at a glance. 