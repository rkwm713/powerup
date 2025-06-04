// Time Tracker & Reporter Power-Up - Board-Wide Version
var t = TrelloPowerUp.iframe();

// Data keys for Trello storage
const STORAGE_KEYS = {
    MOVEMENT_ENTRIES: 'movementEntries',
    LIST_DURATIONS: 'listDurations',
    TIME_ENTRIES: 'timeEntries',
    SETTINGS: 'settings',
    TRIGGERED: 'triggeredForReport',
    CARD_MEMBERS: 'cardMembers'
};

// Global variables for board-wide data
let allBoardData = {
    cards: [],
    totalTimeTracked: 0,
    totalMovements: 0,
    settings: {}
};

// Initialize the power-up
document.addEventListener('DOMContentLoaded', function() {
    initializePowerUp();
});

async function initializePowerUp() {
    try {
        // Load board-wide data
        await loadBoardData();
        await loadSettings();
        
        // Set up event listeners
        setupEventListeners();
        
        // Update display
        updateDisplay();
        
        console.log('Board-Wide Time Tracker Power-Up initialized successfully');
    } catch (error) {
        console.error('Error initializing power-up:', error);
    }
}

function setupEventListeners() {
    document.getElementById('save-settings').addEventListener('click', saveSettings);
    document.getElementById('generate-report-now').addEventListener('click', generateReportNow);
    document.getElementById('refresh-data').addEventListener('click', refreshBoardData);
}

// Board Data Loading Functions
async function loadBoardData() {
    try {
        const board = await t.board('id', 'name', 'cards');
        allBoardData.cards = [];
        allBoardData.totalTimeTracked = 0;
        allBoardData.totalMovements = 0;
        
        // Load data for each card
        for (const card of board.cards) {
            try {
                const cardMovements = await t.get(card.id, 'shared', STORAGE_KEYS.MOVEMENT_ENTRIES) || [];
                const listDurations = await t.get(card.id, 'shared', STORAGE_KEYS.LIST_DURATIONS) || {};
                const timeEntries = await t.get(card.id, 'shared', STORAGE_KEYS.TIME_ENTRIES) || [];
                const members = await t.get(card.id, 'shared', STORAGE_KEYS.CARD_MEMBERS) || [];
                
                const totalCardTime = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
                const totalListTime = Object.values(listDurations).reduce((sum, duration) => sum + duration, 0);
                
                allBoardData.cards.push({
                    id: card.id,
                    name: card.name,
                    movements: cardMovements,
                    listDurations: listDurations,
                    timeEntries: timeEntries,
                    members: members,
                    totalTime: totalCardTime + totalListTime
                });
                
                allBoardData.totalTimeTracked += totalCardTime + totalListTime;
                allBoardData.totalMovements += cardMovements.length;
            } catch (cardError) {
                console.warn(`Error loading data for card ${card.name}:`, cardError);
            }
        }
        
        console.log('Board data loaded:', allBoardData);
        updateBoardDisplay();
    } catch (error) {
        console.error('Error loading board data:', error);
    }
}

function updateBoardDisplay() {
    // Update summary stats
    document.getElementById('total-cards').textContent = allBoardData.cards.length;
    document.getElementById('total-time-tracked').textContent = formatDuration(allBoardData.totalTimeTracked);
    document.getElementById('total-movements').textContent = allBoardData.totalMovements;
    
    // Update cards display
    displayBoardCards();
    displayBoardMovements();
    displayBoardListDurations();
}

