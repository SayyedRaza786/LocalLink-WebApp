import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { InboxOutlined as EmptyIcon } from '@mui/icons-material';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onActionClick?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'There is no data to show here right now.',
  actionText,
  onActionClick,
  icon = <EmptyIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} />,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 8,
        px: 2,
        width: '100%',
        gap: 2,
      }}
    >
      {icon}
      <Box sx={{ maxWidth: 400 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
      {actionText && onActionClick && (
        <Button variant="contained" color="primary" onClick={onActionClick} sx={{ mt: 1 }}>
          {actionText}
        </Button>
      )}
    </Box>
  );
};
export default EmptyState;
