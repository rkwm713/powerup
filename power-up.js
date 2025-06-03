// Time Tracker & Reporter Power-Up
var t = TrelloPowerUp.iframe();

// Data keys for Trello storage
const STORAGE_KEYS = {
    MOVEMENT_ENTRIES: 'movementEntries',
    LIST_DURATIONS: 'listDurations',
    SETTINGS: 'settings',
    TRIGGERED: 'triggeredForReport',
    CARD_MEMBERS: 'cardMembers'
};

// Initialize the power-up
document.addEventListener('DOMContentLoaded', function() {
    initializePowerUp();
});

async function initializePowerUp() {
    try {
        // Load existing data
        await loadMovementEntries();
        await loadListDurations();
        await loadSettings();
        
        // Set up event listeners
        setupEventListeners();
        
        // Start monitoring card movements
        startCardMovementMonitoring();
        
        // Update display
        updateDisplay();
        
        console.log('Time Tracker Power-Up initialized successfully');
    } catch (error) {
        console.error('Error initializing power-up:', error);
    }
}

function setupEventListeners() {
    document.getElementById('save-settings').addEventListener('click', saveSettings);
}

// Timer Functions
function startTimer() {
    if (!isRunning) {
        startTime = Date.now() - elapsedTime;
        isRunning = true;
        
        timerInterval = setInterval(updateTimer, 1000);
        
        document.getElementById('start-timer').disabled = true;
        document.getElementById('stop-timer').disabled = false;
        
        // Save current timer state
        saveCurrentTimer();
        
        console.log('Timer started');
    }
}

function stopTimer() {
    if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
        
        document.getElementById('start-timer').disabled = false;
        document.getElementById('stop-timer').disabled = true;
        
        // Save the time entry
        saveTimeEntry();
        
        console.log('Timer stopped');
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    elapsedTime = 0;
    startTime = null;
    
    document.getElementById('start-timer').disabled = false;
    document.getElementById('stop-timer').disabled = true;
    document.getElementById('current-time').textContent = '00:00:00';
    
    // Clear saved timer state
    clearCurrentTimer();
    
    console.log('Timer reset');
}

function updateTimer() {
    if (isRunning && startTime) {
        elapsedTime = Date.now() - startTime;
        document.getElementById('current-time').textContent = formatTime(elapsedTime);
    }
}

function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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

// Time Entry Functions
async function saveTimeEntry() {
    if (elapsedTime > 0) {
        const member = await t.member('id', 'fullName');
        const card = await t.card('id', 'name');
        
        const timeEntry = {
            id: Date.now().toString(),
            cardId: card.id,
            cardName: card.name,
            memberId: member.id,
            memberName: member.fullName,
            duration: elapsedTime,
            startTime: startTime,
            endTime: Date.now(),
            date: new Date().toISOString(),
            description: 'Timer session'
        };
        
        await addTimeEntry(timeEntry);
        resetTimer();
    }
}

async function addTimeEntry(entry) {
    try {
        const existingEntries = await getTimeEntries();
        existingEntries.push(entry);
        
        await t.set('card', 'shared', STORAGE_KEYS.TIME_ENTRIES, existingEntries);
        await loadTimeEntries();
        
        console.log('Time entry added:', entry);
    } catch (error) {
        console.error('Error adding time entry:', error);
    }
}

async function getTimeEntries() {
    try {
        return await t.get('card', 'shared', STORAGE_KEYS.TIME_ENTRIES) || [];
    } catch (error) {
        console.error('Error getting time entries:', error);
        return [];
    }
}

async function loadTimeEntries() {
    try {
        const entries = await getTimeEntries();
        const container = document.getElementById('time-entries');
        
        if (entries.length === 0) {
            container.innerHTML = '<div class="empty-state">No time entries yet</div>';
        } else {
            container.innerHTML = entries.map(entry => createTimeEntryHTML(entry)).join('');
        }
        
        // Update total time
        const totalTime = entries.reduce((sum, entry) => sum + entry.duration, 0);
        document.getElementById('total-time').textContent = `Total: ${formatDuration(totalTime)}`;
        
    } catch (error) {
        console.error('Error loading time entries:', error);
    }
}

function createTimeEntryHTML(entry) {
    return `
        <div class="time-entry">
            <div class="time-entry-header">
                ${formatDuration(entry.duration)} - ${entry.memberName}
                <button class="delete-btn" onclick="deleteTimeEntry('${entry.id}')">×</button>
            </div>
            <div class="time-entry-details">
                ${entry.description} • ${new Date(entry.date).toLocaleDateString()} ${new Date(entry.date).toLocaleTimeString()}
            </div>
        </div>
    `;
}

