import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import providerService from '../../services/providerService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Chip,
  CircularProgress,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import type { Availability, DayOfWeek } from '../../types';

// Zod validation for adding single slot in memory
const slotInputSchema = z
  .object({
    dayOfWeek: z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']),
    startTime: z
      .string()
      .min(1, 'Start time is required')
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:MM format'),
    endTime: z
      .string()
      .min(1, 'End time is required')
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:MM format'),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: 'Start time must be before end time',
    path: ['endTime'],
  });

type SlotInput = z.infer<typeof slotInputSchema>;

interface LocalSlot {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export const AvailabilityPlanner: React.FC = () => {
  const queryClient = useQueryClient();
  const [localSlots, setLocalSlots] = useState<LocalSlot[]>([]);

  // 1. Fetch current availability slots
  const { data: remoteSlots, isLoading } = useQuery({
    queryKey: ['myAvailability'],
    queryFn: () => providerService.getAvailability(),
  });

  // Sync remote slots to local state upon successful fetch
  useEffect(() => {
    if (remoteSlots) {
      // Map slots to simplify times if needed (convert Date to HH:MM format if returned as Full ISO)
      const mapped = remoteSlots.map((slot) => {
        let start = slot.startTime;
        let end = slot.endTime;
        
        // If they are complete ISO datetime strings, extract HH:MM
        if (start.includes('T')) {
          const d = new Date(start);
          start = d.toTimeString().substring(0, 5);
        }
        if (end.includes('T')) {
          const d = new Date(end);
          end = d.toTimeString().substring(0, 5);
        }
        
        return {
          dayOfWeek: slot.dayOfWeek,
          startTime: start,
          endTime: end,
          isAvailable: slot.isAvailable,
        };
      });
      setLocalSlots(mapped);
    }
  }, [remoteSlots]);

  // Form hooks
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SlotInput>({
    resolver: zodResolver(slotInputSchema),
    defaultValues: {
      dayOfWeek: 'MON',
      startTime: '09:00',
      endTime: '17:00',
    },
  });

  // Save Schedule Mutation
  const saveMutation = useMutation({
    mutationFn: (slots: LocalSlot[]) => providerService.setAvailability(slots),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAvailability'] });
      toast.success('Availability schedule saved successfully!');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to update schedule slots';
      toast.error(msg);
    },
  });

  const handleAddLocalSlot = (data: SlotInput) => {
    // Check if slot already exists to prevent duplicate hours
    const duplicate = localSlots.some(
      (s) =>
        s.dayOfWeek === data.dayOfWeek &&
        s.startTime === data.startTime &&
        s.endTime === data.endTime
    );

    if (duplicate) {
      toast.error('This identical time slot is already added.');
      return;
    }

    setLocalSlots((prev) => [
      ...prev,
      {
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        isAvailable: true,
      },
    ]);
    toast.success('Slot added to preview list');
  };

  const handleRemoveLocalSlot = (idx: number) => {
    setLocalSlots((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (localSlots.length === 0) {
      toast.error('Please configure at least one availability slot.');
      return;
    }
    saveMutation.mutate(localSlots);
  };

  const formatDay = (day: DayOfWeek) => {
    const days: Record<DayOfWeek, string> = {
      MON: 'Monday',
      TUE: 'Tuesday',
      WED: 'Wednesday',
      THU: 'Thursday',
      FRI: 'Friday',
      SAT: 'Saturday',
      SUN: 'Sunday',
    };
    return days[day] || day;
  };

  const convertTo12Hour = (time24: string) => {
    const [hrs, mins] = time24.split(':');
    const h = parseInt(hrs);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${mins} ${ampm}`;
  };

  if (isLoading) {
    return <LoadingSpinner message="Retrieving schedule slots..." />;
  }

  // Sort slots by day of week
  const dayOrder: Record<DayOfWeek, number> = { MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6, SUN: 7 };
  const sortedSlots = [...localSlots].sort((a, b) => {
    if (dayOrder[a.dayOfWeek] !== dayOrder[b.dayOfWeek]) {
      return dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek];
    }
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
            Weekly Availability Planner
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Set the business hours during which customers can choose you for services
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="success"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saveMutation.isPending}
          sx={{ fontWeight: 700, px: 4, py: 1.25 }}
        >
          {saveMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Save Schedule'}
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* Left Side: Add slot form */}
        <Grid item xs={12} md={5}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 850, mb: 3 }}>
                Add Availability Slot
              </Typography>

              <Box component="form" onSubmit={handleSubmit(handleAddLocalSlot)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControl fullWidth>
                  <InputLabel id="availability-day-label">Day of Week</InputLabel>
                  <Select
                    labelId="availability-day-label"
                    id="dayOfWeek"
                    label="Day of Week"
                    defaultValue="MON"
                    {...register('dayOfWeek')}
                  >
                    <MenuItem value="MON">Monday</MenuItem>
                    <MenuItem value="TUE">Tuesday</MenuItem>
                    <MenuItem value="WED">Wednesday</MenuItem>
                    <MenuItem value="THU">Thursday</MenuItem>
                    <MenuItem value="FRI">Friday</MenuItem>
                    <MenuItem value="SAT">Saturday</MenuItem>
                    <MenuItem value="SUN">Sunday</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    required
                    fullWidth
                    label="Start Time"
                    type="time"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.startTime}
                    helperText={errors.startTime?.message}
                    {...register('startTime')}
                  />

                  <TextField
                    required
                    fullWidth
                    label="End Time"
                    type="time"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.endTime}
                    helperText={errors.endTime?.message}
                    {...register('endTime')}
                  />
                </Box>

                <Button
                  type="submit"
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  fullWidth
                  sx={{ py: 1.5, fontWeight: 700 }}
                >
                  Add Slot Preview
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side: Slots Preview List */}
        <Grid item xs={12} md={7}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 850, mb: 2 }}>
                Working Hours Schedule Preview
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Make sure to click <strong>Save Schedule</strong> at the top right to submit changes to the server.
              </Typography>

              {sortedSlots.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    No availability slots added yet. Fill in the form on the left to add slots.
                  </Typography>
                </Box>
              ) : (
                <Paper sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', overflow: 'hidden' }} elevation={0}>
                  <List disablePadding>
                    {sortedSlots.map((slot, idx) => {
                      // Find real index in original unsorted list to delete correctly
                      const originalIdx = localSlots.findIndex(
                        (ls) =>
                          ls.dayOfWeek === slot.dayOfWeek &&
                          ls.startTime === slot.startTime &&
                          ls.endTime === slot.endTime
                      );
                      return (
                        <React.Fragment key={`${slot.dayOfWeek}-${slot.startTime}-${idx}`}>
                          <ListItem
                            secondaryAction={
                              <IconButton
                                edge="end"
                                color="error"
                                onClick={() => handleRemoveLocalSlot(originalIdx)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            }
                            sx={{ py: 2 }}
                          >
                            <ListItemIcon sx={{ color: 'primary.main', display: 'flex' }}>
                              <TimeIcon />
                            </ListItemIcon>
                            <ListItemText
                              primary={formatDay(slot.dayOfWeek)}
                              primaryTypographyProps={{ fontWeight: 700 }}
                            />
                            <Chip
                              label={`${convertTo12Hour(slot.startTime)} - ${convertTo12Hour(slot.endTime)}`}
                              color="primary"
                              variant="outlined"
                              sx={{ mr: 2, fontWeight: 700 }}
                            />
                          </ListItem>
                          {idx < sortedSlots.length - 1 && <Divider />}
                        </React.Fragment>
                      );
                    })}
                  </List>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
export default AvailabilityPlanner;
