# Trello Board Time Tracker & Reporter Power-Up

A comprehensive Trello Power-Up that provides board-wide time tracking and reporting. Monitor card movements across your entire board, track time spent in lists, and generate detailed reports on demand or automatically daily at 5 PM Central Time.

## 🚀 Key Features

### 📊 Board-Wide Dashboard
- **Comprehensive Overview**: View all card activity across your entire board
- **Real-time Statistics**: Total cards, time tracked, and movements at a glance
- **Card Activity Summary**: See which cards have the most activity and time invested

### 📦 **Special CPS Designer Board Tracking**
- **Package Prep Detection**: Automatically detects when cards reach "Ready for Package Prep" status
- **Special Report Grouping**: Cards ready for package prep are grouped under "Sent for Final Package Prep" in reports
- **Member Assignment Tracking**: Tracks assigned members for each card ready for package prep
- **Status Duration Tracking**: Shows exactly how long each card spent in each status before reaching package prep

### ✅ **Special CPS Delivery Service Board Tracking**
- **Complete Status Detection**: Automatically detects when cards reach any list starting with "Complete " (wildcard matching)
- **Flexible List Names**: Supports dynamic list names like "Complete 12/9", "Complete Week 50", etc.
- **Fully Complete Grouping**: Cards reaching completion are grouped under "Fully Complete" in reports
- **Project Journey Tracking**: Complete timeline of how long cards spent in each status throughout the project
- **Member Assignment History**: Tracks who was assigned when cards reached completion

### 📈 Advanced Analytics
- **List Duration Tracking**: Automatically tracks time cards spend in each list across the board
- **Movement History**: Complete log of all card movements with timestamps and member attribution
- **Member Activity**: Track which team members are most active with card movements
- **Current Status Duration**: See how long cards have been in their current status

### 📧 Flexible Reporting
- **Instant Reports**: Generate and send reports immediately with the click of a button
- **Scheduled Reports**: Automatically generated daily at 5 PM Central Time
- **Professional HTML Reports**: Beautiful, detailed email reports with activity summaries
- **Package Prep Section**: Special highlighting of cards ready for final package prep

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
- **📦 Package Prep Cards**: Special section for CPS Designer boards showing cards ready for package prep
- **✅ Fully Complete Cards**: Special section for CPS Delivery Service boards showing completed cards
- **🃏 Cards Overview**: Review all cards that have movement or time data
- **🔄 Recent Movements**: View the latest card movements across the board
- **⏱️ List Analytics**: See board-wide time spent in each list

### CPS Designer Board Special Features
- **Automatic Detection**: When cards move to "Ready for Package Prep" list, they're automatically flagged
- **Special Tracking**: These cards are tracked separately and highlighted in green
- **Member Assignment**: Shows exactly who was assigned to each card when it reached package prep
- **Time Analysis**: Complete breakdown of time spent in each status before reaching package prep
- **Report Grouping**: Package prep cards appear in a special "Sent for Final Package Prep" section in reports

### CPS Delivery Service Board Special Features
- **Wildcard List Detection**: Automatically detects any list starting with "Complete " (e.g., "Complete 12/9", "Complete Week 50")
- **Dynamic List Support**: No need to update configuration when list names change with dates
- **Completion Tracking**: Cards are tracked separately and highlighted in blue
- **Project Timeline**: Complete journey analysis showing time in each status from start to finish
- **Report Grouping**: Complete cards appear in a special "Fully Complete" section in reports

### Generate Reports Instantly
1. **Open the board dashboard**
2. **Click "Generate Report Now"** button
3. **Report is sent immediately** to the configured email address
4. **Package prep cards** are automatically included in a special highlighted section

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
- **Package Prep Highlighting**: Special section for cards ready for package prep

## File Structure

