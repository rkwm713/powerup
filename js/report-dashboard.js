var t = window.TrelloPowerUp.iframe();
var boardData = {};
var charts = {};

// Add error handling for iframe communication
window.addEventListener('error', function(e) {
    console.warn('Handled error:', e.message);
    // Don't let postMessage errors break the power-up
    if (e.message.includes('postMessage') || e.message.includes('origin')) {
        e.preventDefault();
        return false;
    }
});

// Initialize the dashboard with better error handling
t.render(function() {
    console.log('Dashboard rendering started');
    loadBoardData();
});

function loadBoardData() {
    console.log('Loading board data...');
    
    // Use the Trello provided Promise to ensure compatibility
    var Promise = window.TrelloPowerUp.Promise;
    
    Promise.all([
        t.board('all'),
        t.cards('all'), 
        t.members('all')
    ]).then(function([board, cards, members]) {
        console.log('Board data loaded successfully', { board, cards, members });
        
        boardData = {
            board: board,
            cards: cards || [],
            members: members || [],
            lists: board.lists || []
        };
        
        populateFilters();
        calculateMetrics();
        renderCharts();
        renderReports();
    }).catch(function(error) {
        console.error('Error loading board data:', error);
        showErrorMessage('Failed to load board data. Please refresh and try again.');
    });
}

