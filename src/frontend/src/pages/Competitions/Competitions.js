import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Text, 
  Button, 
  Card, 
  Modal, 
  FormField, 
  Input, 
  Dropdown, 
  TextArea,
  Loader,
  MessageBoxFunctionalLayout
} from '@wix/design-system';
import { 
  fetchCompetitions, 
  fetchCompetitionTypes,
  createCompetition,
  deleteCompetition,
  selectCompetitions, 
  selectCompetitionTypes,
  selectCompetitionsLoading,
  selectCompetitionsError,
  clearError
} from '../../store/competitionsSlice';

const Competitions = () => {
  const dispatch = useDispatch();
  const competitions = useSelector(selectCompetitions);
  const competitionTypes = useSelector(selectCompetitionTypes);
  const loading = useSelector(selectCompetitionsLoading);
  const error = useSelector(selectCompetitionsError);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'SPIN_WHEEL',
    description: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    dispatch(fetchCompetitions());
    dispatch(fetchCompetitionTypes());
  }, [dispatch]);

  const handleCreateCompetition = async () => {
    try {
      await dispatch(createCompetition(formData)).unwrap();
      setIsModalOpen(false);
      setFormData({
        name: '',
        type: 'SPIN_WHEEL',
        description: '',
        startDate: '',
        endDate: ''
      });
    } catch (error) {
      console.error('Failed to create competition:', error);
    }
  };

  const handleDeleteCompetition = async (id) => {
    if (window.confirm('Are you sure you want to delete this competition?')) {
      try {
        await dispatch(deleteCompetition(id)).unwrap();
      } catch (error) {
        console.error('Failed to delete competition:', error);
      }
    }
  };

  const getCompetitionTypeOptions = () => {
    return Object.entries(competitionTypes).map(([key, type]) => ({
      id: key,
      value: type.name
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'draft': return 'warning';
      case 'completed': return 'standard';
      case 'paused': return 'danger';
      default: return 'standard';
    }
  };

  if (loading && competitions.length === 0) {
    return (
      <div className="loading-spinner">
        <Loader />
      </div>
    );
  }

  return (
    <Box direction="vertical" gap="SP6" padding="24px">
      <Box direction="horizontal" justify="space-between" align="center">
        <Text size="large" weight="bold">Competitions Management</Text>
        <Button 
          size="medium" 
          priority="primary"
          onClick={() => setIsModalOpen(true)}
        >
          Create Competition
        </Button>
      </Box>

      {error && (
        <MessageBoxFunctionalLayout
          theme="error"
          title="Error"
          onClose={() => dispatch(clearError())}
        >
          {error}
        </MessageBoxFunctionalLayout>
      )}

      <Box direction="vertical" gap="SP4">
        {competitions.length === 0 ? (
          <Card>
            <Card.Content>
              <div className="empty-state">
                <div className="empty-state-icon">🎮</div>
                <Text>No competitions yet</Text>
                <Text size="small" secondary>Create your first competition to get started</Text>
                <Button 
                  size="small" 
                  priority="secondary"
                  onClick={() => setIsModalOpen(true)}
                  style={{ marginTop: '16px' }}
                >
                  Create Competition
                </Button>
              </div>
            </Card.Content>
          </Card>
        ) : (
          competitions.map((competition) => (
            <Card key={competition.id}>
              <Card.Content>
                <Box direction="horizontal" justify="space-between" align="flex-start">
                  <Box direction="vertical" gap="SP2" flex="1">
                    <Box direction="horizontal" align="center" gap="SP2">
                      <Text size="medium" weight="bold">{competition.name}</Text>
                      <span className={`competition-status status-${competition.status}`}>
                        {competition.status}
                      </span>
                    </Box>
                    
                    <Text size="small" secondary>{competition.description}</Text>
                    
                    <Box direction="horizontal" gap="SP4">
                      <Text size="small">
                        Type: <strong>{competitionTypes[competition.type]?.name || competition.type}</strong>
                      </Text>
                      <Text size="small">
                        Created: <strong>{new Date(competition.createdAt).toLocaleDateString()}</strong>
                      </Text>
                    </Box>

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
                  </Box>

                  <Box direction="vertical" gap="SP2">
                    <Button size="small" priority="secondary">
                      Edit
                    </Button>
                    <Button size="small" priority="secondary">
                      View Analytics
                    </Button>
                    <Button 
                      size="small" 
                      priority="secondary"
                      skin="danger"
                      onClick={() => handleDeleteCompetition(competition.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
              </Card.Content>
            </Card>
          ))
        )}
      </Box>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Create Competition"
        shouldCloseOnOverlayClick
      >
        <Modal.Header title="Create New Competition" />
        <Modal.Content>
          <Box direction="vertical" gap="SP4">
            <FormField label="Competition Name" required>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter competition name"
              />
            </FormField>

            <FormField label="Competition Type" required>
              <Dropdown
                placeholder="Select competition type"
                options={getCompetitionTypeOptions()}
                selectedId={formData.type}
                onSelect={(option) => setFormData({ ...formData, type: option.id })}
              />
            </FormField>

            <FormField label="Description">
              <TextArea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your competition"
                rows={3}
              />
            </FormField>

            <Box direction="horizontal" gap="SP4">
              <FormField label="Start Date" required>
                <Input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </FormField>

              <FormField label="End Date">
                <Input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </FormField>
            </Box>
          </Box>
        </Modal.Content>
        <Modal.Footer>
          <Box direction="horizontal" gap="SP2" justify="flex-end">
            <Button 
              size="medium" 
              priority="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              size="medium" 
              priority="primary"
              onClick={handleCreateCompetition}
              disabled={!formData.name || !formData.type}
            >
              Create Competition
            </Button>
          </Box>
        </Modal.Footer>
      </Modal>
    </Box>
  );
};

export default Competitions;