function displayBoardCards() {
    const container = document.getElementById('board-cards');
    
    if (allBoardData.cards.length === 0) {
        container.innerHTML = '<div class="empty-state">No cards with activity found</div>';
        return;
    }
    
    const cardsWithActivity = allBoardData.cards.filter(card => 
        card.movements.length > 0 || card.timeEntries.length > 0 || Object.keys(card.listDurations).length > 0
    );
    
    if (cardsWithActivity.length === 0) {
        container.innerHTML = '<div class="empty-state">No cards with activity found</div>';
        return;
    }
    
    container.innerHTML = cardsWithActivity.map(card => `
        <div class="card-summary">
            <div class="card-header">
                <h4>${card.name}</h4>
                <span class="total-time">${formatDuration(card.totalTime)}</span>
            </div>
            ${card.members.length > 0 ? `<p class="card-members">Members: ${card.members.join(', ')}</p>` : ''}
            ${card.timeEntries.length > 0 ? `<p class="time-entries-count">${card.timeEntries.length} time entries</p>` : ''}
            ${card.movements.length > 0 ? `<p class="movements-count">${card.movements.length} movements</p>` : ''}
            ${Object.keys(card.listDurations).length > 0 ? `
                <div class="list-durations-summary">
                    <strong>List Times:</strong>
                    ${Object.entries(card.listDurations).map(([list, duration]) => 
                        `<span class="list-duration">${list}: ${formatDuration(duration)}</span>`
                    ).join(', ')}
                </div>
            ` : ''}
        </div>
    `).join('');
}

function displayBoardMovements() {
    const container = document.getElementById('board-movements');
    const allMovements = allBoardData.cards.flatMap(card => 
        card.movements.map(movement => ({...movement, cardName: card.name}))
    ).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (allMovements.length === 0) {
        container.innerHTML = '<div class="empty-state">No card movements yet</div>';
        return;
    }
    
    // Show only the latest 20 movements
    const recentMovements = allMovements.slice(0, 20);
    
    container.innerHTML = recentMovements.map(movement => `
        <div class="movement-entry">
            <div class="movement-header">
                <strong>${movement.cardName}</strong>: ${movement.fromList} → ${movement.toList}
            </div>
            <div class="movement-details">
                ${movement.memberName} • ${new Date(movement.date).toLocaleDateString()} ${new Date(movement.date).toLocaleTimeString()}
            </div>
        </div>
    `).join('');
    
    if (allMovements.length > 20) {
        container.innerHTML += `<div class="more-info">... and ${allMovements.length - 20} more movements</div>`;
    }
}

function displayBoardListDurations() {
    const container = document.getElementById('board-list-durations');
    const aggregatedDurations = {};
    
    // Aggregate list durations across all cards
    allBoardData.cards.forEach(card => {
        Object.entries(card.listDurations).forEach(([list, duration]) => {
            aggregatedDurations[list] = (aggregatedDurations[list] || 0) + duration;
        });
    });
    
    const lists = Object.keys(aggregatedDurations);
    if (lists.length === 0) {
        container.innerHTML = '<div class="empty-state">No list activity yet</div>';
        return;
    }
    
    // Sort by duration (highest first)
    const sortedLists = lists.sort((a, b) => aggregatedDurations[b] - aggregatedDurations[a]);
    
    container.innerHTML = sortedLists.map(list => `
        <div class="list-duration-item">
            <div class="list-name">${list}</div>
            <div class="list-duration">${formatDuration(aggregatedDurations[list])}</div>
        </div>
    `).join('');
}

async function refreshBoardData() {
    const refreshBtn = document.getElementById('refresh-data');
    refreshBtn.disabled = true;
    refreshBtn.textContent = 'Refreshing...';
    
    try {
        await loadBoardData();
        refreshBtn.textContent = 'Data Refreshed!';
        setTimeout(() => {
            refreshBtn.disabled = false;
            refreshBtn.textContent = 'Refresh Data';
        }, 2000);
    } catch (error) {
        console.error('Error refreshing data:', error);
        refreshBtn.textContent = 'Error - Try Again';
        setTimeout(() => {
            refreshBtn.disabled = false;
            refreshBtn.textContent = 'Refresh Data';
        }, 2000);
    }
}