function showErrorMessage(message) {
    const container = document.querySelector('.dashboard-container');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #e74c3c;">
                <h2>Error</h2>
                <p>${message}</p>
                <button onclick="location.reload()" style="background: #0079bf; color: white; border: none; padding: 10px 20px; border-radius: 3px; cursor: pointer;">
                    Retry
                </button>
            </div>
        `;
    }
}

function populateFilters() {
    const listFilter = document.getElementById('listFilter');
    const memberFilter = document.getElementById('memberFilter');
    
    if (!listFilter || !memberFilter) {
        console.error('Filter elements not found');
        return;
    }
    
    // Clear existing options except "All"
    listFilter.innerHTML = '<option value="all" selected>All Lists</option>';
    memberFilter.innerHTML = '<option value="all" selected>All Members</option>';
    
    // Populate lists
    boardData.lists.forEach(list => {
        const option = document.createElement('option');
        option.value = list.id;
        option.textContent = t.safe(list.name);
        listFilter.appendChild(option);
    });
    
    // Populate members
    boardData.members.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = t.safe(member.fullName);
        memberFilter.appendChild(option);
    });
}

function calculateMetrics() {
    try {
        const totalCards = boardData.cards.length;
        const completedCards = boardData.cards.filter(card => 
            boardData.lists.find(list => list.id === card.idList && 
                (list.name.toLowerCase().includes('done') || list.name.toLowerCase().includes('complete'))
            )
        ).length;
        
        const activeMembers = new Set(boardData.cards.flatMap(card => card.idMembers || [])).size;
        
        // Calculate average time in list
        const avgTimeInList = calculateAverageTimeInList();
        
        // Update metrics display
        updateElementText('totalCards', totalCards);
        updateElementText('completedCards', completedCards);
        updateElementText('activeMembers', activeMembers);
        updateElementText('avgTimeInList', Math.round(avgTimeInList));
        
        // Productivity metrics
        const cardsPerDay = calculateCardsPerDay();
        const avgCycleTime = calculateAverageCycleTime();
        
        updateElementText('cardsPerDay', cardsPerDay.toFixed(1));
        updateElementText('avgCycleTime', avgCycleTime + 'd');
    } catch (error) {
        console.error('Error calculating metrics:', error);
    }
}

function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

function calculateAverageTimeInList() {
    const now = new Date();
    let totalDays = 0;
    let cardCount = 0;
    
    boardData.cards.forEach(card => {
        if (card.dateLastActivity) {
            const cardDate = new Date(card.dateLastActivity);
            const daysDiff = Math.floor((now - cardDate) / (1000 * 60 * 60 * 24));
            totalDays += daysDiff;
            cardCount++;
        }
    });
    
    return cardCount > 0 ? totalDays / cardCount : 0;
}

function calculateCardsPerDay() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentCards = boardData.cards.filter(card => 
        card.dateLastActivity && new Date(card.dateLastActivity) >= thirtyDaysAgo
    );
    
    return recentCards.length / 30;
}

function calculateAverageCycleTime() {
    // Simplified cycle time calculation
    return Math.round(calculateAverageTimeInList());
}

function renderCharts() {
    try {
        // Add small delays to prevent overwhelming the browser
        setTimeout(() => renderCardsByListChart(), 100);
        setTimeout(() => renderCompletionTrendChart(), 200);
        setTimeout(() => renderMemberProductivityChart(), 300);
        setTimeout(() => renderWorkDistributionChart(), 400);
        setTimeout(() => renderBottleneckChart(), 500);
        setTimeout(() => renderMemberActivityChart(), 600);
    } catch (error) {
        console.error('Error rendering charts:', error);
    }
}

function renderCardsByListChart() {
    const canvas = document.getElementById('cardsByListChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const listCounts = {};
    boardData.lists.forEach(list => {
        listCounts[list.name] = boardData.cards.filter(card => card.idList === list.id).length;
    });
    
    if (charts.cardsByList) {
        charts.cardsByList.destroy();
    }
    
    charts.cardsByList = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(listCounts),
            datasets: [{
                label: 'Number of Cards',
                data: Object.values(listCounts),
                backgroundColor: 'rgba(0, 121, 191, 0.8)',
                borderColor: 'rgba(0, 121, 191, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderCompletionTrendChart() {
    const canvas = document.getElementById('completionTrendChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Generate mock trend data (in real implementation, use actual data)
    const labels = [];
    const data = [];
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString());
        data.push(Math.floor(Math.random() * 10) + 1); // Mock data
    }
    
    if (charts.completionTrend) {
        charts.completionTrend.destroy();
    }
    
    charts.completionTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cards Completed',
                data: data,
                borderColor: 'rgba(0, 121, 191, 1)',
                backgroundColor: 'rgba(0, 121, 191, 0.1)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderMemberProductivityChart() {
    const canvas = document.getElementById('memberProductivityChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const memberProductivity = {};
    boardData.members.forEach(member => {
        memberProductivity[member.fullName] = boardData.cards.filter(card => 
            card.idMembers && card.idMembers.includes(member.id)
        ).length;
    });
    
    if (charts.memberProductivity) {
        charts.memberProductivity.destroy();
    }
    
    charts.memberProductivity = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(memberProductivity),
            datasets: [{
                data: Object.values(memberProductivity),
                backgroundColor: [
                    '#0079bf', '#70b500', '#ff9f19', '#eb5a46', '#f2d600',
                    '#c377e0', '#ff78cb', '#00c2e0', '#51e898', '#ff4444'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function renderWorkDistributionChart() {
    const canvas = document.getElementById('workDistributionChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const listDistribution = {};
    boardData.lists.forEach(list => {
        listDistribution[list.name] = boardData.cards.filter(card => card.idList === list.id).length;
    });
    
    if (charts.workDistribution) {
        charts.workDistribution.destroy();
    }
    
    charts.workDistribution = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(listDistribution),
            datasets: [{
                data: Object.values(listDistribution),
                backgroundColor: [
                    '#0079bf', '#70b500', '#ff9f19', '#eb5a46', '#f2d600',
                    '#c377e0', '#ff78cb', '#00c2e0', '#51e898', '#ff4444'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function renderBottleneckChart() {
    const canvas = document.getElementById('bottleneckChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const bottlenecks = {};
    boardData.lists.forEach(list => {
        const cardsInList = boardData.cards.filter(card => card.idList === list.id);
        const avgTime = cardsInList.reduce((sum, card) => {
            if (card.dateLastActivity) {
                const days = Math.floor((new Date() - new Date(card.dateLastActivity)) / (1000 * 60 * 60 * 24));
                return sum + days;
            }
            return sum;
        }, 0) / (cardsInList.length || 1);
        
        bottlenecks[list.name] = avgTime;
    });
    
    if (charts.bottleneck) {
        charts.bottleneck.destroy();
    }
    
    charts.bottleneck = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(bottlenecks),
            datasets: [{
                label: 'Average Days in List',
                data: Object.values(bottlenecks).map(v => Math.round(v)),
                backgroundColor: 'rgba(235, 90, 70, 0.8)',
                borderColor: 'rgba(235, 90, 70, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderMemberActivityChart() {
    const canvas = document.getElementById('memberActivityChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const memberActivity = {};
    boardData.members.forEach(member => {
        memberActivity[member.fullName] = boardData.cards.filter(card => 
            card.idMembers && card.idMembers.includes(member.id)
        ).length;
    });
    
    if (charts.memberActivity) {
        charts.memberActivity.destroy();
    }
    
    charts.memberActivity = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(memberActivity),
            datasets: [{
                label: 'Assigned Cards',
                data: Object.values(memberActivity),
                backgroundColor: 'rgba(0, 121, 191, 0.8)',
                borderColor: 'rgba(0, 121, 191, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderReports() {
    try {
        renderTimeInListReport();
        renderTeamWorkloadReport();
        renderDetailedReport();
    } catch (error) {
        console.error('Error rendering reports:', error);
    }
}

function renderTimeInListReport() {
    const container = document.getElementById('timeInListReport');
    if (!container) return;
    
    let html = '';
    
    boardData.lists.forEach(list => {
        const cardsInList = boardData.cards.filter(card => card.idList === list.id);
        
        html += `<h4>${t.safe(list.name)} (${cardsInList.length} cards)</h4>`;
        
        cardsInList.forEach(card => {
            const daysSince = card.dateLastActivity ? 
                Math.floor((new Date() - new Date(card.dateLastActivity)) / (1000 * 60 * 60 * 24)) : 0;
            const members = (card.idMembers || []).map(memberId => {
                const member = boardData.members.find(m => m.id === memberId);
                return member ? `<span class="member-badge">${t.safe(member.fullName)}</span>` : '';
            }).join('');
            
            html += `
                <div class="card-list-item">
                    <div>
                        <strong>${t.safe(card.name)}</strong><br>
                        ${members}
                    </div>
                    <div>${daysSince} days</div>
                </div>
            `;
        });
    });
    
    container.innerHTML = html;
}

function renderTeamWorkloadReport() {
    const container = document.getElementById('teamWorkloadReport');
    if (!container) return;
    
    let html = '';
    
    boardData.members.forEach(member => {
        const assignedCards = boardData.cards.filter(card => 
            card.idMembers && card.idMembers.includes(member.id)
        );
        
        html += `
            <div class="card-list-item">
                <div>
                    <strong>${t.safe(member.fullName)}</strong><br>
                    <small>${assignedCards.length} assigned cards</small>
                </div>
                <div>
                    ${assignedCards.map(card => `<span class="member-badge">${t.safe(card.name)}</span>`).join(' ')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function renderDetailedReport() {
    const container = document.getElementById('detailedReport');
    if (!container) return;
    
    let html = '<table style="width: 100%; border-collapse: collapse;">';
    html += '<tr style="background: #f4f5f7; font-weight: bold;"><th style="padding: 10px; border: 1px solid #ddd;">Card</th><th style="padding: 10px; border: 1px solid #ddd;">List</th><th style="padding: 10px; border: 1px solid #ddd;">Members</th><th style="padding: 10px; border: 1px solid #ddd;">Days in List</th></tr>';
    
    boardData.cards.forEach(card => {
        const list = boardData.lists.find(l => l.id === card.idList);
        const members = (card.idMembers || []).map(memberId => {
            const member = boardData.members.find(m => m.id === memberId);
            return member ? member.fullName : 'Unknown';
        }).join(', ');
        
        const daysSince = card.dateLastActivity ? 
            Math.floor((new Date() - new Date(card.dateLastActivity)) / (1000 * 60 * 60 * 24)) : 0;
        
        html += `
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${t.safe(card.name)}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${list ? t.safe(list.name) : 'Unknown'}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${t.safe(members)}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${daysSince}</td>
            </tr>
        `;
    });
    
    html += '</table>';
    container.innerHTML = html;
}

function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected tab content
    const targetTab = document.getElementById(tabName + '-tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Add active class to clicked tab
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

function exportReport() {
    try {
        let csvContent = 'Card Name,List,Members,Days in List\n';
        
        boardData.cards.forEach(card => {
            const list = boardData.lists.find(l => l.id === card.idList);
            const members = (card.idMembers || []).map(memberId => {
                const member = boardData.members.find(m => m.id === memberId);
                return member ? member.fullName : 'Unknown';
            }).join('; ');
            
            const daysSince = card.dateLastActivity ? 
                Math.floor((new Date() - new Date(card.dateLastActivity)) / (1000 * 60 * 60 * 24)) : 0;
            
            csvContent += `"${card.name}","${list ? list.name : 'Unknown'}","${members}",${daysSince}\n`;
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'trello-board-report.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting report:', error);
        alert('Failed to export report. Please try again.');
    }
}

function refreshData() {
    loadBoardData();
} 