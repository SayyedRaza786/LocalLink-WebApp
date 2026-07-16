import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  IconButton,
  Chip,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FolderOpen as CategoryIcon,
} from '@mui/icons-material';
import type { Category } from '../../types';

// Zod Validation Schema matching backend Category rules
const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Name must be less than 100 characters')
    .transform((val) => val.trim()),
  slug: z
    .string()
    .min(1, 'Slug identifier is required')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must consist only of lowercase letters, numbers, and dashes')
    .transform((val) => val.toLowerCase().trim()),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  icon: z.string().optional().or(z.literal('')),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

type CategoryFormInputs = z.infer<typeof categorySchema>;

export const CategoriesManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Fetch all categories (active + drafts)
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['adminAllCategories'],
    queryFn: () => categoryService.listAll(),
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryFormInputs>({
    resolver: zodResolver(categorySchema),
  });

  // Create Category Mutation
  const createMutation = useMutation({
    mutationFn: (data: CategoryFormInputs) => {
      const payload = {
        ...data,
        description: data.description || undefined,
        icon: data.icon || undefined,
      };
      return categoryService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAllCategories'] });
      toast.success('Category created successfully!');
      setDialogOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create category');
    },
  });

  // Update Category Mutation
  const updateMutation = useMutation({
    mutationFn: (data: CategoryFormInputs) => {
      const payload = {
        ...data,
        description: data.description || null,
        icon: data.icon || null,
      };
      return categoryService.update(selectedCategory!.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAllCategories'] });
      toast.success('Category updated successfully!');
      setDialogOpen(false);
      setSelectedCategory(null);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update category');
    },
  });

  // Delete Category Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAllCategories'] });
      toast.success('Category deleted successfully.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    },
  });

  const handleCreateOpen = () => {
    setSelectedCategory(null);
    reset({
      name: '',
      slug: '',
      description: '',
      icon: '',
      sortOrder: 0,
      isActive: true,
    });
    setDialogOpen(true);
  };

  const handleEditOpen = (category: Category) => {
    setSelectedCategory(category);
    reset();
    setValue('name', category.name);
    setValue('slug', category.slug);
    setValue('description', category.description || '');
    setValue('icon', category.icon || '');
    setValue('sortOrder', category.sortOrder || 0);
    setValue('isActive', category.isActive);
    setDialogOpen(true);
  };

  const onSubmit = (data: CategoryFormInputs) => {
    if (selectedCategory) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto-generate slug suggestion if not in edit mode
    if (!selectedCategory) {
      const generated = e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      setValue('slug', generated);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Retrieving service categories..." />;
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
            Service Categories Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure, draft, or delete service categories available on the platform
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateOpen}
          sx={{ fontWeight: 700 }}
        >
          Create Category
        </Button>
      </Box>

      {categories.length === 0 ? (
        <EmptyState
          title="No Categories Available"
          description="Create your first platform service category now."
          actionText="Create Category"
          onActionClick={handleCreateOpen}
          icon={<CategoryIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3 }} />}
        />
      ) : (
        <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
          <TableContainer component={Paper} elevation={0} sx={{ border: 'none', overflowX: 'auto' }}>
            <Table aria-label="admin categories table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Sort Order</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Slug Identifier</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{category.sortOrder}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{category.name}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell sx={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {category.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={category.isActive ? 'Active' : 'Draft/Hidden'}
                        color={category.isActive ? 'success' : 'default'}
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end" gap={1}>
                        <IconButton size="small" onClick={() => handleEditOpen(category)}>
                          <EditIcon color="action" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (window.confirm(`Delete "${category.name}" category permanently?`)) {
                              deleteMutation.mutate(category.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <DeleteIcon color="error" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Create/Edit Category Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>
          {selectedCategory ? 'Edit Service Category' : 'Create Service Category'}
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
            <TextField
              required
              fullWidth
              label="Category Name"
              placeholder="e.g. Appliance Repair"
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register('name', { onChange: handleNameChange })}
            />

            <TextField
              required
              fullWidth
              label="Slug Identifier"
              placeholder="e.g. appliance-repair"
              error={!!errors.slug}
              helperText={errors.slug?.message}
              {...register('slug')}
            />

            <TextField
              fullWidth
              label="Description"
              placeholder="Brief summary describing services inside this category..."
              multiline
              rows={3}
              error={!!errors.description}
              helperText={errors.description?.message}
              {...register('description')}
            />

            <TextField
              fullWidth
              label="Display Order (Sort Order)"
              type="number"
              error={!!errors.sortOrder}
              helperText={errors.sortOrder?.message}
              {...register('sortOrder')}
            />

            <FormControlLabel
              control={<Switch defaultChecked={selectedCategory ? selectedCategory.isActive : true} {...register('isActive')} />}
              label="Make category active and discoverable"
              sx={{ mt: 1 }}
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
            disabled={createMutation.isPending || updateMutation.isPending}
            sx={{ fontWeight: 700 }}
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <CircularProgress size={24} color="inherit" />
            ) : selectedCategory ? (
              'Save Changes'
            ) : (
              'Create Category'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default CategoriesManager;
