import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Box, 
  Text, 
  Card, 
  Button, 
  FormField, 
  Input, 
  Dropdown,
  ToggleSwitch,
  TextArea,
  ColorPicker,
  MessageBoxFunctionalLayout
} from '@wix/design-system';
import { selectToken, selectUser } from '../../store/authSlice';

const Settings = () => {
  const token = useSelector(selectToken);
  const user = useSelector(selectUser);
  
  const [settings, setSettings] = useState({
    // General Settings
    storeName: '',
    storeDescription: '',
    industry: 'retail',
    language: 'en',
    timezone: 'UTC',
    
    // AI Settings
    aiProvider: 'openai',
    contentTone: 'friendly',
    includeEmojis: true,
    generateSocialContent: true,
    
    // Notification Settings
    emailNotifications: true,
    browserNotifications: true,
    competitionUpdates: true,
    weeklyReports: true,
    
    // Branding Settings
    primaryColor: '#3366ff',
    secondaryColor: '#6b7280',
    backgroundColor: '#ffffff',
    fontFamily: 'Inter',
    
    // Competition Defaults
    defaultCompetitionType: 'SPIN_WHEEL',
    defaultDuration: '7',
    requireEmail: true,
    ageRestriction: '18',
    maxParticipations: '1'
  });
  
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const industryOptions = [
    { id: 'retail', value: 'Retail' },
    { id: 'fashion', value: 'Fashion' },
    { id: 'electronics', value: 'Electronics' },
    { id: 'food', value: 'Food & Beverage' },
    { id: 'beauty', value: 'Beauty & Cosmetics' },
    { id: 'sports', value: 'Sports & Fitness' },
    { id: 'home', value: 'Home & Garden' },
    { id: 'other', value: 'Other' }
  ];

  const languageOptions = [
    { id: 'en', value: 'English' },
    { id: 'es', value: 'Spanish' },
    { id: 'fr', value: 'French' },
    { id: 'de', value: 'German' },
    { id: 'it', value: 'Italian' },
    { id: 'pt', value: 'Portuguese' },
    { id: 'sv', value: 'Swedish' },
    { id: 'da', value: 'Danish' },
    { id: 'no', value: 'Norwegian' }
  ];

  const competitionTypeOptions = [
    { id: 'SPIN_WHEEL', value: 'Spin Wheel' },
    { id: 'QUIZ', value: 'Quiz' },
    { id: 'INSTANT_WIN', value: 'Instant Win' },
    { id: 'PHOTO_CONTEST', value: 'Photo Contest' }
  ];

  const fontFamilyOptions = [
    { id: 'Inter', value: 'Inter' },
    { id: 'Roboto', value: 'Roboto' },
    { id: 'Open Sans', value: 'Open Sans' },
    { id: 'Lato', value: 'Lato' },
    { id: 'Montserrat', value: 'Montserrat' }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    // In a real implementation, this would fetch user settings from the API
    // For now, we'll use default values
    console.log('Loading settings for user:', user);
  };

  const saveSettings = async () => {
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      // In a real implementation, this would save to the API
      const response = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const testWixConnection = async () => {
    try {
      const response = await fetch('/api/wix/test-connection', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Wix connection test successful!');
      } else {
        alert('Wix connection test failed: ' + data.error);
      }
    } catch (error) {
      alert('Wix connection test failed: ' + error.message);
    }
  };

  return (
    <Box direction="vertical" gap="SP6" padding="24px">
      <Box direction="horizontal" justify="space-between" align="center">
        <Text size="large" weight="bold">Settings</Text>
        <Button 
          size="medium" 
          priority="primary"
          onClick={saveSettings}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>

      {saved && (
        <MessageBoxFunctionalLayout
          theme="success"
          title="Settings Saved"
          onClose={() => setSaved(false)}
        >
          Your settings have been saved successfully.
        </MessageBoxFunctionalLayout>
      )}

      {error && (
        <MessageBoxFunctionalLayout
          theme="error"
          title="Error"
          onClose={() => setError(null)}
        >
          {error}
        </MessageBoxFunctionalLayout>
      )}

      {/* General Settings */}
      <div className="settings-section">
        <div className="settings-title">General Settings</div>
        <div className="settings-description">
          Configure your store information and basic preferences
        </div>

        <Box direction="vertical" gap="SP4">
          <Box direction="horizontal" gap="SP4">
            <FormField label="Store Name" flex="1">
              <Input
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                placeholder="Enter your store name"
              />
            </FormField>

            <FormField label="Industry" flex="1">
              <Dropdown
                placeholder="Select industry"
                options={industryOptions}
                selectedId={settings.industry}
                onSelect={(option) => setSettings({ ...settings, industry: option.id })}
              />
            </FormField>
          </Box>

          <FormField label="Store Description">
            <TextArea
              value={settings.storeDescription}
              onChange={(e) => setSettings({ ...settings, storeDescription: e.target.value })}
              placeholder="Describe your store and products"
              rows={3}
            />
          </FormField>

          <Box direction="horizontal" gap="SP4">
            <FormField label="Default Language" flex="1">
              <Dropdown
                placeholder="Select language"
                options={languageOptions}
                selectedId={settings.language}
                onSelect={(option) => setSettings({ ...settings, language: option.id })}
              />
            </FormField>

            <FormField label="Timezone" flex="1">
              <Input
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                placeholder="UTC"
              />
            </FormField>
          </Box>
        </Box>
      </div>

      {/* AI Settings */}
      <div className="settings-section">
        <div className="settings-title">AI Content Generation</div>
        <div className="settings-description">
          Configure how AI generates content for your competitions
        </div>

        <Box direction="vertical" gap="SP4">
          <Box direction="horizontal" gap="SP4">
            <FormField label="Content Tone" flex="1">
              <Dropdown
                placeholder="Select tone"
                options={[
                  { id: 'friendly', value: 'Friendly' },
                  { id: 'professional', value: 'Professional' },
                  { id: 'casual', value: 'Casual' },
                  { id: 'enthusiastic', value: 'Enthusiastic' },
                  { id: 'elegant', value: 'Elegant' }
                ]}
                selectedId={settings.contentTone}
                onSelect={(option) => setSettings({ ...settings, contentTone: option.id })}
              />
            </FormField>
          </Box>

          <Box direction="vertical" gap="SP3">
            <div className="toggle-switch">
              <ToggleSwitch
                checked={settings.includeEmojis}
                onChange={() => setSettings({ ...settings, includeEmojis: !settings.includeEmojis })}
              />
              <Text>Include emojis in generated content</Text>
            </div>

            <div className="toggle-switch">
              <ToggleSwitch
                checked={settings.generateSocialContent}
                onChange={() => setSettings({ ...settings, generateSocialContent: !settings.generateSocialContent })}
              />
              <Text>Generate social media sharing content</Text>
            </div>
          </Box>
        </Box>
      </div>

      {/* Notification Settings */}
      <div className="settings-section">
        <div className="settings-title">Notifications</div>
        <div className="settings-description">
          Choose how you want to receive updates and notifications
        </div>

        <Box direction="vertical" gap="SP3">
          <div className="toggle-switch">
            <ToggleSwitch
              checked={settings.emailNotifications}
              onChange={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
            />
            <Text>Email notifications</Text>
          </div>

          <div className="toggle-switch">
            <ToggleSwitch
              checked={settings.browserNotifications}
              onChange={() => setSettings({ ...settings, browserNotifications: !settings.browserNotifications })}
            />
            <Text>Browser notifications</Text>
          </div>

          <div className="toggle-switch">
            <ToggleSwitch
              checked={settings.competitionUpdates}
              onChange={() => setSettings({ ...settings, competitionUpdates: !settings.competitionUpdates })}
            />
            <Text>Competition updates and alerts</Text>
          </div>

          <div className="toggle-switch">
            <ToggleSwitch
              checked={settings.weeklyReports}
              onChange={() => setSettings({ ...settings, weeklyReports: !settings.weeklyReports })}
            />
            <Text>Weekly performance reports</Text>
          </div>
        </Box>
      </div>

      {/* Branding Settings */}
      <div className="settings-section">
        <div className="settings-title">Branding & Design</div>
        <div className="settings-description">
          Customize the look and feel of your competitions
        </div>

        <Box direction="vertical" gap="SP4">
          <Box direction="horizontal" gap="SP4">
            <FormField label="Primary Color" flex="1">
              <Input
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                placeholder="#3366ff"
              />
            </FormField>

            <FormField label="Secondary Color" flex="1">
              <Input
                value={settings.secondaryColor}
                onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                placeholder="#6b7280"
              />
            </FormField>

            <FormField label="Background Color" flex="1">
              <Input
                value={settings.backgroundColor}
                onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                placeholder="#ffffff"
              />
            </FormField>
          </Box>

          <FormField label="Font Family">
            <Dropdown
              placeholder="Select font"
              options={fontFamilyOptions}
              selectedId={settings.fontFamily}
              onSelect={(option) => setSettings({ ...settings, fontFamily: option.id })}
            />
          </FormField>
        </Box>
      </div>

      {/* Competition Defaults */}
      <div className="settings-section">
        <div className="settings-title">Competition Defaults</div>
        <div className="settings-description">
          Set default values for new competitions
        </div>

        <Box direction="vertical" gap="SP4">
          <Box direction="horizontal" gap="SP4">
            <FormField label="Default Competition Type" flex="1">
              <Dropdown
                placeholder="Select type"
                options={competitionTypeOptions}
                selectedId={settings.defaultCompetitionType}
                onSelect={(option) => setSettings({ ...settings, defaultCompetitionType: option.id })}
              />
            </FormField>

            <FormField label="Default Duration (days)" flex="1">
              <Input
                value={settings.defaultDuration}
                onChange={(e) => setSettings({ ...settings, defaultDuration: e.target.value })}
                placeholder="7"
                type="number"
              />
            </FormField>
          </Box>

          <Box direction="horizontal" gap="SP4">
            <FormField label="Age Restriction" flex="1">
              <Input
                value={settings.ageRestriction}
                onChange={(e) => setSettings({ ...settings, ageRestriction: e.target.value })}
                placeholder="18"
                type="number"
              />
            </FormField>

            <FormField label="Max Participations per User" flex="1">
              <Input
                value={settings.maxParticipations}
                onChange={(e) => setSettings({ ...settings, maxParticipations: e.target.value })}
                placeholder="1"
                type="number"
              />
            </FormField>
          </Box>

          <div className="toggle-switch">
            <ToggleSwitch
              checked={settings.requireEmail}
              onChange={() => setSettings({ ...settings, requireEmail: !settings.requireEmail })}
            />
            <Text>Require email address for participation</Text>
          </div>
        </Box>
      </div>

      {/* Wix Integration */}
      <div className="settings-section">
        <div className="settings-title">Wix Integration</div>
        <div className="settings-description">
          Manage your Wix store connection and sync settings
        </div>

        <Box direction="vertical" gap="SP4">
          <Box direction="horizontal" gap="SP3" align="center">
            <Text>Connection Status: </Text>
            <Text weight="bold" style={{ color: '#059669' }}>Connected</Text>
            <Button size="small" priority="secondary" onClick={testWixConnection}>
              Test Connection
            </Button>
          </Box>

          <Box direction="horizontal" gap="SP3">
            <Button size="medium" priority="secondary">
              Sync Store Data
            </Button>
            <Button size="medium" priority="secondary">
              Refresh Token
            </Button>
            <Button size="medium" priority="secondary" skin="danger">
              Disconnect
            </Button>
          </Box>
        </Box>
      </div>
    </Box>
  );
};

export default Settings;