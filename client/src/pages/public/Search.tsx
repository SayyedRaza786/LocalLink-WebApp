import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import providerService from '../../services/providerService';
import categoryService from '../../services/categoryService';
import useGeoLocation from '../../hooks/useGeoLocation';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import {
  Container,
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Rating,
  Avatar,
  Stack,
  Divider,
  Paper,
  Pagination,
  IconButton,
  Chip,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Star as StarIcon,
  FilterAlt as FilterIcon,
  MyLocation as LocationSearchIcon,
  Close as ClearIcon,
} from '@mui/icons-material';

export const Search: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { location, loading: geoLoading, getCoordinates, clearLocation } = useGeoLocation();

  // Extract query filters from URL search params
  const initialQ = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialCity = searchParams.get('city') || '';
  const initialArea = searchParams.get('area') || '';
  const initialMinRating = searchParams.get('minRating') ? Number(searchParams.get('minRating')) : 0;
  const initialMinPrice = searchParams.get('minPrice') || '';
  const initialMaxPrice = searchParams.get('maxPrice') || '';
  const initialSort = searchParams.get('sort') || 'rating';
  const initialPage = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
  const initialRadius = searchParams.get('radius') ? Number(searchParams.get('radius')) : 10;

  // Local filter states
  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);
  const [city, setCity] = useState(initialCity);
  const [area, setArea] = useState(initialArea);
  const [minRating, setMinRating] = useState<number>(initialMinRating);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(initialPage);
  const [radius, setRadius] = useState<number>(initialRadius);

  // Sync state with URL params when they change
  useEffect(() => {
    setQ(searchParams.get('q') || '');
    setCategory(searchParams.get('category') || '');
    setCity(searchParams.get('city') || '');
    setArea(searchParams.get('area') || '');
    setMinRating(searchParams.get('minRating') ? Number(searchParams.get('minRating')) : 0);
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSort(searchParams.get('sort') || 'rating');
    setPage(searchParams.get('page') ? Number(searchParams.get('page')) : 1);
    setRadius(searchParams.get('radius') ? Number(searchParams.get('radius')) : 10);
  }, [searchParams]);

  // Fetch active categories for filter dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ['activeCategories'],
    queryFn: categoryService.listActive,
  });

  // Build API search parameters object
  const searchPayload: any = {
    page,
    limit: 10,
    sort,
  };
  if (q) searchPayload.q = q;
  if (category) searchPayload.category = category;
  if (minRating > 0) searchPayload.minRating = minRating;
  if (minPrice) searchPayload.minPrice = Number(minPrice);
  if (maxPrice) searchPayload.maxPrice = Number(maxPrice);

  // Geolocation active vs manual city/area filters
  if (location) {
    searchPayload.lat = location.latitude;
    searchPayload.lng = location.longitude;
    searchPayload.radius = radius;
  } else {
    if (city) searchPayload.city = city;
    if (area) searchPayload.area = area;
  }

  // Fetch search results
  const { data: searchResponse, isLoading } = useQuery({
    queryKey: ['searchProviders', searchPayload],
    queryFn: () => providerService.search(searchPayload),
  });

  const providers = searchResponse?.data || [];
  const meta = searchResponse?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  // Trigger search by updating URL search params
  const applyFilters = () => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);
    if (minRating > 0) params.set('minRating', minRating.toString());
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    params.set('page', '1'); // Reset to page 1 on filter application

    if (location) {
      params.set('radius', radius.toString());
    } else {
      if (city) params.set('city', city);
      if (area) params.set('area', area);
    }

    navigate(`/search?${params.toString()}`);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    const params = new URLSearchParams(searchParams);
    params.set('page', value.toString());
    navigate(`/search?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setQ('');
    setCategory('');
    setCity('');
    setArea('');
    setMinRating(0);
    setMinPrice('');
    setMaxPrice('');
    setRadius(10);
    clearLocation();
    navigate('/search');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
          Explore Local Services
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Find certified local providers matching your needs, location, and budget
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* 1. Sidebar Filters */}
        <Grid item xs={12} md={3.5} lg={3}>
          <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }} elevation={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterIcon color="primary" /> Filters
              </Typography>
              <Button size="small" onClick={handleClearFilters} sx={{ fontWeight: 600 }}>
                Reset
              </Button>
            </Box>

            <Divider sx={{ mb: 2.5 }} />

            {/* Keyword */}
            <TextField
              fullWidth
              label="Keywords"
              placeholder="e.g. Electrician, Cleaner"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              sx={{ mb: 2.5 }}
            />

            {/* Category Dropdown */}
            <FormControl fullWidth sx={{ mb: 2.5 }}>
              <InputLabel id="category-select-label">Category</InputLabel>
              <Select
                labelId="category-select-label"
                id="category-select"
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.slug}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider sx={{ mb: 2.5 }} />

            {/* Location Section */}
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Location
              </Typography>

              {location ? (
                <Box
                  sx={{
                    p: 1.5,
                    border: '1px solid',
                    borderColor: 'primary.light',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(79, 70, 229, 0.04)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Using Geolocation Coords
                  </Typography>
                  <IconButton size="small" onClick={clearLocation}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<LocationSearchIcon />}
                  onClick={getCoordinates}
                  disabled={geoLoading}
                  sx={{ mb: 2, py: 1.25, fontWeight: 700 }}
                >
                  {geoLoading ? 'Acquiring...' : 'Use My Geolocation'}
                </Button>
              )}

              {/* Radius filter (only show if using coords) */}
              {location ? (
                <Box sx={{ px: 1 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Search Radius: {radius} km
                  </Typography>
                  <Slider
                    value={radius}
                    min={1}
                    max={50}
                    step={1}
                    onChange={(_e, val) => setRadius(val as number)}
                    valueLabelDisplay="auto"
                  />
                </Box>
              ) : (
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="City"
                    placeholder="e.g. New York"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    label="Area/Neighborhood"
                    placeholder="e.g. Manhattan"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  />
                </Stack>
              )}
            </Box>

            <Divider sx={{ mb: 2.5 }} />

            {/* Price Filter */}
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Price Range ($)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField
                  label="Min"
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <TextField
                  label="Max"
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </Box>
            </Box>

            <Divider sx={{ mb: 2.5 }} />

            {/* Rating Filter */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Minimum Rating
              </Typography>
              <Stack direction="row" alignItems="center" gap={1}>
                <Rating
                  value={minRating}
                  onChange={(_e, val) => setMinRating(val || 0)}
                  precision={0.5}
                />
                {minRating > 0 && <Typography variant="body2">{minRating}+ Stars</Typography>}
              </Stack>
            </Box>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              onClick={applyFilters}
              sx={{ py: 1.5, fontWeight: 700 }}
            >
              Apply Filters
            </Button>
          </Paper>
        </Grid>

        {/* 2. Listings Column */}
        <Grid item xs={12} md={8.5} lg={9}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>
              {meta.total} Provider(s) Found
            </Typography>

            {/* Sort Dropdown */}
            <FormControl sx={{ minWidth: 160 }} size="small">
              <InputLabel id="sort-select-label">Sort By</InputLabel>
              <Select
                labelId="sort-select-label"
                id="sort-select"
                value={sort}
                label="Sort By"
                onChange={(e) => {
                  setSort(e.target.value);
                  const params = new URLSearchParams(searchParams);
                  params.set('sort', e.target.value);
                  navigate(`/search?${params.toString()}`);
                }}
              >
                <MenuItem value="rating">Top Rated</MenuItem>
                <MenuItem value="newest">Newest Join</MenuItem>
                {location && <MenuItem value="distance">Proximity (Closest)</MenuItem>}
              </Select>
            </FormControl>
          </Box>

          {/* Results Loader & Cards */}
          {isLoading ? (
            <SkeletonLoader variant="card" count={3} />
          ) : providers.length === 0 ? (
            <EmptyState
              title="No Providers Found"
              description="Try adjusting your filters, clearing your geolocation constraints, or searching another category."
              actionText="Reset All Filters"
              onActionClick={handleClearFilters}
            />
          ) : (
            <Stack spacing={2.5}>
              {providers.map((provider) => (
                <Card key={provider.id}>
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={3} md={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Avatar
                          src={provider.user?.avatarUrl || undefined}
                          alt={`${provider.user?.firstName} ${provider.user?.lastName}`}
                          sx={{ width: 88, height: 88, border: '2px solid', borderColor: 'primary.light' }}
                        >
                          {provider.user?.firstName?.[0]}
                        </Avatar>
                      </Grid>

                      <Grid item xs={12} sm={6} md={7}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {provider.user?.firstName} {provider.user?.lastName}
                          </Typography>
                          {provider.isVerified && (
                            <Chip label="Verified" color="secondary" size="small" sx={{ fontWeight: 700 }} />
                          )}
                        </Box>

                        <Stack direction="row" alignItems="center" gap={0.5} sx={{ my: 1 }}>
                          <Rating value={Number(provider.avgRating)} readOnly precision={0.1} size="small" />
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {Number(provider.avgRating).toFixed(1)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ({provider.totalReviews} Reviews)
                          </Typography>
                        </Stack>

                        <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1.5 }}>
                          {provider.bio || 'No description provided.'}
                        </Typography>

                        <Stack direction="row" gap={2} flexWrap="wrap" color="text.secondary">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationIcon fontSize="small" />
                            <Typography variant="caption">{provider.city}{provider.area ? `, ${provider.area}` : ''}</Typography>
                          </Box>
                          {provider.distance !== null && provider.distance !== undefined && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'primary.main', fontWeight: 600 }}>
                              <LocationIcon fontSize="small" />
                              <Typography variant="caption">{(provider as any).distance.toFixed(1)} km away</Typography>
                            </Box>
                          )}
                        </Stack>
                      </Grid>

                      <Grid item xs={12} sm={3} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' }, gap: 2 }}>
                        {provider.services && provider.services.length > 0 && (
                          <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                            <Typography variant="caption" color="text.secondary">
                              Starting price
                            </Typography>
                            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 850 }}>
                              ${Number(provider.services[0].price).toFixed(2)}
                              {provider.services[0].priceType === 'HOURLY' ? '/hr' : ''}
                            </Typography>
                          </Box>
                        )}
                        <Button
                          component={RouterLink}
                          to={`/providers/${provider.id}`}
                          variant="contained"
                          color="primary"
                          fullWidth
                          sx={{ fontWeight: 700 }}
                        >
                          View Profile
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={meta.totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </Stack>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};
export default Search;
