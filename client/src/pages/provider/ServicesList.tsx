import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import serviceService from '../../services/serviceService';
import categoryService from '../../services/categoryService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  IconButton,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import type { Service } from '../../types';

// Zod Service Schema matching backend service.validation.ts
const serviceSchema = z.object({
  name: z
    .string()
    .min(1, 'Service name is required')
    .max(200, 'Service name must be less than 200 characters')
    .transform((val) => val.trim()),
  categoryId: z.string().min(1, 'Category is required').uuid('Invalid category ID'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  price: z.coerce
    .number()
    .min(1, 'Price must be at least $1')
    .max(100000, 'Price seems too high'),
  priceType: z.enum(['FIXED', 'HOURLY', 'STARTING_AT']),
  durationMinutes: z.coerce
    .number()
    .int('Duration must be a whole number')
    .min(1, 'Duration must be at least 1 minute')
    .max(1440, 'Duration cannot exceed 24 hours')
    .nullable()
    .optional(),
  isActive: z.boolean().default(true),
});

const serviceImageSchema = z.object({
  imageUrl: z
    .string()
    .min(1, 'Image URL is required')
    .url('Invalid URL format')
    .max(500, 'URL must be less than 500 characters'),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

type ServiceFormInputs = z.infer<typeof serviceSchema>;
type ServiceImageFormInputs = z.infer<typeof serviceImageSchema>;

export const ServicesList: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [imagesDialogOpen, setImagesDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const providerProfileId = user?.providerProfile?.id;

  // 1. Fetch provider's services
  const { data: servicesResponse, isLoading: servicesLoading } = useQuery({
    queryKey: ['providerServices', providerProfileId],
    queryFn: () => serviceService.list({ provider: providerProfileId }),
    enabled: !!providerProfileId,
  });

  const services = servicesResponse?.data?.services || [];

  // 2. Fetch categories for selector dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ['activeCategories'],
    queryFn: categoryService.listActive,
  });

  // React Hook Forms
  const {
    register: registerService,
    handleSubmit: handleServiceSubmit,
    setValue: setServiceValue,
    reset: resetServiceForm,
    formState: { errors: serviceErrors },
  } = useForm<ServiceFormInputs>({
    resolver: zodResolver(serviceSchema),
  });

  const {
    register: registerImage,
    handleSubmit: handleImageSubmit,
    reset: resetImageForm,
    formState: { errors: imageErrors },
  } = useForm<ServiceImageFormInputs>({
    resolver: zodResolver(serviceImageSchema),
  });

  // Create Service Mutation
  const createMutation = useMutation({
    mutationFn: (data: ServiceFormInputs) => {
      // Normalize empty optional values
      const payload = {
        ...data,
        description: data.description || undefined,
        durationMinutes: data.durationMinutes || undefined,
      };
      return serviceService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providerServices', providerProfileId] });
      toast.success('Service created successfully!');
      setServiceDialogOpen(false);
      resetServiceForm();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to create service';
      toast.error(msg);
    },
  });

  // Update Service Mutation
  const updateMutation = useMutation({
    mutationFn: (data: ServiceFormInputs) => {
      const payload = {
        ...data,
        description: data.description || null,
        durationMinutes: data.durationMinutes || null,
      };
      return serviceService.update(selectedService!.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providerServices', providerProfileId] });
      toast.success('Service updated successfully!');
      setServiceDialogOpen(false);
      setSelectedService(null);
      resetServiceForm();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to update service';
      toast.error(msg);
    },
  });

  // Delete Service Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => serviceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providerServices', providerProfileId] });
      toast.success('Service disabled/deleted successfully');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to delete service';
      toast.error(msg);
    },
  });

  // Add Service Image Mutation
  const addImageMutation = useMutation({
    mutationFn: (data: ServiceImageFormInputs) =>
      serviceService.addImage(selectedService!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providerServices', providerProfileId] });
      toast.success('Image added successfully!');
      resetImageForm();
      // Fetch updated service to refresh the inline images list
      serviceService.getById(selectedService!.id).then((updated) => {
        setSelectedService(updated);
      });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to add image';
      toast.error(msg);
    },
  });

  // Delete Service Image Mutation
  const deleteImageMutation = useMutation({
    mutationFn: (imageId: string) => serviceService.deleteImage(selectedService!.id, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providerServices', providerProfileId] });
      toast.success('Image removed.');
      serviceService.getById(selectedService!.id).then((updated) => {
        setSelectedService(updated);
      });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to remove image';
      toast.error(msg);
    },
  });

  const handleCreateOpen = () => {
    setSelectedService(null);
    resetServiceForm();
    setServiceDialogOpen(true);
  };

  const handleEditOpen = (service: Service) => {
    setSelectedService(service);
    resetServiceForm();
    setServiceValue('name', service.name);
    setServiceValue('categoryId', service.categoryId);
    setServiceValue('description', service.description || '');
    setServiceValue('price', service.price);
    setServiceValue('priceType', service.priceType);
    setServiceValue('durationMinutes', service.durationMinutes || null);
    setServiceValue('isActive', service.isActive);
    setServiceDialogOpen(true);
  };

  const handleImagesOpen = (service: Service) => {
    setSelectedService(service);
    resetImageForm();
    setImagesDialogOpen(true);
  };

  const onServiceSubmit = (data: ServiceFormInputs) => {
    if (selectedService) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const onImageSubmit = (data: ServiceImageFormInputs) => {
    addImageMutation.mutate(data);
  };

  if (!providerProfileId) {
    return (
      <EmptyState
        title="Profile Required"
        description="Please build and configure your provider profile first before listing services."
        actionText="Setup Profile"
        onActionClick={() => navigate('/provider/profile')} // navigate is imported and used in AppRoutes lazy list
      />
    );
  }

  if (servicesLoading) {
    return <LoadingSpinner message="Retrieving your services..." />;
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
            My Offered Services
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your service catalogs, rates, hourly quotes, and gallery photo presentations
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateOpen}
          sx={{ fontWeight: 700 }}
        >
          Add Service
        </Button>
      </Box>

      {services.length === 0 ? (
        <EmptyState
          title="No Services Listed"
          description="You haven't added any services yet. Create your first service listing to become discoverable to customers!"
          actionText="Create Service"
          onActionClick={handleCreateOpen}
        />
      ) : (
        <Grid container spacing={3}>
          {services.map((service) => (
            <Grid item xs={12} md={6} key={service.id}>
              <Card sx={{ border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {service.name}
                    </Typography>
                    <Stack direction="row" gap={1} alignItems="center">
                      <Chip
                        label={service.isActive ? 'Active' : 'Draft'}
                        color={service.isActive ? 'success' : 'default'}
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                      <Chip
                        label={service.category?.name || 'Category'}
                        color="primary"
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Stack>
                  </Box>

                  {service.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
                      {service.description}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Pricing Rate
                      </Typography>
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 850 }}>
                        ${Number(service.price).toFixed(2)}
                        {service.priceType === 'HOURLY' ? '/hr' : service.priceType === 'STARTING_AT' ? ' (Starting)' : ''}
                      </Typography>
                      {service.durationMinutes && (
                        <Typography variant="caption" color="text.secondary">
                          Duration: {service.durationMinutes} mins
                        </Typography>
                      )}
                    </Box>

                    <Stack direction="row" gap={1}>
                      <IconButton size="small" onClick={() => handleImagesOpen(service)} title="Manage Images">
                        <PhotoIcon color="primary" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleEditOpen(service)} title="Edit Details">
                        <EditIcon color="action" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this service?')) {
                            deleteMutation.mutate(service.id);
                          }
                        }}
                        title="Delete Service"
                        disabled={deleteMutation.isPending}
                      >
                        <DeleteIcon color="error" />
                      </IconButton>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 1. Create/Edit Service Dialog */}
      <Dialog open={serviceDialogOpen} onClose={() => setServiceDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>
          {selectedService ? 'Edit Service Listing' : 'Publish New Service'}
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
            <TextField
              required
              fullWidth
              label="Service Name"
              placeholder="e.g. Living Room Cleaning, Electrical Wiring"
              error={!!serviceErrors.name}
              helperText={serviceErrors.name?.message}
              {...registerService('name')}
            />

            <FormControl fullWidth error={!!serviceErrors.categoryId}>
              <InputLabel id="service-category-label">Category</InputLabel>
              <Select
                labelId="service-category-label"
                id="categoryId"
                label="Category"
                defaultValue={selectedService?.categoryId || ''}
                {...registerService('categoryId')}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
              {serviceErrors.categoryId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {serviceErrors.categoryId.message}
                </Typography>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="Description"
              placeholder="Describe the scope, materials covered, or detail specs of this service..."
              multiline
              rows={3}
              error={!!serviceErrors.description}
              helperText={serviceErrors.description?.message}
              {...registerService('description')}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                required
                fullWidth
                label="Price ($)"
                type="number"
                error={!!serviceErrors.price}
                helperText={serviceErrors.price?.message}
                {...registerService('price')}
              />

              <FormControl fullWidth>
                <InputLabel id="service-priceType-label">Price Type</InputLabel>
                <Select
                  labelId="service-priceType-label"
                  id="priceType"
                  label="Price Type"
                  defaultValue={selectedService?.priceType || 'FIXED'}
                  {...registerService('priceType')}
                >
                  <MenuItem value="FIXED">Fixed Price</MenuItem>
                  <MenuItem value="HOURLY">Hourly Rate</MenuItem>
                  <MenuItem value="STARTING_AT">Starting At</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              fullWidth
              label="Duration (Minutes) - Optional"
              type="number"
              placeholder="Approx time to complete"
              error={!!serviceErrors.durationMinutes}
              helperText={serviceErrors.durationMinutes?.message}
              {...registerService('durationMinutes')}
            />

            {selectedService && (
              <FormControl fullWidth>
                <InputLabel id="service-status-label">Active Status</InputLabel>
                <Select
                  labelId="service-status-label"
                  id="isActive"
                  label="Active Status"
                  defaultValue={selectedService.isActive ? 'true' : 'false'}
                  onChange={(e) => setServiceValue('isActive', e.target.value === 'true')}
                >
                  <MenuItem value="true">Active & Visible</MenuItem>
                  <MenuItem value="false">Inactive/Draft</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setServiceDialogOpen(false)} color="inherit" sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            onClick={handleServiceSubmit(onServiceSubmit)}
            variant="contained"
            color="primary"
            disabled={createMutation.isPending || updateMutation.isPending}
            sx={{ fontWeight: 700, px: 3 }}
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <CircularProgress size={24} color="inherit" />
            ) : selectedService ? (
              'Save Changes'
            ) : (
              'Publish Service'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 2. Gallery Images Dialog */}
      <Dialog open={imagesDialogOpen} onClose={() => setImagesDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Service Images Gallery</span>
          <IconButton onClick={() => setImagesDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedService && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Current Image Assets
              </Typography>
              {selectedService.images && selectedService.images.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                  No custom images uploaded for this service.
                </Typography>
              ) : (
                <List sx={{ mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}>
                  {selectedService.images?.map((img) => (
                    <ListItem
                      key={img.id}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          color="error"
                          onClick={() => deleteImageMutation.mutate(img.id)}
                          disabled={deleteImageMutation.isPending}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <Box
                        component="img"
                        src={img.imageUrl}
                        sx={{ width: 64, height: 48, objectFit: 'cover', borderRadius: '4px', mr: 2 }}
                      />
                      <ListItemText primary={`Order: ${img.sortOrder}`} secondary={img.imageUrl} />
                    </ListItem>
                  ))}
                </List>
              )}

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                Add New Image Link
              </Typography>
              <Box component="form" onSubmit={handleImageSubmit(onImageSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="Image Asset URL"
                  placeholder="https://example.com/photo.jpg"
                  error={!!imageErrors.imageUrl}
                  helperText={imageErrors.imageUrl?.message}
                  {...registerImage('imageUrl')}
                />
                <TextField
                  fullWidth
                  label="Sort Order"
                  type="number"
                  error={!!imageErrors.sortOrder}
                  helperText={imageErrors.sortOrder?.message}
                  {...registerImage('sortOrder')}
                />
                <Box>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={addImageMutation.isPending}
                    startIcon={addImageMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                    sx={{ fontWeight: 700 }}
                  >
                    Add Image
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};
export default ServicesList;