async function deleteTimeEntry(entryId) {
    try {
        const entries = await getTimeEntries();
        const filteredEntries = entries.filter(entry => entry.id !== entryId);
        
        await t.set('card', 'shared', STORAGE_KEYS.TIME_ENTRIES, filteredEntries);
        await loadTimeEntries();
        
        console.log('Time entry deleted:', entryId);
    } catch (error) {
        console.error('Error deleting time entry:', error);
    }
}

// Manual Entry Functions
async function addManualEntry() {
    const hoursInput = document.getElementById('manual-hours');
    const minutesInput = document.getElementById('manual-minutes');
    const descriptionInput = document.getElementById('manual-description');
    
    const hours = parseFloat(hoursInput.value) || 0;
    const minutes = parseFloat(minutesInput.value) || 0;
    const description = descriptionInput.value || 'Manual entry';
    
    if (hours === 0 && minutes === 0) {
        alert('Please enter a valid time amount');
        return;
    }
    
    try {
        const member = await t.member('id', 'fullName');
        const card = await t.card('id', 'name');
        
        const duration = (hours * 60 + minutes) * 60 * 1000; // Convert to milliseconds
        
        const timeEntry = {
            id: Date.now().toString(),
            cardId: card.id,
            cardName: card.name,
            memberId: member.id,
            memberName: member.fullName,
            duration: duration,
            startTime: Date.now() - duration,
            endTime: Date.now(),
            date: new Date().toISOString(),
            description: description
        };
        
        await addTimeEntry(timeEntry);
        
        // Clear form
        hoursInput.value = '';
        minutesInput.value = '';
        descriptionInput.value = '';
        
        console.log('Manual entry added:', timeEntry);
    } catch (error) {
        console.error('Error adding manual entry:', error);
    }
}

// Card Movement Tracking
async function startCardMovementMonitoring() {
    try {
        // Listen for card movements
        const card = await t.card('id', 'name');
        const list = await t.list('id', 'name');
        
        // Store current list as baseline
        await t.set('card', 'private', 'currentList', {
            listId: list.id,
            listName: list.name,
            timestamp: Date.now()
        });
        
        // Set up periodic checking for movement
        setInterval(checkCardMovement, 5000); // Check every 5 seconds
        
    } catch (error) {
        console.error('Error setting up card movement monitoring:', error);
    }
}

async function checkCardMovement() {
    try {
        const card = await t.card('id', 'name');
        const currentList = await t.list('id', 'name');
        const storedList = await t.get('card', 'private', 'currentList');
        
        if (storedList && storedList.listId !== currentList.id) {
            // Card has moved!
            await recordCardMovement(storedList, currentList, card);
            
            // Update stored list
            await t.set('card', 'private', 'currentList', {
                listId: currentList.id,
                listName: currentList.name,
                timestamp: Date.now()
            });
        }
    } catch (error) {
        console.error('Error checking card movement:', error);
    }
}

async function recordCardMovement(fromList, toList, card) {
    try {
        const member = await t.member('id', 'fullName');
        const cardData = await t.card('members');
        const memberNames = cardData.members ? cardData.members.map(m => m.fullName) : [];
        await t.set('card', 'shared', STORAGE_KEYS.CARD_MEMBERS, memberNames);

        // Update list duration based on time spent in previous list
        const durations = await t.get('card', 'shared', STORAGE_KEYS.LIST_DURATIONS) || {};
        const spent = Date.now() - fromList.timestamp;
        durations[fromList.listName] = (durations[fromList.listName] || 0) + spent;
        await t.set('card', 'shared', STORAGE_KEYS.LIST_DURATIONS, durations);
        displayListDurations(durations);

        const movementEntry = {
            id: Date.now().toString(),
            cardId: card.id,
            cardName: card.name,
            memberId: member.id,
            memberName: member.fullName,
            fromList: fromList.listName,
            toList: toList.listName,
            timestamp: Date.now(),
            date: new Date().toISOString()
        };
        
        const existingMovements = await getMovementEntries();
        existingMovements.push(movementEntry);

        await t.set('card', 'shared', STORAGE_KEYS.MOVEMENT_ENTRIES, existingMovements);
        await loadMovementEntries();

        const settings = await getSettings();
        if (settings.triggerLists && settings.triggerLists.map(l => l.toLowerCase()).includes(toList.listName.toLowerCase())) {
            await t.set('card', 'shared', STORAGE_KEYS.TRIGGERED, true);
        }

        console.log('Card movement recorded:', movementEntry);
    } catch (error) {
        console.error('Error recording card movement:', error);
    }
}