```
powerup/
├── manifest.json          # Trello Power-Up configuration (board-focused)
├── time-tracker.html      # Board dashboard interface
├── styles.css            # Modern dashboard styling with package prep themes
├── power-up.js           # Board-wide tracking logic with CPS Designer support
├── server.js             # Backend server with enhanced email reporting
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
- **Ready for Package Prep**: Special counter for CPS Designer boards
- **Fully Complete**: Special counter for CPS Delivery Service boards

### Package Prep Special Section (CPS Designer Boards)
- **Green Highlighted Cards**: Cards ready for package prep are highlighted in green
- **Assignment Details**: Shows exactly who was assigned when the card reached package prep
- **Status Timeline**: Complete timeline of how long the card spent in each status
- **Ready Since**: Shows exactly when the card became ready for package prep

### Fully Complete Special Section (CPS Delivery Service Boards)
- **Blue Highlighted Cards**: Completed cards are highlighted in blue
- **Assignment Details**: Shows who was assigned when the card reached completion
- **Complete Project Timeline**: Full journey from start to completion with time in each status
- **Completed On**: Shows exactly when the card reached any "Complete *" list

### Card Activity Overview
- **Individual Card Summaries**: Each card shows total time, member assignments, and activity counts
- **List Duration Breakdown**: See exactly how long cards spend in each list
- **Current Status Duration**: Track how long cards have been in their current status
- **Member Attribution**: Track which team members are working on which cards

### Movement Analytics
- **Recent Activity Feed**: Latest 20 card movements with full details
- **Member Assignments**: Shows who was assigned to cards during movements
- **Movement Patterns**: Identify workflow bottlenecks and patterns
- **Member Activity**: See who is moving cards and when

### List Performance
- **Board-wide List Durations**: Aggregate time spent across all cards in each list
- **Workflow Analysis**: Identify which lists take the most time
- **Process Optimization**: Use data to improve your workflow

## 📊 Report Features

### Email Reports Include:
- **📦 Sent for Final Package Prep Section**: Special highlighted section for package prep cards (CPS Designer boards)
- **✅ Fully Complete Section**: Special highlighted section for completed cards (CPS Delivery Service boards)
- **Board Summary**: Total statistics and key metrics
- **Card Details**: Individual card activity with time tracking and assigned members
- **Status Duration Analysis**: Complete breakdown of time spent in each status
- **Member Activity**: Who worked on what and for how long
- **List Analytics**: Time spent in each workflow stage
- **Movement History**: Complete audit trail of card movements

### Report Delivery:
- **Professional HTML Format**: Clean, readable email reports with special highlighting for both board types
- **Automatic Daily Delivery**: Sent every day at 5 PM Central Time
- **On-Demand Generation**: Create reports instantly anytime
- **Reliable Email Delivery**: Uses secure SMTP with app passwords

## Data Storage

### Trello Storage
- **Board Settings**: Stored as shared board data
- **Card Activity**: Movement and duration data stored per card
- **Member Tracking**: Team member assignments and activity
- **Package Prep Flags**: Special flags for cards ready for package prep (CPS Designer)
- **Complete Flags**: Special flags for completed cards (CPS Delivery Service)
- **List Timestamps**: Track entry time into each list for accurate duration calculation

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
Edit `styles.css` to customize the dashboard appearance and branding. Package prep styling can be customized via `.package-prep-card` classes.

### Report Templates
Update `generateHTMLReport()` in `server.js` to customize email report formatting and package prep section styling.

### Board-Specific Logic
Modify the `CPS_BOARD_CONFIG` object in `power-up.js` to:
- Change the target board name
- Modify the target list name
- Update the report group name

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

**Package prep cards not being detected:**
- Verify the board name is exactly "CPS Designer"
- Check that the list name is exactly "Ready for Package Prep"
- Use "Refresh Data" button to reload board information

**Complete cards not being detected:**
- Verify the board name is exactly "CPS Delivery Service"
- Check that the list name starts with "Complete " (note the space after Complete)
- Lists like "Complete 12/9", "Complete Week 50" should work automatically
- Use "Refresh Data" button to reload board information

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

### CPS Designer Board Setup
1. **Consistent Naming**: Ensure the board is named exactly "CPS Designer"
2. **List Names**: The target list must be named exactly "Ready for Package Prep"
3. **Member Assignment**: Always assign team members to cards for accurate tracking
4. **Regular Reports**: Use instant report generation to track package prep status

### CPS Delivery Service Board Setup
1. **Consistent Naming**: Ensure the board is named exactly "CPS Delivery Service"
2. **List Names**: Completion lists should start with "Complete " (e.g., "Complete 12/9", "Complete Week 50")
3. **Dynamic Lists**: You can change the date/week portion without updating the power-up
4. **Member Assignment**: Always assign team members to cards for accurate completion tracking
5. **Regular Reports**: Monitor completion rates and project timelines

### Report Management
1. **Set Appropriate Email**: Use a team email or manager email for reports
2. **Review Daily Reports**: Use automated reports to track daily progress
3. **Generate Manual Reports**: Create ad-hoc reports for meetings or reviews
4. **Package Prep Monitoring**: Pay special attention to the package prep section for workflow optimization
5. **Completion Tracking**: Use the fully complete section to analyze project delivery times

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with board-wide scenarios and CPS Designer board functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues, questions, or feature requests, please create an issue in the repository.

---

**🔥 New in This Version**: Complete board-wide redesign with special support for both CPS Designer and CPS Delivery Service boards! Now track activity across your entire board with a comprehensive dashboard, instant report generation, and dual special tracking systems:

• **CPS Designer boards**: Cards reaching "Ready for Package Prep" are automatically flagged and highlighted in green
• **CPS Delivery Service boards**: Cards reaching any "Complete *" list are automatically marked as fully complete and highlighted in blue
• **Wildcard matching**: Supports dynamic list names like "Complete 12/9", "Complete Week 50" without configuration changes
• **Enhanced reporting**: Separate sections for package prep and completed cards in email reports
• **Member tracking**: Complete assignment history and status duration analysis

Get the full picture of your team's productivity at a glance with enhanced member tracking, status duration analysis, and dual-board workflow support! 