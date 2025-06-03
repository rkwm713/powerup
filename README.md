# Trello Time Tracker & Reporter Power-Up

A comprehensive Trello Power-Up that tracks time spent on cards, monitors card movements between lists, and generates automated daily reports via email.

## Features

### ⏱️ Time Tracking
- **Visual Timer**: Start/stop/reset timer with real-time display
- **Manual Time Entry**: Add time entries manually with custom descriptions
- **Timer Persistence**: Timer continues running even when closing the power-up
- **Total Time Display**: Shows total time tracked per card as a badge

### 📊 Card Movement Tracking
- **Automatic Detection**: Monitors when cards move between lists
- **Movement History**: Complete log of all card movements with timestamps
- **Auto-Timer Start**: Optionally start timer when card moves to "In Progress"

### 📧 Daily Reports
- **Scheduled Reports**: Automatically generated daily at 5 PM Central Time
- **Email Delivery**: Professional HTML reports sent via email
- **Comprehensive Data**: Includes time entries, card movements, and member activity
- **Manual Generation**: Generate reports on-demand via board button

### 👥 Multi-User Support
- **Member Tracking**: Records who worked on what and for how long
- **Individual Entries**: Each team member's time is tracked separately
- **Activity Attribution**: All movements and entries are attributed to users

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

# Trello API Configuration (optional)
TRELLO_API_KEY=your-trello-api-key
TRELLO_API_SECRET=your-trello-api-secret

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

## Usage

### Time Tracking
1. **Open any card** on your Trello board
2. **Click "Time Tracker"** button on the card
3. **Start the timer** when you begin working
4. **Stop the timer** when you finish
5. **View time entries** and total time tracked

### Manual Time Entry
1. Open the Time Tracker on any card
2. Enter hours and minutes in the manual entry section
3. Add a description (optional)
4. Click "Add Entry"

### Settings Configuration
1. Open the Time Tracker
2. Go to the Settings section
3. **Enable auto-tracking**: Automatically start timer when card moves to "In Progress"
4. **Set report email**: Enter email address for daily reports
5. Click "Save Settings"

### Generate Reports
1. **Automatic**: Reports are sent daily at 5 PM Central Time
2. **Manual**: Click "Generate Report" button on the board
3. **Email**: Reports are sent to the configured email address

## File Structure

```
powerup/
├── manifest.json          # Trello Power-Up configuration
├── time-tracker.html      # Main Power-Up interface
├── styles.css            # CSS styling
├── power-up.js           # Frontend JavaScript logic
├── server.js             # Backend Node.js server
├── package.json          # Node.js dependencies
└── README.md            # This file
```

## Power-Up Capabilities

### Card Buttons
- **Time Tracker**: Opens the time tracking interface

### Card Detail Badges
- **Total Time**: Shows total time tracked as a blue badge

### Board Buttons
- **Generate Report**: Manually trigger report generation

### Card Back Section
- **Timer Interface**: Full time tracking and history interface

## API Endpoints

### Settings Management
- `POST /api/settings` - Save board settings
- `GET /api/settings/:boardId` - Get board settings

### Report Generation
- `POST /api/send-report` - Send manual report via email

### Health Check
- `GET /health` - Server health status

## Deployment

### Heroku Deployment
1. Create a new Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy using Git:
```bash
git add .
git commit -m "Initial commit"
heroku git:remote -a your-app-name
git push heroku main
```

### Railway Deployment
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to main branch

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Scheduled Tasks

The server runs a cron job that executes daily at 5 PM Central Time (11 PM UTC):
- Collects time tracking data from all boards
- Generates HTML reports
- Sends reports via email to configured addresses

## Data Storage

### Trello Storage
- **Time Entries**: Stored as shared card data
- **Movement Entries**: Stored as shared card data
- **Settings**: Stored as shared board data
- **Timer State**: Stored as private card data

### Server Storage
- **Board Settings**: In-memory storage (use database for production)
- **Email Configuration**: Environment variables

## Security Considerations

1. **Environment Variables**: Keep sensitive data in environment variables
2. **HTTPS**: Use HTTPS in production
3. **Email Security**: Use app-specific passwords, not account passwords
4. **Data Privacy**: Time tracking data is stored in Trello's secure storage

## Customization

### Styling
Edit `styles.css` to customize the appearance of the Power-Up interface.

### Timer Behavior
Modify timer functions in `power-up.js` to change timer behavior or add features.

### Report Format
Update the `generateHTMLReport()` function in `server.js` to customize report appearance.

### Scheduling
Change the cron schedule in `server.js` to modify report generation timing.

## Troubleshooting

### Common Issues

**Timer not starting:**
- Check browser console for JavaScript errors
- Ensure Power-Up is properly loaded

**Reports not sending:**
- Verify email configuration in environment variables
- Check server logs for email sending errors
- Confirm SMTP settings are correct

**Data not saving:**
- Ensure Trello Power-Up has proper permissions
- Check browser network tab for API errors

**Server not starting:**
- Verify all environment variables are set
- Check for port conflicts
- Ensure all dependencies are installed

### Debug Mode
Set `NODE_ENV=development` to enable detailed logging.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues, questions, or feature requests, please create an issue in the repository or contact the development team.

---

**Note**: This Power-Up requires a server to handle email sending and scheduled reporting. For development, you can run the server locally. For production use, deploy to a cloud service like Heroku, Railway, or similar. 