async function getMovementEntries() {
    try {
        return await t.get('card', 'shared', STORAGE_KEYS.MOVEMENT_ENTRIES) || [];
    } catch (error) {
        console.error('Error getting movement entries:', error);
        return [];
    }
}

async function loadMovementEntries() {
    try {
        const entries = await getMovementEntries();
        const container = document.getElementById('movement-entries');
        
        if (entries.length === 0) {
            container.innerHTML = '<div class="empty-state">No card movements yet</div>';
        } else {
            container.innerHTML = entries.map(entry => createMovementEntryHTML(entry)).join('');
        }
    } catch (error) {
        console.error('Error loading movement entries:', error);
    }
}

function createMovementEntryHTML(entry) {
    return `
        <div class="movement-entry">
            <div class="time-entry-header">
                ${entry.fromList} → ${entry.toList}
            </div>
            <div class="time-entry-details">
                ${entry.memberName} • ${new Date(entry.date).toLocaleDateString()} ${new Date(entry.date).toLocaleTimeString()}
            </div>
        </div>
    `;
}

// List Duration Functions
async function loadListDurations() {
    try {
        const durations = await t.get('card', 'shared', STORAGE_KEYS.LIST_DURATIONS) || {};
        displayListDurations(durations);
    } catch (error) {
        console.error('Error loading list durations:', error);
    }
}

function displayListDurations(durations) {
    const container = document.getElementById('list-durations');
    const lists = Object.keys(durations);
    if (lists.length === 0) {
        container.innerHTML = '<div class="empty-state">No list activity yet</div>';
        return;
    }

    container.innerHTML = lists.map(list => `
        <div class="time-entry">
            <div class="time-entry-header">${list}</div>
            <div class="time-entry-details">${formatDuration(durations[list])}</div>
        </div>
    `).join('');
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
        
        // This would typically send to your server endpoint
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


// Update Display
function updateDisplay() {
    // Currently nothing to update periodically
}

// Initialize Trello Power-Up capabilities
TrelloPowerUp.initialize({
    'card-buttons': function(t, options) {
        return [{
            text: 'Time Tracker',
            callback: function(t) {
                return t.popup({
                    title: 'Time Tracker & Reporter',
                    url: './time-tracker.html',
                    height: 600
                });
            }
        }];
    },
    
    'card-detail-badges': function(t, options) {
        return t.get('card', 'shared', STORAGE_KEYS.LIST_DURATIONS)
            .then(function(durations) {
                if (durations && Object.keys(durations).length > 0) {
                    const total = Object.values(durations).reduce((a, b) => a + b, 0);
                    return [{
                        text: formatDuration(total),
                        color: 'blue',
                        title: 'Total time in lists'
                    }];
                }
                return [];
            });
    },
    
    'board-buttons': function(t, options) {
        return [{
            text: 'Generate Report',
            callback: function(t) {
                return generateReport(t);
            }
        }];
    }
});

// Report Generation
async function generateReport(t) {
    try {
        const board = await t.board('id', 'name', 'cards');
        const settings = await getSettings();
        
        let reportData = {
            boardName: board.name,
            generatedAt: new Date().toISOString(),
            cards: []
        };
        
        // Collect data for each card
        for (const card of board.cards) {
            const cardMovements = await t.get(card.id, 'shared', STORAGE_KEYS.MOVEMENT_ENTRIES) || [];
            const listDurations = await t.get(card.id, 'shared', STORAGE_KEYS.LIST_DURATIONS) || {};
            const members = await t.get(card.id, 'shared', STORAGE_KEYS.CARD_MEMBERS) || [];
            const triggered = await t.get(card.id, 'shared', STORAGE_KEYS.TRIGGERED);

            if (settings.triggerLists && settings.triggerLists.length > 0 && !triggered) {
                continue;
            }

            if (cardMovements.length > 0) {
                reportData.cards.push({
                    name: card.name,
                    members: members,
                    listDurations: listDurations,
                    movements: cardMovements
                });
            }
        }
        
        // Send report via email if configured
        if (settings.reportEmail) {
            await sendReport(reportData, settings.reportEmail);
        }
        
        // Show report summary
        alert(`Report generated for ${reportData.cards.length} cards.`);
        
    } catch (error) {
        console.error('Error generating report:', error);
        alert('Error generating report. Please try again.');
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
    }
} 