import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../src/frontend/src/pages/Dashboard/Dashboard';
import authReducer from '../../src/frontend/src/store/authSlice';
import competitionsReducer from '../../src/frontend/src/store/competitionsSlice';

// Mock Wix Design System components
jest.mock('@wix/design-system', () => ({
  Box: ({ children, ...props }) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }) => <span {...props}>{children}</span>,
  Loader: () => <div>Loading...</div>,
  Card: {
    Content: ({ children }) => <div>{children}</div>
  }
}));

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      competitions: competitionsReducer
    },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        user: { id: 'test-user', instanceId: 'test-instance' },
        token: 'test-token',
        loading: false,
        error: null
      },
      competitions: {
        competitions: [],
        competitionTypes: {},
        selectedCompetition: null,
        loading: false,
        error: null,
        totalCompetitions: 0
      },
      ...initialState
    }
  });
};

const renderWithStore = (component, store) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders dashboard title', () => {
    const store = createTestStore();
    renderWithStore(<Dashboard />, store);
    
    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
  });

  it('displays metric cards', () => {
    const store = createTestStore();
    renderWithStore(<Dashboard />, store);
    
    expect(screen.getByText('Active Competitions')).toBeInTheDocument();
    expect(screen.getByText('Total Participants')).toBeInTheDocument();
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
  });

  it('shows empty state when no competitions', () => {
    const store = createTestStore();
    renderWithStore(<Dashboard />, store);
    
    expect(screen.getByText('No competitions yet')).toBeInTheDocument();
    expect(screen.getByText('Create your first competition to get started')).toBeInTheDocument();
  });

  it('displays competitions when available', () => {
    const store = createTestStore({
      competitions: {
        competitions: [
          {
            id: '1',
            name: 'Test Competition',
            type: 'SPIN_WHEEL',
            stats: {
              totalParticipants: 100,
              conversionRate: '15%',
              totalPrizes: 25
            }
          }
        ],
        competitionTypes: {},
        selectedCompetition: null,
        loading: false,
        error: null,
        totalCompetitions: 1
      }
    });
    
    renderWithStore(<Dashboard />, store);
    
    expect(screen.getByText('Test Competition')).toBeInTheDocument();
    expect(screen.getByText('SPIN_WHEEL')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    const store = createTestStore({
      competitions: {
        competitions: [],
        competitionTypes: {},
        selectedCompetition: null,
        loading: true,
        error: null,
        totalCompetitions: 0
      }
    });
    
    renderWithStore(<Dashboard />, store);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});