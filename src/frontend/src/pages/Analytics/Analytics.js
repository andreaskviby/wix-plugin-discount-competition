import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Text, Card, Dropdown, Button, Loader } from '@wix/design-system';
import { selectToken } from '../../store/authSlice';

const Analytics = () => {
  const token = useSelector(selectToken);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [error, setError] = useState(null);

  const timeRangeOptions = [
    { id: '7d', value: 'Last 7 days' },
    { id: '30d', value: 'Last 30 days' },
    { id: '90d', value: 'Last 90 days' }
  ];

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, token]);

  const fetchAnalytics = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics/detailed?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalyticsData(data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (format) => {
    try {
      const response = await fetch(`/api/analytics/export?format=${format}&timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${timeRange}-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <Box direction="vertical" gap="SP6" padding="24px">
        <Text size="large" weight="bold">Analytics</Text>
        <div className="error-message">
          Error loading analytics: {error}
        </div>
      </Box>
    );
  }

  if (!analyticsData) {
    return (
      <Box direction="vertical" gap="SP6" padding="24px">
        <Text size="large" weight="bold">Analytics</Text>
        <Text>No analytics data available</Text>
      </Box>
    );
  }

  return (
    <Box direction="vertical" gap="SP6" padding="24px">
      <Box direction="horizontal" justify="space-between" align="center">
        <Text size="large" weight="bold">Analytics Dashboard</Text>
        
        <Box direction="horizontal" gap="SP3" align="center">
          <Dropdown
            placeholder="Select time range"
            options={timeRangeOptions}
            selectedId={timeRange}
            onSelect={(option) => setTimeRange(option.id)}
          />
          <Button size="small" priority="secondary" onClick={() => exportData('csv')}>
            Export CSV
          </Button>
          <Button size="small" priority="secondary" onClick={() => exportData('json')}>
            Export JSON
          </Button>
        </Box>
      </Box>

      {/* Overview Metrics */}
      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="metric-value">{analyticsData.overview.totalCompetitions}</div>
          <div className="metric-label">Total Competitions</div>
          <div className="metric-change positive">+2 this period</div>
        </div>
        
        <div className="analytics-card">
          <div className="metric-value">{analyticsData.overview.totalParticipants}</div>
          <div className="metric-label">Total Participants</div>
          <div className="metric-change positive">+15.3%</div>
        </div>
        
        <div className="analytics-card">
          <div className="metric-value">{analyticsData.overview.totalPrizesAwarded}</div>
          <div className="metric-label">Prizes Awarded</div>
          <div className="metric-change positive">+8.7%</div>
        </div>
        
        <div className="analytics-card">
          <div className="metric-value">{analyticsData.overview.conversionRate}</div>
          <div className="metric-label">Conversion Rate</div>
          <div className="metric-change positive">+2.1%</div>
        </div>
        
        <div className="analytics-card">
          <div className="metric-value">{analyticsData.overview.averageOrderValue}</div>
          <div className="metric-label">Avg Order Value</div>
          <div className="metric-change positive">+5.4%</div>
        </div>
        
        <div className="analytics-card">
          <div className="metric-value">{analyticsData.overview.totalRevenue}</div>
          <div className="metric-label">Total Revenue</div>
          <div className="metric-change positive">+12.8%</div>
        </div>
      </div>

      {/* Competition Performance */}
      <Card>
        <Card.Header title="Competition Performance" />
        <Card.Content>
          <Box direction="vertical" gap="SP4">
            {analyticsData.competitionPerformance.map((competition, index) => (
              <Box key={competition.id} direction="horizontal" justify="space-between" align="center">
                <Box direction="vertical" gap="SP1">
                  <Text weight="bold">{competition.name}</Text>
                  <Text size="small" secondary>{competition.type}</Text>
                </Box>
                
                <Box direction="horizontal" gap="SP4" align="center">
                  <div className="stat">
                    <div className="stat-value">{competition.participants}</div>
                    <div className="stat-label">Participants</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">{competition.conversions}</div>
                    <div className="stat-label">Conversions</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">{competition.conversionRate}</div>
                    <div className="stat-label">Rate</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">${competition.revenue.toFixed(2)}</div>
                    <div className="stat-label">Revenue</div>
                  </div>
                </Box>
              </Box>
            ))}
          </Box>
        </Card.Content>
      </Card>

      {/* Top Prizes */}
      <Card>
        <Card.Header title="Top Performing Prizes" />
        <Card.Content>
          <Box direction="vertical" gap="SP3">
            {analyticsData.topPrizes.map((prize, index) => (
              <Box key={index} direction="horizontal" justify="space-between" align="center">
                <Text>{prize.name}</Text>
                <Box direction="horizontal" gap="SP4" align="center">
                  <Text size="small">Claimed: {prize.claimed}</Text>
                  <Text size="small" weight="bold">Revenue: ${prize.revenue.toFixed(2)}</Text>
                </Box>
              </Box>
            ))}
          </Box>
        </Card.Content>
      </Card>

      {/* Demographics */}
      <Box direction="horizontal" gap="SP4">
        <Card flex="1">
          <Card.Header title="Age Groups" />
          <Card.Content>
            <Box direction="vertical" gap="SP2">
              {analyticsData.demographics.ageGroups.map((group, index) => (
                <Box key={index} direction="horizontal" justify="space-between" align="center">
                  <Text>{group.group}</Text>
                  <Text weight="bold">{group.percentage}%</Text>
                </Box>
              ))}
            </Box>
          </Card.Content>
        </Card>

        <Card flex="1">
          <Card.Header title="Device Types" />
          <Card.Content>
            <Box direction="vertical" gap="SP2">
              {analyticsData.demographics.deviceTypes.map((device, index) => (
                <Box key={index} direction="horizontal" justify="space-between" align="center">
                  <Text>{device.type}</Text>
                  <Text weight="bold">{device.percentage}%</Text>
                </Box>
              ))}
            </Box>
          </Card.Content>
        </Card>

        <Card flex="1">
          <Card.Header title="Top Countries" />
          <Card.Content>
            <Box direction="vertical" gap="SP2">
              {analyticsData.demographics.topCountries.map((country, index) => (
                <Box key={index} direction="horizontal" justify="space-between" align="center">
                  <Text>{country.country}</Text>
                  <Text weight="bold">{country.percentage}%</Text>
                </Box>
              ))}
            </Box>
          </Card.Content>
        </Card>
      </Box>

      {/* Trends Chart Placeholder */}
      <Card>
        <Card.Header title="Participation Trends" />
        <Card.Content>
          <div className="chart-container">
            <Box direction="vertical" align="center" verticalAlign="middle" height="250px">
              <Text size="medium" secondary>📈</Text>
              <Text size="small" secondary>
                Chart visualization would be implemented here using a library like Chart.js or Recharts
              </Text>
              <Text size="small" secondary>
                Showing {analyticsData.trends.participantsTrend.length} data points over {timeRange}
              </Text>
            </Box>
          </div>
        </Card.Content>
      </Card>
    </Box>
  );
};

export default Analytics;