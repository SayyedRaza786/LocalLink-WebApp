import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import providerService from '../../services/providerService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  PhotoLibrary as GalleryIcon,
} from '@mui/icons-material';

// Zod Gallery Image Schema matching backend validations
const galleryImageSchema = z.object({
  imageUrl: z
    .string()
    .min(1, 'Image URL is required')
    .url('Invalid URL format')
    .max(500, 'URL must be less than 500 characters'),
  caption: z
    .string()
    .max(200, 'Caption must be less than 200 characters')
    .optional()
    .or(z.literal('')),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

type GalleryFormInputs = z.infer<typeof galleryImageSchema>;

export const GalleryManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch portfolio images
  const { data: gallery = [], isLoading } = useQuery({
    queryKey: ['myGalleryList'],
    queryFn: () => providerService.getGallery(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GalleryFormInputs>({
    resolver: zodResolver(galleryImageSchema),
    defaultValues: {
      sortOrder: 0,
    },
  });

  // Add Image Mutation
  const addMutation = useMutation({
    mutationFn: (data: GalleryFormInputs) => {
      const payload = {
        imageUrl: data.imageUrl,
        caption: data.caption || undefined,
        sortOrder: data.sortOrder,
      };
      return providerService.addGalleryImage(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myGalleryList'] });
      toast.success('Gallery image added successfully!');
      setDialogOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add gallery image');
    },
  });

  // Delete Image Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => providerService.deleteGalleryImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myGalleryList'] });
      toast.success('Gallery image removed.');
    },
    onError: () => {
      toast.error('Failed to delete image');
    },
  });

  const onSubmit = (data: GalleryFormInputs) => {
    addMutation.mutate(data);
  };

  if (isLoading) {
    return <LoadingSpinner message="Retrieving gallery images..." />;
  }

  // Sort by sortOrder
  const sortedGallery = [...gallery].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
            Portfolio Gallery Manager
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload and arrange photos demonstrating your workspace, past works, and equipment
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{ fontWeight: 700 }}
        >
          Add Photo
        </Button>
      </Box>

      {sortedGallery.length === 0 ? (
        <EmptyState
          title="Empty Portfolio Gallery"
          description="You haven't uploaded any showcase photos yet. Upload high-quality photos of your services to stand out!"
          actionText="Upload First Photo"
          onActionClick={() => setDialogOpen(true)}
          icon={<GalleryIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3 }} />}
        />
      ) : (
        <Grid container spacing={3}>
          {sortedGallery.map((img) => (
            <Grid item xs={12} sm={6} md={4} key={img.id}>
              <Card sx={{ border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={img.imageUrl}
                  alt={img.caption || 'Showcase image'}
                />
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, minHeight: '40px' }}>
                    {img.caption || 'No caption provided.'}
                  </Typography>
                  <Box sx={{ mt: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Display Order: <strong>{img.sortOrder}</strong>
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                      if (window.confirm('Delete this showcase photo?')) {
                        deleteMutation.mutate(img.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    sx={{ fontWeight: 700 }}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Photo Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>Add Showcase Photo</DialogTitle>
        <DialogContent dividers>
          <Box component="form" noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
            <TextField
              required
              fullWidth
              label="Showcase Image URL"
              placeholder="e.g. https://example.com/cleanroom.jpg"
              error={!!errors.imageUrl}
              helperText={errors.imageUrl?.message}
              {...register('imageUrl')}
            />

            <TextField
              fullWidth
              label="Caption / Label"
              placeholder="e.g. Living room deep clean results"
              error={!!errors.caption}
              helperText={errors.caption?.message}
              {...register('caption')}
            />

            <TextField
              fullWidth
              label="Display Order (Sort Order)"
              type="number"
              error={!!errors.sortOrder}
              helperText={errors.sortOrder?.message}
              {...register('sortOrder')}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit" sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            color="primary"
            disabled={addMutation.isPending}
            sx={{ fontWeight: 700 }}
          >
            {addMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Upload Photo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default GalleryManager;
