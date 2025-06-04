var t = window.TrelloPowerUp.iframe();
var boardData = {};
var charts = {};

// Initialize the dashboard
t.render(function() {
    loadBoardData();
});

function loadBoardData() {
    Promise.all([
        t.board('all'),
        t.cards('all'),
        t.members('all')
    ]).then(function([board, cards, members]) {
        boardData = {
            board: board,
            cards: cards,
            members: members,
            lists: board.lists || []
        };
        
        populateFilters();
        calculateMetrics();
        renderCharts();
        renderReports();
    }).catch(function(error) {
        console.error('Error loading board data:', error);
    });
}

function populateFilters() {
    const listFilter = document.getElementById('listFilter');
    const memberFilter = document.getElementById('memberFilter');
    
    // Clear existing options except "All"
    listFilter.innerHTML = '<option value="all" selected>All Lists</option>';
    memberFilter.innerHTML = '<option value="all" selected>All Members</option>';
    
    // Populate lists
    boardData.lists.forEach(list => {
        const option = document.createElement('option');
        option.value = list.id;
        option.textContent = list.name;
        listFilter.appendChild(option);
    });
    
    // Populate members
    boardData.members.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = member.fullName;
        memberFilter.appendChild(option);
    });
}

function calculateMetrics() {
    const totalCards = boardData.cards.length;
    const completedCards = boardData.cards.filter(card => 
        boardData.lists.find(list => list.id === card.idList && 
            (list.name.toLowerCase().includes('done') || list.name.toLowerCase().includes('complete'))
        )
    ).length;
    
    const activeMembers = new Set(boardData.cards.flatMap(card => card.idMembers)).size;
    
    // Calculate average time in list
    const avgTimeInList = calculateAverageTimeInList();
    
    // Update metrics display
    document.getElementById('totalCards').textContent = totalCards;
    document.getElementById('completedCards').textContent = completedCards;
    document.getElementById('activeMembers').textContent = activeMembers;
    document.getElementById('avgTimeInList').textContent = Math.round(avgTimeInList);
    
    // Productivity metrics
    const cardsPerDay = calculateCardsPerDay();
    const avgCycleTime = calculateAverageCycleTime();
    
    document.getElementById('cardsPerDay').textContent = cardsPerDay.toFixed(1);
    document.getElementById('avgCycleTime').textContent = avgCycleTime + 'd';
}

function calculateAverageTimeInList() {
    const now = new Date();
    let totalDays = 0;
    let cardCount = 0;
    
    boardData.cards.forEach(card => {
        const cardDate = new Date(card.dateLastActivity);
        const daysDiff = Math.floor((now - cardDate) / (1000 * 60 * 60 * 24));
        totalDays += daysDiff;
        cardCount++;
    });
    
    return cardCount > 0 ? totalDays / cardCount : 0;
}

function calculateCardsPerDay() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentCards = boardData.cards.filter(card => 
        new Date(card.dateLastActivity) >= thirtyDaysAgo
    );
    
    return recentCards.length / 30;
}

function calculateAverageCycleTime() {
    // Simplified cycle time calculation
    return Math.round(calculateAverageTimeInList());
}

function renderCharts() {
    renderCardsByListChart();
    renderCompletionTrendChart();
    renderMemberProductivityChart();
    renderWorkDistributionChart();
    renderBottleneckChart();
    renderMemberActivityChart();
}