// Manual Report Generation
async function generateReportNow() {
    const generateBtn = document.getElementById('generate-report-now');
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating Report...';
    
    try {
        const settings = await getSettings();
        
        if (!settings.reportEmail) {
            alert('Please set a report email address in the settings first.');
            return;
        }
        
        const board = await t.board('id', 'name');
        
        const reportData = {
            boardName: board.name,
            generatedAt: new Date().toISOString(),
            period: 'Manual Report - ' + new Date().toLocaleDateString(),
            cards: allBoardData.cards.filter(card => 
                card.movements.length > 0 || 
                card.timeEntries.length > 0 || 
                Object.keys(card.listDurations).length > 0
            ),
            summary: {
                totalCards: allBoardData.cards.filter(card => 
                    card.movements.length > 0 || 
                    card.timeEntries.length > 0 || 
                    Object.keys(card.listDurations).length > 0
                ).length,
                totalTimeTracked: formatDuration(allBoardData.totalTimeTracked),
                totalMovements: allBoardData.totalMovements,
                activeMembers: [...new Set(allBoardData.cards.flatMap(card => card.members))].length
            }
        };
        
        await sendReport(reportData, settings.reportEmail);
        
        generateBtn.textContent = 'Report Sent!';
        alert(`Report successfully sent to ${settings.reportEmail}`);
        
        setTimeout(() => {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Report Now';
        }, 3000);
        
    } catch (error) {
        console.error('Error generating report:', error);
        alert('Error generating report. Please check your settings and try again.');
        generateBtn.textContent = 'Error - Try Again';
        setTimeout(() => {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Report Now';
        }, 3000);
    }
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

// Settings Functions
async function getSettings() {
    try {
        return await t.get('board', 'shared', STORAGE_KEYS.SETTINGS) || {
            reportEmail: '',
            triggerLists: []
        };
    } catch (error) {
        console.error('Error getting settings:', error);
        return { reportEmail: '', triggerLists: [] };
    }
}

async function loadSettings() {
    try {
        const settings = await getSettings();
        allBoardData.settings = settings;
        document.getElementById('report-email').value = settings.reportEmail || '';
        document.getElementById('trigger-lists').value = settings.triggerLists ? settings.triggerLists.join(', ') : '';
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

async function saveSettings() {
    try {
        const settings = {
            reportEmail: document.getElementById('report-email').value,
            triggerLists: document.getElementById('trigger-lists').value.split(',').map(s => s.trim()).filter(Boolean)
        };
        
        await t.set('board', 'shared', STORAGE_KEYS.SETTINGS, settings);
        allBoardData.settings = settings;
        
        // Also save to server for daily report scheduling
        await saveSettingsToServer(settings);
        
        alert('Settings saved successfully!');
        console.log('Settings saved:', settings);
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Error saving settings. Please try again.');
    }
}

async function saveSettingsToServer(settings) {
    try {
        const board = await t.board('id', 'name');
        
        const response = await fetch('/api/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                boardId: board.id,
                boardName: board.name,
                settings: settings
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to save settings to server');
        }
    } catch (error) {
        console.error('Error saving settings to server:', error);
        // Don't throw error as local settings are still saved
    }
}

async function sendReport(reportData, email) {
    try {
        const response = await fetch('/api/send-report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                reportData: reportData,
                email: email
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to send report');
        }
        
        console.log('Report sent successfully');
    } catch (error) {
        console.error('Error sending report:', error);
        throw error;
    }
}

// Update Display
function updateDisplay() {
    updateBoardDisplay();
}

// Initialize Trello Power-Up capabilities - BOARD-WIDE VERSION
TrelloPowerUp.initialize({
    'board-buttons': function(t, options) {
        return [{
            text: 'Time Tracker & Reporter',
            callback: function(t) {
                return t.popup({
                    title: 'Board Time Tracker & Reporter',
                    url: './time-tracker.html',
                    height: 700,
                    width: 600
                });
            }
        }];
    },
    
    'show-settings': function(t, options) {
        return t.popup({
            title: 'Time Tracker Settings',
            url: './time-tracker.html#settings',
            height: 400
        });
    }
}); 