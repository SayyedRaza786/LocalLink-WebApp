import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notificationService from '../../services/notificationService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import {
  Box,
  Typography,
  Card,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Divider,
  Stack,
} from '@mui/material';
import {
  NotificationsActive as UnreadIcon,
  NotificationsNone as ReadIcon,
  Check as MarkReadIcon,
} from '@mui/icons-material';

export const Notifications: React.FC = () => {
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notificationsResponse, isLoading } = useQuery({
    queryKey: ['notificationsList'],
    queryFn: () => notificationService.list(),
  });

  const notifications = notificationsResponse?.data?.notifications || [];

  // Mark single as read mutation
  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationsList'] });
    },
  });

  // Mark all as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationsList'] });
      toast.success('All notifications marked as read.');
    },
    onError: () => {
      toast.error('Failed to mark all notifications as read');
    },
  });

  const handleNotificationClick = (id: string, isRead: boolean) => {
    if (!isRead) {
      markReadMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Retrieving notification alerts..." />;
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
            Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Keep track of incoming client bookings, cancellation explanations, and system updates
          </Typography>
        </Box>
        {notifications.length > 0 && (
          <Button
            variant="outlined"
            startIcon={<MarkReadIcon />}
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            sx={{ fontWeight: 700 }}
          >
            Mark All as Read
          </Button>
        )}
      </Box>

      {notifications.length === 0 ? (
        <EmptyState
          title="All Caught Up!"
          description="You don't have any notifications right now."
          icon={<ReadIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3 }} />}
        />
      ) : (
        <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
          <List disablePadding>
            {notifications.map((notif, index) => (
              <React.Fragment key={notif.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleNotificationClick(notif.id, notif.isRead)}
                    sx={{
                      py: 2.5,
                      px: 3,
                      backgroundColor: notif.isRead ? 'transparent' : 'rgba(79, 70, 229, 0.03)',
                      borderLeft: '4px solid',
                      borderLeftColor: notif.isRead ? 'transparent' : 'primary.main',
                    }}
                  >
                    <ListItemIcon>
                      {notif.isRead ? (
                        <ReadIcon color="action" />
                      ) : (
                        <UnreadIcon color="primary" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={notif.title}
                      primaryTypographyProps={{
                        fontWeight: notif.isRead ? 600 : 800,
                        color: 'text.primary',
                        fontSize: '15px',
                      }}
                      secondary={
                        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {notif.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(notif.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>
                        </Stack>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Card>
      )}
    </Box>
  );
};
export default Notifications;
