import React from 'react';
import { Card, Layout, Box, Text, Button } from '@wix/design-system';
import { useDispatch } from 'react-redux';
import { loginWithWix } from '../../store/authSlice';

const Login = () => {
  const dispatch = useDispatch();

  const handleWixLogin = () => {
    dispatch(loginWithWix());
  };

  return (
    <Layout>
      <Layout.Content>
        <Box
          direction="vertical"
          align="center"
          verticalAlign="middle"
          height="100vh"
          backgroundColor="D80"
        >
          <Card>
            <Card.Header
              title="Wix Discount Competition Master"
              subtitle="AI-powered discount competitions for your Wix store"
            />
            <Card.Content>
              <Box direction="vertical" gap="SP4">
                <Text>
                  Connect your Wix store to start creating engaging discount competitions
                  that boost sales and customer engagement.
                </Text>
                
                <Box direction="vertical" gap="SP2">
                  <Text size="small" secondary>
                    ✨ AI-powered content generation
                  </Text>
                  <Text size="small" secondary>
                    🎯 Multiple competition types
                  </Text>
                  <Text size="small" secondary>
                    📊 Advanced analytics
                  </Text>
                  <Text size="small" secondary>
                    🌍 Multi-language support
                  </Text>
                </Box>
                
                <Button
                  size="large"
                  onClick={handleWixLogin}
                  prefixIcon="<WixLogo />"
                >
                  Connect with Wix
                </Button>
              </Box>
            </Card.Content>
          </Card>
        </Box>
      </Layout.Content>
    </Layout>
  );
};

export default Login;