import React from 'react';
import { Box, Text, Button } from '@wix/design-system';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../../store/authSlice';

const Header = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="header">
      <h1 className="header-title">Discount Competition Master</h1>
      
      <div className="header-actions">
        <Box direction="horizontal" gap="SP2" align="center">
          <Text size="small" secondary>
            Store: {user?.instanceId || 'Not connected'}
          </Text>
          
          <Button
            size="small"
            skin="light"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </div>
    </div>
  );
};

export default Header;