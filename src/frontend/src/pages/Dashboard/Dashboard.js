import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Box, Text, Loader } from '@wix/design-system';
import { fetchCompetitions, selectCompetitions, selectCompetitionsLoading } from '../../store/competitionsSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const competitions = useSelector(selectCompetitions);
  const loading = useSelector(selectCompetitionsLoading);

  useEffect(() => {
    dispatch(fetchCompetitions());
  }, [dispatch]);

  // Mock metrics data
  const metrics = {
    totalCompetitions: competitions.length,
    totalParticipants: competitions.reduce((sum, comp) => sum + (comp.stats?.totalParticipants || 0), 0),
    conversionRate: '15.8%',
    revenue: '$2,450.00'
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <Loader />
      </div>
    );
  }

  return (
    <Box direction="vertical" gap="SP6" padding="24px">
      <Text size="large" weight="bold">Dashboard Overview</Text>
      
      <div className="dashboard-grid">
        <div className="metric-card">
          <div className="metric-value">{metrics.totalCompetitions}</div>
          <div className="metric-label">Active Competitions</div>
          <div className="metric-change positive">+2 this week</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-value">{metrics.totalParticipants}</div>
          <div className="metric-label">Total Participants</div>
          <div className="metric-change positive">+15.3%</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-value">{metrics.conversionRate}</div>
          <div className="metric-label">Conversion Rate</div>
          <div className="metric-change positive">+2.1%</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-value">{metrics.revenue}</div>
          <div className="metric-label">Total Revenue</div>
          <div className="metric-change positive">+8.4%</div>
        </div>
      </div>

      <Box direction="vertical" gap="SP4">
        <Text size="medium" weight="bold">Recent Competitions</Text>
        
        {competitions.length === 0 ? (
          <Card>
            <Card.Content>
              <div className="empty-state">
                <div className="empty-state-icon">🎮</div>
                <Text>No competitions yet</Text>
                <Text size="small" secondary>Create your first competition to get started</Text>
              </div>
            </Card.Content>
          </Card>
        ) : (
          competitions.slice(0, 3).map((competition) => (
            <div key={competition.id} className="competition-card">
              <div className="competition-header">
                <div>
                  <h3 className="competition-title">{competition.name}</h3>
                  <span className="competition-type">{competition.type}</span>
                </div>
              </div>
              
              <div className="competition-stats">
                <div className="stat">
                  <div className="stat-value">{competition.stats?.totalParticipants || 0}</div>
                  <div className="stat-label">Participants</div>
                </div>
                <div className="stat">
                  <div className="stat-value">{competition.stats?.conversionRate || '0%'}</div>
                  <div className="stat-label">Conversion</div>
                </div>
                <div className="stat">
                  <div className="stat-value">{competition.stats?.totalPrizes || 0}</div>
                  <div className="stat-label">Prizes</div>
                </div>
              </div>
            </div>
          ))
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;