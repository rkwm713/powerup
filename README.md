# Advanced Trello Reports Power-Up

A comprehensive reporting solution for Trello boards, similar to Blue Cat Reports, providing advanced analytics, charts, and insights for project management and team productivity.

## Features

### 📊 Multiple Report Types
- **Overview Dashboard**: Key metrics and board summaries
- **Productivity Analysis**: Team performance and completion rates
- **Workflow Analytics**: Bottleneck identification and cycle time
- **Team Analysis**: Workload distribution and member activity
- **Detailed Reports**: Comprehensive card-level analysis

### 📈 Advanced Analytics
- Real-time metrics calculation
- Interactive charts and visualizations
- Time-in-list tracking
- Cycle time analysis
- Productivity trends
- Workflow bottleneck detection

### 🎯 Key Metrics
- Total cards and completion rates
- Average time cards spend in each list
- Team member workload distribution
- Cards completed per day
- Average cycle time
- Workflow efficiency analysis

### 🔧 Advanced Features
- Multi-board support (extensible)
- Date range filtering
- List and member filtering
- CSV export functionality
- Real-time data refresh
- Responsive design for all screen sizes

## Installation

### Prerequisites
- Node.js (version 14 or higher)
- A Trello account with board access
- Web server to host the Power-Up files

### Setup

1. **Clone or download the project files**
   ```bash
   git clone <your-repository-url>
   cd trello-advanced-reports-powerup
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   This will serve the files on `http://localhost:3000`

4. **Create a Power-Up in Trello**
   - Go to [Trello Power-Ups](https://trello.com/power-ups/admin)
   - Click "Create a Power-Up"
   - Fill in the details:
     - Name: "Advanced Reports"
     - Iframe connector URL: `http://localhost:3000/index.html`
   - Enable the Power-Up on your board

## Usage

### Basic Usage

1. **Add to Board**: Enable the Power-Up on any Trello board
2. **Access Reports**: Click the "Advanced Reports" button in the board menu
3. **Navigate Tabs**: Use the tab interface to explore different report types
4. **Filter Data**: Use the filter controls to focus on specific time ranges, lists, or members
5. **Export Data**: Click "Export CSV" to download detailed reports

### Report Types

#### Overview Tab
- **Key Metrics**: Total cards, completed cards, active members, average time in list
- **Cards by List Chart**: Bar chart showing card distribution across lists
- **Completion Trend**: Line chart showing completion patterns over time

#### Productivity Tab
- **Performance Metrics**: Cards per day, average cycle time
- **Member Productivity**: Doughnut chart showing work distribution by team member
- **Work Distribution**: Pie chart showing list-based work allocation

#### Workflow Tab
- **Time in List Analysis**: Detailed breakdown of how long cards stay in each list
- **Bottleneck Detection**: Bar chart highlighting lists where cards spend the most time

#### Team Analysis Tab
- **Team Workload**: Overview of cards assigned to each team member
- **Member Activity**: Horizontal bar chart showing individual productivity

#### Detailed Report Tab
- **Comprehensive Table**: Complete card-level analysis with all details
- **Exportable Data**: Full dataset ready for external analysis

### Filtering Options

- **Date Range**: Last 7 days, 30 days, 90 days, or all time
- **Lists**: Filter by specific lists or view all
- **Members**: Focus on specific team members or view all

### Export Features

- **CSV Export**: Download complete report data
- **Formatted Data**: Clean, structured data ready for Excel or other tools

## Customization

### Adding New Metrics

To add custom metrics, modify the `calculateMetrics()` function in `js/report-dashboard.js`:

```javascript
function calculateCustomMetric() {
    // Your custom calculation logic
    return result;
}
```

### Creating New Charts

Add new chart functions following the existing pattern:

```javascript
function renderNewChart() {
    const ctx = document.getElementById('newChart').getContext('2d');
    // Chart configuration
}
```

### Styling

Modify the CSS in `report-dashboard.html` to customize the appearance:

```css
.custom-style {
    /* Your custom styles */
}
```

## Architecture

### File Structure
```
├── index.html              # Power-Up initialization
├── report-dashboard.html   # Main dashboard interface
├── js/
│   └── report-dashboard.js # Dashboard logic and analytics
├── package.json           # Project dependencies
├── .gitignore             # Git ignore patterns
└── README.md              # This file
```

### Key Components

1. **Power-Up Initialization** (`index.html`)
   - Registers the board button
   - Launches the dashboard modal

2. **Dashboard Interface** (`report-dashboard.html`)
   - Tab-based navigation
   - Chart containers
   - Filter controls

3. **Analytics Engine** (`js/report-dashboard.js`)
   - Data fetching from Trello API
   - Metric calculations
   - Chart rendering
   - Export functionality

## API Integration

The Power-Up uses the Trello Power-Up Client Library to access:

- **Board Data**: `t.board('all')`
- **Card Information**: `t.cards('all')`
- **Member Details**: `t.members('all')`

## Troubleshooting

### Common Issues

1. **Charts not displaying**
   - Ensure Chart.js is loading properly
   - Check browser console for errors

2. **Data not loading**
   - Verify Power-Up permissions
   - Check Trello API connectivity

3. **Export not working**
   - Ensure browser supports Blob API
   - Check popup blockers

### Debug Mode

Add debug logging:

```javascript
console.log('Debug data:', boardData);
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please:
1. Check the troubleshooting section
2. Review Trello Power-Up documentation
3. Submit issues on the project repository

## Roadmap

### Planned Features
- [ ] Multi-board reporting
- [ ] Email report scheduling
- [ ] Advanced custom fields support
- [ ] Historical trend analysis
- [ ] Advanced filtering options
- [ ] Team capacity planning
- [ ] SLA tracking and alerts

### Version History
- **v1.0.0**: Initial release with core reporting features 