import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching competitions
export const fetchCompetitions = createAsyncThunk(
  'competitions/fetchCompetitions',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;
      
      const response = await fetch('/api/competitions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch competitions');
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for creating a new competition
export const createCompetition = createAsyncThunk(
  'competitions/createCompetition',
  async (competitionData, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;
      
      const response = await fetch('/api/competitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(competitionData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create competition');
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating a competition
export const updateCompetition = createAsyncThunk(
  'competitions/updateCompetition',
  async ({ id, ...updateData }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;
      
      const response = await fetch(`/api/competitions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update competition');
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for deleting a competition
export const deleteCompetition = createAsyncThunk(
  'competitions/deleteCompetition',
  async (competitionId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;
      
      const response = await fetch(`/api/competitions/${competitionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete competition');
      }
      
      return { id: competitionId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching competition types
export const fetchCompetitionTypes = createAsyncThunk(
  'competitions/fetchCompetitionTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/competitions/types');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch competition types');
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const competitionsSlice = createSlice({
  name: 'competitions',
  initialState: {
    competitions: [],
    competitionTypes: {},
    selectedCompetition: null,
    loading: false,
    error: null,
    totalCompetitions: 0
  },
  reducers: {
    selectCompetition: (state, action) => {
      state.selectedCompetition = action.payload;
    },
    clearSelectedCompetition: (state) => {
      state.selectedCompetition = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateCompetitionStats: (state, action) => {
      const { competitionId, stats } = action.payload;
      const competition = state.competitions.find(c => c.id === competitionId);
      if (competition) {
        competition.stats = { ...competition.stats, ...stats };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch competitions
      .addCase(fetchCompetitions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompetitions.fulfilled, (state, action) => {
        state.loading = false;
        state.competitions = action.payload.competitions;
        state.totalCompetitions = action.payload.total;
      })
      .addCase(fetchCompetitions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create competition
      .addCase(createCompetition.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCompetition.fulfilled, (state, action) => {
        state.loading = false;
        state.competitions.unshift(action.payload.competition);
        state.totalCompetitions += 1;
      })
      .addCase(createCompetition.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update competition
      .addCase(updateCompetition.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCompetition.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.competitions.findIndex(c => c.id === action.payload.competition.id);
        if (index !== -1) {
          state.competitions[index] = action.payload.competition;
        }
        if (state.selectedCompetition?.id === action.payload.competition.id) {
          state.selectedCompetition = action.payload.competition;
        }
      })
      .addCase(updateCompetition.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete competition
      .addCase(deleteCompetition.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCompetition.fulfilled, (state, action) => {
        state.loading = false;
        state.competitions = state.competitions.filter(c => c.id !== action.payload.id);
        state.totalCompetitions -= 1;
        if (state.selectedCompetition?.id === action.payload.id) {
          state.selectedCompetition = null;
        }
      })
      .addCase(deleteCompetition.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch competition types
      .addCase(fetchCompetitionTypes.fulfilled, (state, action) => {
        state.competitionTypes = action.payload.types;
      });
  }
});

export const { 
  selectCompetition, 
  clearSelectedCompetition, 
  clearError, 
  updateCompetitionStats 
} = competitionsSlice.actions;

// Selectors
export const selectCompetitions = (state) => state.competitions.competitions;
export const selectCompetitionTypes = (state) => state.competitions.competitionTypes;
export const selectSelectedCompetition = (state) => state.competitions.selectedCompetition;
export const selectCompetitionsLoading = (state) => state.competitions.loading;
export const selectCompetitionsError = (state) => state.competitions.error;
export const selectTotalCompetitions = (state) => state.competitions.totalCompetitions;

export default competitionsSlice.reducer;