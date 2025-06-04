// Time Tracker & Reporter Power-Up - Board-Wide Version
var t = TrelloPowerUp.iframe();

// Data keys for Trello storage
const STORAGE_KEYS = {
    MOVEMENT_ENTRIES: 'movementEntries',
    LIST_DURATIONS: 'listDurations',
    TIME_ENTRIES: 'timeEntries',
    SETTINGS: 'settings',
    TRIGGERED: 'triggeredForReport',
    CARD_MEMBERS: 'cardMembers',
    PACKAGE_PREP_FLAG: 'packagePrepFlag',
    COMPLETE_FLAG: 'completeFlag',
    LIST_TIMESTAMPS: 'listTimestamps'
};

// Special tracking for multiple boards
const BOARD_CONFIGS = {
    CPS_DESIGNER: {
        BOARD_NAME: 'CPS Designer',
        TARGET_LIST: 'Ready for Package Prep',
        REPORT_GROUP: 'Sent for Final Package Prep',
        FLAG_KEY: 'packagePrepFlag',
        MATCH_TYPE: 'exact'
    },
    CPS_DELIVERY: {
        BOARD_NAME: 'CPS Delivery Service',
        TARGET_LIST_PATTERN: 'Complete *',
        REPORT_GROUP: 'Fully Complete',
        FLAG_KEY: 'completeFlag',
        MATCH_TYPE: 'wildcard'
    }
};

