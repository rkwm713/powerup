const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;

// Load environment variables
require('dotenv').config();

console.log('🚀 Starting Time Tracker Power-Up server...');
console.log('📁 Current directory:', __dirname);
console.log('🔧 Node.js version:', process.version);
console.log('📊 Environment variables:');
console.log('  - PORT:', process.env.PORT || 'not set (will use 3000)');
console.log('  - NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('  - EMAIL_USER:', process.env.EMAIL_USER ? 'configured' : 'not set');
console.log('  - SMTP_HOST:', process.env.SMTP_HOST || 'not set');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🌐 Server will listen on port:', PORT);

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
            subject: `Daily Card Activity Report - ${reportData.boardName}`,
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

// New endpoint for immediate report generation
app.post('/api/generate-immediate-report', async (req, res) => {
    try {
        if (!emailTransporter) {
            return res.status(500).json({ 
                success: false, 
                error: 'Email not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.' 
            });
        }

        const { boardId, boardName, email } = req.body;
        
        // Get board settings
        const boardData = boardSettings[boardId];
        if (!boardData) {
            return res.status(404).json({ 
                success: false, 
                error: 'Board settings not found. Please save settings first.' 
            });
        }

        // Create report data structure for immediate report
        const reportData = {
            boardName: boardName,
            generatedAt: new Date().toISOString(),
            period: 'Manual Report - ' + new Date().toLocaleDateString(),
            cards: [], // This would be populated from Trello API data in a real implementation
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
            to: email,
            subject: `Manual Card Activity Report - ${boardName}`,
            html: htmlReport
        };
        
        await emailTransporter.sendMail(mailOptions);
        
        console.log(`Manual report sent to ${email} for board: ${boardName}`);
        res.json({ 
            success: true, 
            message: 'Manual report sent successfully',
            sentTo: email,
            boardName: boardName
        });
    } catch (error) {
        console.error('Error generating immediate report:', error);
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
            subject: `Daily Card Activity Report - ${boardData.boardName}`,
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
    
    // Generate regular cards HTML
    let cardsHTML = '';
    if (reportData.cards && reportData.cards.length > 0) {
        cardsHTML = reportData.cards.map(card => `
            <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
                <h3 style="color: #0079bf; margin: 0 0 10px 0;">${card.name}</h3>
                ${card.members && card.members.length > 0 ? `<p><strong>Assigned Members:</strong> ${card.members.join(', ')}</p>` : ''}
                ${card.listDurations && Object.keys(card.listDurations).length > 0 ? `
                    <h4>Time in Each Status:</h4>
                    <ul>
                        ${Object.entries(card.listDurations).map(([list, dur]) => `<li>${list}: ${formatDuration(dur)}</li>`).join('')}
                    </ul>
                ` : ''}
                ${card.currentListDuration && card.currentListDuration > 0 ? `
                    <p><strong>Current Status Duration:</strong> ${formatDuration(card.currentListDuration)}</p>
                ` : ''}
                ${card.movements && card.movements.length > 0 ? `
                    <h4>Recent Movements:</h4>
                    <ul>
                        ${card.movements.slice(-5).map(movement => `
                            <li>${movement.memberName}: ${movement.fromList} → ${movement.toList} (${new Date(movement.date).toLocaleString()})
                                ${movement.assignedMembers ? `<br><em>Assigned: ${movement.assignedMembers.join(', ')}</em>` : ''}
                            </li>
                        `).join('')}
                    </ul>
                ` : ''}
            </div>
        `).join('');
    } else {
        cardsHTML = '<p style="text-align: center; color: #666; font-style: italic;">No regular card activity found.</p>';
    }
    
    // Generate package prep cards HTML
    let packagePrepHTML = '';
    if (reportData.packagePrepCards && reportData.packagePrepCards.length > 0) {
        packagePrepHTML = `
            <h2 style="color: #172b4d; margin-top: 30px;">📦 Sent for Final Package Prep</h2>
            ${reportData.packagePrepCards.map(card => `
                <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #28a745; border-radius: 5px; background: #f8fff9;">
                    <h3 style="color: #28a745; margin: 0 0 10px 0;">${card.name}</h3>
                    <p><strong>Assigned Members:</strong> ${card.members && card.members.length > 0 ? card.members.join(', ') : 'None assigned'}</p>
                    <p><strong>Ready Since:</strong> ${new Date(card.packagePrepFlag.date).toLocaleString()}</p>
                    ${card.listDurations && Object.keys(card.listDurations).length > 0 ? `
                        <h4>Time Spent in Each Status:</h4>
                        <ul>
                            ${Object.entries(card.listDurations).map(([list, dur]) => `<li>${list}: ${formatDuration(dur)}</li>`).join('')}
                        </ul>
                    ` : ''}
                    <p><strong>Total Time Tracked:</strong> ${formatDuration(card.totalTime)}</p>
                </div>
            `).join('')}
        `;
    }
    
    // Generate complete cards HTML
    let completeCardsHTML = '';
    if (reportData.completeCards && reportData.completeCards.length > 0) {
        completeCardsHTML = `
            <h2 style="color: #172b4d; margin-top: 30px;">✅ Fully Complete</h2>
            ${reportData.completeCards.map(card => `
                <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #007bff; border-radius: 5px; background: #f0f8ff;">
                    <h3 style="color: #007bff; margin: 0 0 10px 0;">${card.name}</h3>
                    <p><strong>Assigned Members:</strong> ${card.members && card.members.length > 0 ? card.members.join(', ') : 'None assigned'}</p>
                    <p><strong>Completed:</strong> ${new Date(card.completeFlag.date).toLocaleString()}</p>
                    ${card.listDurations && Object.keys(card.listDurations).length > 0 ? `
                        <h4>Complete Journey - Time in Each Status:</h4>
                        <ul>
                            ${Object.entries(card.listDurations).map(([list, dur]) => `<li>${list}: ${formatDuration(dur)}</li>`).join('')}
                        </ul>
                    ` : ''}
                    <p><strong>Total Project Time:</strong> ${formatDuration(card.totalTime)}</p>
                </div>
            `).join('')}
        `;
    }
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Board Activity Report</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f8f9fa; }
                .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #0079bf; }
                .summary { background: #f4f5f7; padding: 20px; border-radius: 5px; margin-bottom: 30px; }
                .summary h3 { margin: 0 0 15px 0; color: #172b4d; }
                .stat { display: inline-block; margin-right: 30px; }
                .stat-value { font-size: 24px; font-weight: bold; color: #0079bf; }
                .stat-label { font-size: 14px; color: #6c757d; }
                .package-prep-highlight { background: #e8f5e8; border-left: 4px solid #28a745; padding: 10px; margin: 10px 0; }
                .complete-highlight { background: #e8f4fd; border-left: 4px solid #007bff; padding: 10px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="color: #0079bf; margin: 0;">📊 Board Activity Report</h1>
                    <h2 style="color: #172b4d; margin: 10px 0 0 0;">${reportData.boardName}</h2>
                    <p style="color: #6c757d; margin: 10px 0 0 0;">Generated on ${reportDate} at ${reportTime}</p>
                </div>
                
                <div class="summary">
                    <h3>📈 Summary</h3>
                    <div class="stat">
                        <div class="stat-value">${reportData.summary ? reportData.summary.totalCards : reportData.cards.length}</div>
                        <div class="stat-label">Cards with Activity</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${reportData.summary ? reportData.summary.totalMovements : reportData.cards.reduce((sum, c) => sum + (c.movements ? c.movements.length : 0), 0)}</div>
                        <div class="stat-label">Card Movements</div>
                    </div>
                    ${reportData.packagePrepCards && reportData.packagePrepCards.length > 0 ? `
                        <div class="stat">
                            <div class="stat-value" style="color: #28a745;">${reportData.packagePrepCards.length}</div>
                            <div class="stat-label">Ready for Package Prep</div>
                        </div>
                    ` : ''}
                    ${reportData.completeCards && reportData.completeCards.length > 0 ? `
                        <div class="stat">
                            <div class="stat-value" style="color: #007bff;">${reportData.completeCards.length}</div>
                            <div class="stat-label">Fully Complete</div>
                        </div>
                    ` : ''}
                    ${reportData.summary && reportData.summary.activeMembers ? `
                        <div class="stat">
                            <div class="stat-value">${reportData.summary.activeMembers}</div>
                            <div class="stat-label">Active Members</div>
                        </div>
                    ` : ''}
                </div>
                
                ${packagePrepHTML}
                
                ${completeCardsHTML}
                
                <h2 style="color: #172b4d;">🃏 Card Activity Details</h2>
                ${cardsHTML}
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #6c757d; font-size: 12px;">
                    <p>This report was automatically generated by the Board Time Tracker & Reporter Power-Up for Trello.</p>
                    <p><strong>Special Tracking:</strong></p>
                    <p>• CPS Designer board: Cards reaching "Ready for Package Prep" are highlighted above</p>
                    <p>• CPS Delivery Service board: Cards reaching "Complete *" lists are marked as fully complete</p>
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
    console.log('✅ Time Tracker Power-Up server running on port', PORT);
    console.log('🔗 Server URL: http://localhost:' + PORT);
    console.log('📧 Daily reports scheduled for 5 PM Central Time (11 PM UTC)');
    console.log('🎯 Server ready to accept requests!');
}).on('error', (err) => {
    console.error('❌ Server failed to start:', err);
    console.error('🔧 Error details:', err.message);
    if (err.code === 'EADDRINUSE') {
        console.error('💡 Port', PORT, 'is already in use. Try a different port.');
    }
    process.exit(1);
});

module.exports = app; 