function renderCardsByListChart() {
    const ctx = document.getElementById('cardsByListChart').getContext('2d');
    
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
    const ctx = document.getElementById('completionTrendChart').getContext('2d');
    
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
    const ctx = document.getElementById('memberProductivityChart').getContext('2d');
    
    const memberProductivity = {};
    boardData.members.forEach(member => {
        memberProductivity[member.fullName] = boardData.cards.filter(card => 
            card.idMembers.includes(member.id)
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
    const ctx = document.getElementById('workDistributionChart').getContext('2d');
    
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
    const ctx = document.getElementById('bottleneckChart').getContext('2d');
    
    const bottlenecks = {};
    boardData.lists.forEach(list => {
        const cardsInList = boardData.cards.filter(card => card.idList === list.id);
        const avgTime = cardsInList.reduce((sum, card) => {
            const days = Math.floor((new Date() - new Date(card.dateLastActivity)) / (1000 * 60 * 60 * 24));
            return sum + days;
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
    const ctx = document.getElementById('memberActivityChart').getContext('2d');
    
    const memberActivity = {};
    boardData.members.forEach(member => {
        memberActivity[member.fullName] = boardData.cards.filter(card => 
            card.idMembers.includes(member.id)
        ).length;
    });
    
    if (charts.memberActivity) {
        charts.memberActivity.destroy();
    }
    
    charts.memberActivity = new Chart(ctx, {
        type: 'horizontalBar',
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
    renderTimeInListReport();
    renderTeamWorkloadReport();
    renderDetailedReport();
}

function renderTimeInListReport() {
    const container = document.getElementById('timeInListReport');
    let html = '';
    
    boardData.lists.forEach(list => {
        const cardsInList = boardData.cards.filter(card => card.idList === list.id);
        
        html += `<h4>${list.name} (${cardsInList.length} cards)</h4>`;
        
        cardsInList.forEach(card => {
            const daysSince = Math.floor((new Date() - new Date(card.dateLastActivity)) / (1000 * 60 * 60 * 24));
            const members = card.idMembers.map(memberId => {
                const member = boardData.members.find(m => m.id === memberId);
                return member ? `<span class="member-badge">${member.fullName}</span>` : '';
            }).join('');
            
            html += `
                <div class="card-list-item">
                    <div>
                        <strong>${card.name}</strong><br>
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
    let html = '';
    
    boardData.members.forEach(member => {
        const assignedCards = boardData.cards.filter(card => card.idMembers.includes(member.id));
        
        html += `
            <div class="card-list-item">
                <div>
                    <strong>${member.fullName}</strong><br>
                    <small>${assignedCards.length} assigned cards</small>
                </div>
                <div>
                    ${assignedCards.map(card => `<span class="member-badge">${card.name}</span>`).join(' ')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function renderDetailedReport() {
    const container = document.getElementById('detailedReport');
    let html = '<table style="width: 100%; border-collapse: collapse;">';
    html += '<tr style="background: #f4f5f7; font-weight: bold;"><th style="padding: 10px; border: 1px solid #ddd;">Card</th><th style="padding: 10px; border: 1px solid #ddd;">List</th><th style="padding: 10px; border: 1px solid #ddd;">Members</th><th style="padding: 10px; border: 1px solid #ddd;">Days in List</th></tr>';
    
    boardData.cards.forEach(card => {
        const list = boardData.lists.find(l => l.id === card.idList);
        const members = card.idMembers.map(memberId => {
            const member = boardData.members.find(m => m.id === memberId);
            return member ? member.fullName : 'Unknown';
        }).join(', ');
        
        const daysSince = Math.floor((new Date() - new Date(card.dateLastActivity)) / (1000 * 60 * 60 * 24));
        
        html += `
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${card.name}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${list ? list.name : 'Unknown'}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${members}</td>
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
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Add active class to clicked tab
    event.target.classList.add('active');
}

function exportReport() {
    let csvContent = 'Card Name,List,Members,Days in List\n';
    
    boardData.cards.forEach(card => {
        const list = boardData.lists.find(l => l.id === card.idList);
        const members = card.idMembers.map(memberId => {
            const member = boardData.members.find(m => m.id === memberId);
            return member ? member.fullName : 'Unknown';
        }).join('; ');
        
        const daysSince = Math.floor((new Date() - new Date(card.dateLastActivity)) / (1000 * 60 * 60 * 24));
        
        csvContent += `"${card.name}","${list ? list.name : 'Unknown'}","${members}",${daysSince}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trello-board-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

function refreshData() {
    loadBoardData();
} 