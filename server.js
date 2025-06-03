const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Storage for board settings (in production, use a proper database)
let boardSettings = {};

// Email transporter setup
let emailTransporter = null;

try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        emailTransporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        console.log('Email transporter configured successfully');
    } else {
        console.warn('Email environment variables not set. Email functionality will be disabled.');
    }
} catch (error) {
    console.error('Error setting up email transporter:', error);
    console.warn('Email functionality will be disabled.');
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'time-tracker.html'));
});

// Favicon route
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'logo.png'));
});

// API Routes
app.post('/api/settings', async (req, res) => {
    try {
        const { boardId, boardName, settings } = req.body;
        
        boardSettings[boardId] = {
            boardName,
            settings,
            updatedAt: new Date().toISOString()
        };
        
        console.log(`Settings saved for board: ${boardName} (${boardId})`);
        res.json({ success: true, message: 'Settings saved successfully' });
    } catch (error) {
        console.error('Error saving settings:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/send-report', async (req, res) => {
    try {
        if (!emailTransporter) {
            return res.status(500).json({ 
                success: false, 
                error: 'Email not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.' 
            });
        }

        const { reportData, email } = req.body;
        
        const htmlReport = generateHTMLReport(reportData);
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Daily Time Tracking Report - ${reportData.boardName}`,
            html: htmlReport
        };
        
        await emailTransporter.sendMail(mailOptions);
        
        console.log(`Report sent to ${email} for board: ${reportData.boardName}`);
        res.json({ success: true, message: 'Report sent successfully' });
    } catch (error) {
        console.error('Error sending report:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/settings/:boardId', (req, res) => {
    try {
        const { boardId } = req.params;
        const settings = boardSettings[boardId];
        
        if (settings) {
            res.json(settings);
        } else {
            res.status(404).json({ error: 'Settings not found for this board' });
        }
    } catch (error) {
        console.error('Error getting settings:', error);
        res.status(500).json({ error: error.message });
    }
});

// Daily report generation - runs at 5 PM Central Time (11 PM UTC)
cron.schedule('0 23 * * *', async () => {
    console.log('Running daily report generation at 5 PM Central Time...');
    
    for (const [boardId, boardData] of Object.entries(boardSettings)) {
        if (boardData.settings.reportEmail) {
            try {
                await generateDailyReport(boardId, boardData);
            } catch (error) {
                console.error(`Error generating daily report for board ${boardId}:`, error);
            }
        }
    }
});

async function generateDailyReport(boardId, boardData) {
    try {
        if (!emailTransporter) {
            console.warn(`Skipping daily report for board ${boardData.boardName} - email not configured`);
            return;
        }

        // In a real implementation, you would fetch data from Trello API
        // For now, we'll create a sample report structure
        
        const reportData = {
            boardName: boardData.boardName,
            generatedAt: new Date().toISOString(),
            period: 'Daily Report - ' + new Date().toLocaleDateString(),
            cards: [], // This would be populated from Trello API data
            summary: {
                totalCards: 0,
                totalTimeTracked: '0h 0m',
                totalMovements: 0,
                activeMembers: 0
            }
        };
        
        // Send the report
        const htmlReport = generateHTMLReport(reportData);
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: boardData.settings.reportEmail,
            subject: `Daily Time Tracking Report - ${boardData.boardName}`,
            html: htmlReport
        };
        
        await emailTransporter.sendMail(mailOptions);
        
        console.log(`Daily report sent to ${boardData.settings.reportEmail} for board: ${boardData.boardName}`);
    } catch (error) {
        console.error('Error generating daily report:', error);
        throw error;
    }
}

function generateHTMLReport(reportData) {
    const reportDate = new Date(reportData.generatedAt).toLocaleDateString();
    const reportTime = new Date(reportData.generatedAt).toLocaleTimeString();
    
    let cardsHTML = '';
    if (reportData.cards && reportData.cards.length > 0) {
        cardsHTML = reportData.cards.map(card => `
            <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
                <h3 style="color: #0079bf; margin: 0 0 10px 0;">${card.name}</h3>
                <p><strong>Total Time Tracked:</strong> ${card.totalTime}</p>
                
                ${card.timeEntries && card.timeEntries.length > 0 ? `
                    <h4>Time Entries:</h4>
                    <ul>
                        ${card.timeEntries.map(entry => `
                            <li>${entry.memberName}: ${formatDuration(entry.duration)} - ${entry.description}</li>
                        `).join('')}
                    </ul>
                ` : ''}
                
                ${card.movements && card.movements.length > 0 ? `
                    <h4>Card Movements:</h4>
                    <ul>
                        ${card.movements.map(movement => `
                            <li>${movement.memberName}: ${movement.fromList} → ${movement.toList} (${new Date(movement.date).toLocaleString()})</li>
                        `).join('')}
                    </ul>
                ` : ''}
            </div>
        `).join('');
    } else {
        cardsHTML = '<p style="text-align: center; color: #666; font-style: italic;">No time tracking data found for today.</p>';
    }
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Time Tracking Report</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f8f9fa; }
                .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #0079bf; }
                .summary { background: #f4f5f7; padding: 20px; border-radius: 5px; margin-bottom: 30px; }
                .summary h3 { margin: 0 0 15px 0; color: #172b4d; }
                .stat { display: inline-block; margin-right: 30px; }
                .stat-value { font-size: 24px; font-weight: bold; color: #0079bf; }
                .stat-label { font-size: 14px; color: #6c757d; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="color: #0079bf; margin: 0;">Time Tracking Report</h1>
                    <h2 style="color: #172b4d; margin: 10px 0 0 0;">${reportData.boardName}</h2>
                    <p style="color: #6c757d; margin: 10px 0 0 0;">Generated on ${reportDate} at ${reportTime}</p>
                </div>
                
                <div class="summary">
                    <h3>Daily Summary</h3>
                    <div class="stat">
                        <div class="stat-value">${reportData.cards ? reportData.cards.length : 0}</div>
                        <div class="stat-label">Cards with Activity</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${reportData.summary ? reportData.summary.totalTimeTracked : '0h 0m'}</div>
                        <div class="stat-label">Total Time Tracked</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${reportData.summary ? reportData.summary.totalMovements : 0}</div>
                        <div class="stat-label">Card Movements</div>
                    </div>
                </div>
                
                <h2 style="color: #172b4d;">Card Details</h2>
                ${cardsHTML}
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #6c757d; font-size: 12px;">
                    <p>This report was automatically generated by the Time Tracker & Reporter Power-Up for Trello.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

function formatDuration(milliseconds) {
    const totalMinutes = Math.floor(milliseconds / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`Time Tracker Power-Up server running on port ${PORT}`);
    console.log(`Daily reports scheduled for 5 PM Central Time (11 PM UTC)`);
});

module.exports = app; 