// Global variables for board-wide data
let allBoardData = {
    cards: [],
    totalTimeTracked: 0,
    totalMovements: 0,
    settings: {},
    packagePrepCards: [], // Special tracking for package prep cards
    completeCards: [] // Special tracking for complete cards
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
        
        // Start monitoring card movements (for real-time tracking)
        await startBoardMovementMonitoring();
        
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

// Board Movement Monitoring for Real-time Tracking
async function startBoardMovementMonitoring() {
    try {
        const board = await t.board('id', 'name');
        console.log(`Starting movement monitoring for board: ${board.name}`);
        
        // Set up periodic checking for movements (every 30 seconds)
        setInterval(async () => {
            await checkBoardMovements();
        }, 30000);
        
    } catch (error) {
        console.error('Error setting up board movement monitoring:', error);
    }
}

async function checkBoardMovements() {
    try {
        const board = await t.board('id', 'name', 'cards');
        
        // Check each card for movements and current status
        for (const card of board.cards) {
            await updateCardStatus(card, board);
        }
    } catch (error) {
        console.error('Error checking board movements:', error);
    }
}

function matchesBoardConfig(boardName, listName) {
    for (const configKey in BOARD_CONFIGS) {
        const config = BOARD_CONFIGS[configKey];
        
        if (config.BOARD_NAME === boardName) {
            if (config.MATCH_TYPE === 'exact') {
                return config.TARGET_LIST === listName ? config : null;
            } else if (config.MATCH_TYPE === 'wildcard') {
                const pattern = config.TARGET_LIST_PATTERN.replace('*', '.*');
                const regex = new RegExp(`^${pattern}`, 'i');
                return regex.test(listName) ? config : null;
            }
        }
    }
    return null;
}

async function updateCardStatus(card, board) {
    try {
        // Get card's current list
        const cardDetails = await t.get(card.id, 'shared', 'currentListInfo');
        const currentList = await t.card('list', 'members').then(data => data.list);
        const currentMembers = await t.card('members').then(data => data.members || []);
        
        // Store current members
        const memberNames = currentMembers.map(m => m.fullName);
        await t.set(card.id, 'shared', STORAGE_KEYS.CARD_MEMBERS, memberNames);
        
        // Check if list changed
        if (!cardDetails || cardDetails.listId !== currentList.id) {
            await recordCardMovement(card, cardDetails, currentList, board, memberNames);
            
            // Update current list info
            await t.set(card.id, 'shared', 'currentListInfo', {
                listId: currentList.id,
                listName: currentList.name,
                timestamp: Date.now()
            });
        }
        
        // Update list durations
        await updateListDurations(card.id, cardDetails, currentList);
        
        // Check for special board configurations
        const matchedConfig = matchesBoardConfig(board.name, currentList.name);
        if (matchedConfig) {
            await markCardForSpecialStatus(card.id, memberNames, matchedConfig);
        }
        
    } catch (error) {
        console.warn(`Error updating status for card ${card.name}:`, error);
    }
}

async function recordCardMovement(card, fromListInfo, toList, board, members) {
    try {
        const currentMember = await t.member('id', 'fullName');
        
        // Calculate time spent in previous list
        if (fromListInfo) {
            const timeSpent = Date.now() - fromListInfo.timestamp;
            const durations = await t.get(card.id, 'shared', STORAGE_KEYS.LIST_DURATIONS) || {};
            durations[fromListInfo.listName] = (durations[fromListInfo.listName] || 0) + timeSpent;
            await t.set(card.id, 'shared', STORAGE_KEYS.LIST_DURATIONS, durations);
        }
        
        const movementEntry = {
            id: Date.now().toString(),
            cardId: card.id,
            cardName: card.name,
            memberId: currentMember.id,
            memberName: currentMember.fullName,
            fromList: fromListInfo ? fromListInfo.listName : 'Unknown',
            toList: toList.name,
            timestamp: Date.now(),
            date: new Date().toISOString(),
            boardName: board.name,
            assignedMembers: members
        };
        
        const existingMovements = await t.get(card.id, 'shared', STORAGE_KEYS.MOVEMENT_ENTRIES) || [];
        existingMovements.push(movementEntry);
        await t.set(card.id, 'shared', STORAGE_KEYS.MOVEMENT_ENTRIES, existingMovements);
        
        console.log('Card movement recorded:', movementEntry);
    } catch (error) {
        console.error('Error recording card movement:', error);
    }
}

async function updateListDurations(cardId, fromListInfo, currentList) {
    try {
        if (fromListInfo && fromListInfo.listName !== currentList.name) {
            const timeSpent = Date.now() - fromListInfo.timestamp;
            const durations = await t.get(cardId, 'shared', STORAGE_KEYS.LIST_DURATIONS) || {};
            durations[fromListInfo.listName] = (durations[fromListInfo.listName] || 0) + timeSpent;
            await t.set(cardId, 'shared', STORAGE_KEYS.LIST_DURATIONS, durations);
        }
        
        // Update current list entry timestamp
        const timestamps = await t.get(cardId, 'shared', STORAGE_KEYS.LIST_TIMESTAMPS) || {};
        timestamps[currentList.name] = Date.now();
        await t.set(cardId, 'shared', STORAGE_KEYS.LIST_TIMESTAMPS, timestamps);
        
    } catch (error) {
        console.error('Error updating list durations:', error);
    }
}

async function markCardForSpecialStatus(cardId, members, config) {
    try {
        const statusInfo = {
            markedAt: Date.now(),
            date: new Date().toISOString(),
            members: members,
            reportGroup: config.REPORT_GROUP,
            boardConfig: config.BOARD_NAME
        };
        
        await t.set(cardId, 'shared', STORAGE_KEYS[config.FLAG_KEY.toUpperCase()], statusInfo);
        console.log(`Card ${cardId} marked for ${config.REPORT_GROUP} with members:`, members);
    } catch (error) {
        console.error(`Error marking card for ${config.REPORT_GROUP}:`, error);
    }
}

// Board Data Loading Functions
async function loadBoardData() {
    try {
        const board = await t.board('id', 'name', 'cards');
        allBoardData.cards = [];
        allBoardData.totalTimeTracked = 0;
        allBoardData.totalMovements = 0;
        allBoardData.packagePrepCards = [];
        allBoardData.completeCards = [];
        
        // Load data for each card
        for (const card of board.cards) {
            try {
                const cardMovements = await t.get(card.id, 'shared', STORAGE_KEYS.MOVEMENT_ENTRIES) || [];
                const listDurations = await t.get(card.id, 'shared', STORAGE_KEYS.LIST_DURATIONS) || {};
                const timeEntries = await t.get(card.id, 'shared', STORAGE_KEYS.TIME_ENTRIES) || [];
                const members = await t.get(card.id, 'shared', STORAGE_KEYS.CARD_MEMBERS) || [];
                const packagePrepFlag = await t.get(card.id, 'shared', STORAGE_KEYS.PACKAGE_PREP_FLAG);
                const completeFlag = await t.get(card.id, 'shared', STORAGE_KEYS.COMPLETE_FLAG);
                const listTimestamps = await t.get(card.id, 'shared', STORAGE_KEYS.LIST_TIMESTAMPS) || {};
                
                const totalCardTime = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
                const totalListTime = Object.values(listDurations).reduce((sum, duration) => sum + duration, 0);
                
                // Calculate current list duration (time spent in current list so far)
                const currentListDuration = await calculateCurrentListDuration(card.id, listTimestamps);
                
                const cardData = {
                    id: card.id,
                    name: card.name,
                    movements: cardMovements,
                    listDurations: listDurations,
                    timeEntries: timeEntries,
                    members: members,
                    totalTime: totalCardTime + totalListTime,
                    packagePrepFlag: packagePrepFlag,
                    completeFlag: completeFlag,
                    currentListDuration: currentListDuration,
                    listTimestamps: listTimestamps
                };
                
                allBoardData.cards.push(cardData);
                
                // Track special status cards separately
                if (packagePrepFlag) {
                    allBoardData.packagePrepCards.push(cardData);
                }
                if (completeFlag) {
                    allBoardData.completeCards.push(cardData);
                }
                
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

async function calculateCurrentListDuration(cardId, listTimestamps) {
    try {
        // Get current list
        const currentList = await t.card('list').then(data => data.list);
        if (listTimestamps[currentList.name]) {
            return Date.now() - listTimestamps[currentList.name];
        }
        return 0;
    } catch (error) {
        return 0;
    }
}

function updateBoardDisplay() {
    // Update summary stats
    const cardsWithActivity = allBoardData.cards.filter(card => 
        card.movements.length > 0 || card.timeEntries.length > 0 || Object.keys(card.listDurations).length > 0
    );
    
    document.getElementById('total-cards').textContent = cardsWithActivity.length;
    document.getElementById('total-time-tracked').textContent = formatDuration(allBoardData.totalTimeTracked);
    document.getElementById('total-movements').textContent = allBoardData.totalMovements;
    
    // Add special status counts if any
    updateSpecialStatusCounts();
    
    // Update cards display
    displayBoardCards();
    displayBoardMovements();
    displayBoardListDurations();
    displaySpecialStatusCards();
}

function updateSpecialStatusCounts() {
    // Update package prep count
    if (allBoardData.packagePrepCards.length > 0) {
        updateOrCreateStatItem('package-prep-count', allBoardData.packagePrepCards.length, 'Ready for Package Prep', '#28a745');
    }
    
    // Update complete cards count
    if (allBoardData.completeCards.length > 0) {
        updateOrCreateStatItem('complete-count', allBoardData.completeCards.length, 'Fully Complete', '#007bff');
    }
}

function updateOrCreateStatItem(id, value, label, color) {
    const existingElement = document.getElementById(id);
    if (existingElement) {
        existingElement.textContent = value;
    } else {
        // Add stat dynamically
        const summaryStats = document.querySelector('.summary-stats');
        summaryStats.innerHTML += `
            <div class="stat-item">
                <div class="stat-value" id="${id}" style="color: ${color};">${value}</div>
                <div class="stat-label">${label}</div>
            </div>
        `;
    }
}

function displaySpecialStatusCards() {
    // Display package prep cards
    displayPackagePrepCards();
    
    // Display complete cards
    displayCompleteCards();
}

function displayPackagePrepCards() {
    // Add package prep section if there are any cards
    if (allBoardData.packagePrepCards.length > 0) {
        let packagePrepSection = document.getElementById('package-prep-section');
        
        if (!packagePrepSection) {
            // Create package prep section
            const cardsSection = document.getElementById('cards-section');
            packagePrepSection = document.createElement('div');
            packagePrepSection.id = 'package-prep-section';
            packagePrepSection.innerHTML = `
                <h3>📦 ${BOARD_CONFIGS.CPS_DESIGNER.REPORT_GROUP}</h3>
                <div id="package-prep-cards"></div>
            `;
            cardsSection.parentNode.insertBefore(packagePrepSection, cardsSection.nextSibling);
        }
        
        const container = document.getElementById('package-prep-cards');
        container.innerHTML = allBoardData.packagePrepCards.map(card => createSpecialStatusCardHTML(card, 'package-prep-card')).join('');
    }
}

function displayCompleteCards() {
    // Add complete cards section if there are any cards
    if (allBoardData.completeCards.length > 0) {
        let completeSection = document.getElementById('complete-section');
        
        if (!completeSection) {
            // Create complete section
            const insertAfter = document.getElementById('package-prep-section') || document.getElementById('cards-section');
            completeSection = document.createElement('div');
            completeSection.id = 'complete-section';
            completeSection.innerHTML = `
                <h3>✅ ${BOARD_CONFIGS.CPS_DELIVERY.REPORT_GROUP}</h3>
                <div id="complete-cards"></div>
            `;
            insertAfter.parentNode.insertBefore(completeSection, insertAfter.nextSibling);
        }
        
        const container = document.getElementById('complete-cards');
        container.innerHTML = allBoardData.completeCards.map(card => createSpecialStatusCardHTML(card, 'complete-card')).join('');
    }
}

function createSpecialStatusCardHTML(card, cssClass) {
    const statusFlag = card.packagePrepFlag || card.completeFlag;
    const statusType = card.packagePrepFlag ? 'Ready Since' : 'Completed';
    
    return `
        <div class="card-summary ${cssClass}">
            <div class="card-header">
                <h4>${card.name}</h4>
                <span class="total-time">${formatDuration(card.totalTime)}</span>
            </div>
            <p class="card-members"><strong>Assigned Members:</strong> ${card.members.join(', ') || 'None assigned'}</p>
            <p class="status-date"><strong>${statusType}:</strong> ${new Date(statusFlag.date).toLocaleDateString()} ${new Date(statusFlag.date).toLocaleTimeString()}</p>
            ${Object.keys(card.listDurations).length > 0 ? `
                <div class="list-durations-summary">
                    <strong>Time in Each Status:</strong>
                    ${Object.entries(card.listDurations).map(([list, duration]) => 
                        `<span class="list-duration">${list}: ${formatDuration(duration)}</span>`
                    ).join(', ')}
                </div>
            ` : ''}
        </div>
    `;
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
            ${card.members.length > 0 ? `<p class="card-members"><strong>Assigned Members:</strong> ${card.members.join(', ')}</p>` : ''}
            ${card.timeEntries.length > 0 ? `<p class="time-entries-count">${card.timeEntries.length} time entries</p>` : ''}
            ${card.movements.length > 0 ? `<p class="movements-count">${card.movements.length} movements</p>` : ''}
            ${Object.keys(card.listDurations).length > 0 ? `
                <div class="list-durations-summary">
                    <strong>Time in Each Status:</strong>
                    ${Object.entries(card.listDurations).map(([list, duration]) => 
                        `<span class="list-duration">${list}: ${formatDuration(duration)}</span>`
                    ).join(', ')}
                </div>
            ` : ''}
            ${card.currentListDuration > 0 ? `
                <p class="current-duration"><strong>Current Status Duration:</strong> ${formatDuration(card.currentListDuration)}</p>
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
                ${movement.assignedMembers ? `<br><em>Assigned: ${movement.assignedMembers.join(', ')}</em>` : ''}
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
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Report Now';
            return;
        }
        
        const board = await t.board('id', 'name');
        
        // Separate regular cards from special status cards
        const regularCards = allBoardData.cards.filter(card => 
            !card.packagePrepFlag && !card.completeFlag && (
                card.movements.length > 0 || 
                card.timeEntries.length > 0 || 
                Object.keys(card.listDurations).length > 0
            )
        );
        
        const reportData = {
            boardName: board.name,
            generatedAt: new Date().toISOString(),
            period: 'Manual Report - ' + new Date().toLocaleDateString(),
            cards: regularCards,
            packagePrepCards: allBoardData.packagePrepCards,
            completeCards: allBoardData.completeCards,
            summary: {
                totalCards: regularCards.length,
                packagePrepCards: allBoardData.packagePrepCards.length,
                completeCards: allBoardData.completeCards.length,
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