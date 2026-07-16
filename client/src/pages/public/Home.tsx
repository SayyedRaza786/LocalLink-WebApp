import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import categoryService from '../../services/categoryService';
import providerService from '../../services/providerService';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  Rating,
  InputAdornment,
  CircularProgress,
  Stack,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  ElectricBolt as ElectricIcon,
  CleaningServices as CleanIcon,
  MenuBook as BookIcon,
  CameraAlt as CameraIcon,
  Build as BuildIcon,
  HomeRepairService as ServiceIcon,
  CheckCircle as CheckCircleIcon,
  CalendarMonth as CalendarIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ShieldOutlined as ShieldIcon,
  SpeedOutlined as SpeedIcon,
  PaymentOutlined as PaymentIcon,
  RateReviewOutlined as ReviewIcon,
  NearMeOutlined as NearbyIcon,
  SupportAgentOutlined as SupportIcon,
} from '@mui/icons-material';

// Helper to map category slugs to appropriate Material icons
const getCategoryIcon = (slug: string) => {
  const s = slug.toLowerCase();
  if (s.includes('electr')) return <ElectricIcon sx={{ fontSize: 32 }} />;
  if (s.includes('clean')) return <CleanIcon sx={{ fontSize: 32 }} />;
  if (s.includes('tutor') || s.includes('class')) return <BookIcon sx={{ fontSize: 32 }} />;
  if (s.includes('photo') || s.includes('video')) return <CameraIcon sx={{ fontSize: 32 }} />;
  if (s.includes('plumb') || s.includes('repair')) return <BuildIcon sx={{ fontSize: 32 }} />;
  return <ServiceIcon sx={{ fontSize: 32 }} />;
};

// Helper for category descriptions
const getCategoryDescription = (slug: string) => {
  const s = slug.toLowerCase();
  if (s.includes('electr')) return 'Electrical installation, wiring, and appliance repairs.';
  if (s.includes('clean')) return 'Home deep cleaning, office sanitization, and maid services.';
  if (s.includes('tutor')) return 'Expert tutoring in academics, languages, and skills.';
  if (s.includes('photo')) return 'Professional photography for events, portraits, and weddings.';
  if (s.includes('plumb')) return 'Leaking pipe fixes, bathroom fittings, and drain cleaning.';
  return 'Premium certified local helper services for all needs.';
};

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // Fetch active categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['activeCategories'],
    queryFn: categoryService.listActive,
  });

  // Fetch featured providers
  const { data: featuredResponse, isLoading: providersLoading } = useQuery({
    queryKey: ['featuredProviders'],
    queryFn: () => providerService.search({ limit: 4, sort: 'rating' }),
  });

  const featuredProviders = featuredResponse?.data?.providers || [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const handleCategoryClick = (slug: string) => {
    navigate(`/search?category=${slug}`);
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
    toast.success(!favorites[id] ? 'Saved to favorites' : 'Removed from favorites');
  };

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: 'background.default', color: 'text.primary' }}>
      {/* Dynamic Keyframes for floating cards and background shapes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatUpAndDown {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes pulseSoft {
          0% { transform: scale(1); opacity: 0.15; }
          100% { transform: scale(1.12); opacity: 0.28; }
        }
        .hero-float-1 { animation: floatUpAndDown 6s ease-in-out infinite; }
        .hero-float-2 { animation: floatUpAndDown 7s ease-in-out infinite 0.8s; }
        .hero-float-3 { animation: floatUpAndDown 5.5s ease-in-out infinite 1.5s; }
      ` }} />

      {/* ==========================================
          1. HERO SECTION (Light: DBEAFE gradient, Dark: charcoal/slate)
          ========================================== */}
      <Box
        sx={{
          background: (theme) =>
            theme.palette.mode === 'light'
              ? 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)'
              : 'linear-gradient(135deg, #0B0F19 0%, #1E293B 100%)',
          py: { xs: 6, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Soft Blurred Gradient Orbs */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '15%',
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: (theme) =>
              theme.palette.mode === 'light'
                ? 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(255,255,255,0) 70%)'
                : 'radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, rgba(11, 15, 25, 0) 70%)',
            filter: 'blur(40px)',
            zIndex: 1,
            animation: 'pulseSoft 8s infinite alternate',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '5%',
            left: '25%',
            width: 250,
            height: 250,
            borderRadius: '50%',
            background: (theme) =>
              theme.palette.mode === 'light'
                ? 'radial-gradient(circle, rgba(79, 70, 229, 0.12) 0%, rgba(255,255,255,0) 70%)'
                : 'radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, rgba(11, 15, 25, 0) 70%)',
            filter: 'blur(30px)',
            zIndex: 1,
            animation: 'pulseSoft 6s infinite alternate-reverse',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={6} alignItems="center">
            {/* Hero Left */}
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                {/* Slogan Trust Badge */}
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 0.8,
                    borderRadius: '50px',
                    backgroundColor: 'rgba(79, 70, 229, 0.06)',
                    border: '1px solid rgba(79, 70, 229, 0.1)',
                    mb: 3.5,
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#4F46E5' }} />
                  <Typography variant="caption" sx={{ color: '#4F46E5', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Trusted by 10,000+ Customers
                  </Typography>
                </Box>

                {/* Main Heading */}
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: '38px', sm: '50px', md: '58px' },
                    lineHeight: 1.15,
                    letterSpacing: '-1.5px',
                    color: 'text.primary',
                    mb: 2.5,
                    fontFamily: '"Outfit", sans-serif',
                  }}
                >
                  Find Certified{' '}
                  <Box
                    component="span"
                    sx={{
                      background: 'linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Service Experts
                  </Box>{' '}
                  Near You
                </Typography>

                {/* Subtitle description */}
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 500,
                    fontSize: { xs: '15px', md: '17px' },
                    lineHeight: 1.6,
                    mb: 4.5,
                    maxWidth: '520px',
                    mx: { xs: 'auto', md: '0' },
                  }}
                >
                  Instantly connect with verified local professionals for home deep cleaning, appliance repair, school tutoring, and personal wellness.
                </Typography>

                {/* Search Bar */}
                <Box
                  component="form"
                  onSubmit={handleSearchSubmit}
                  sx={{
                    p: 0.6,
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: 500,
                    backgroundColor: (theme) => theme.palette.mode === 'light' ? '#FFFFFF' : '#1E293B',
                    borderRadius: '14px',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
                    mb: 5,
                    mx: { xs: 'auto', md: '0' },
                    '&:focus-within': { borderColor: '#4F46E5', boxShadow: '0 8px 30px rgba(79, 70, 229, 0.08)' },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <TextField
                    placeholder="What service do you need today? (e.g. Electrician)"
                    variant="standard"
                    fullWidth
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      disableUnderline: true,
                      startAdornment: (
                        <InputAdornment position="start" sx={{ pl: 1.5 }}>
                          <SearchIcon sx={{ color: '#9CA3AF', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      sx: { px: 1, py: 0.8, fontSize: '14px', color: 'text.primary' },
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      borderRadius: '10px',
                      px: 3,
                      py: 1.2,
                      fontWeight: 800,
                      textTransform: 'none',
                      backgroundColor: '#4F46E5',
                      boxShadow: 'none',
                      fontSize: '14px',
                      '&:hover': { backgroundColor: '#3730A3' },
                    }}
                  >
                    Search
                  </Button>
                </Box>

                {/* Inline Badges */}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 1.5, sm: 3 }}
                  justifyContent={{ xs: 'center', md: 'flex-start' }}
                  sx={{ color: 'text.secondary' }}
                >
                  <Stack direction="row" alignItems="center" gap={1}>
                    <CheckCircleIcon sx={{ color: '#10B981', fontSize: 16 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '13px', color: 'text.secondary' }}>Verified Professionals</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <CheckCircleIcon sx={{ color: '#10B981', fontSize: 16 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '13px', color: 'text.secondary' }}>Secure Payments</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <CheckCircleIcon sx={{ color: '#10B981', fontSize: 16 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '13px', color: 'text.secondary' }}>Satisfaction Guaranteed</Typography>
                  </Stack>
                </Stack>
              </Box>
            </Grid>

            {/* Hero Right: Photo & Floating Cards */}
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <Box sx={{ position: 'relative', width: '100%', maxWidth: '440px', aspectRatio: '1/1', mt: { xs: 4, md: 0 } }}>
                {/* Large Curved Tech Photo */}
                <Box
                  component="img"
                  src="/hero_technician.png"
                  alt="Certified Service Expert"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '24px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
                    border: '4px solid',
                    borderColor: 'background.paper',
                  }}
                />

                {/* Floating Card 1: ⭐ Rating Card */}
                <Box
                  className="hero-float-1"
                  sx={{
                    display: { xs: 'none', sm: 'flex' },
                    position: 'absolute',
                    top: '8%',
                    right: { sm: '-5%', md: '-10%' },
                    backgroundColor: 'background.paper',
                    borderRadius: '16px',
                    p: 2,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
                    border: '1px solid',
                    borderColor: 'divider',
                    flexDirection: 'column',
                    gap: 0.5,
                    width: '180px',
                    zIndex: 3,
                  }}
                >
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'text.primary' }}>
                      4.8
                    </Typography>
                    <Stack direction="row">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} sx={{ color: '#F59E0B', fontSize: 13 }} />
                      ))}
                    </Stack>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    (1200+ Reviews)
                  </Typography>
                  {/* Miniature Avatar Stack */}
                  <Stack direction="row" spacing={-1} sx={{ mt: 1 }}>
                    {['1', '2', '3', '4'].map((avatarId) => (
                      <Avatar
                        key={avatarId}
                        src={`https://images.unsplash.com/photo-${avatarId === '1' ? '1534528741775-53994a69daeb' : avatarId === '2' ? '1507003211169-0a1dd7228f2d' : avatarId === '3' ? '1494790108377-be9c29b29330' : '1500648767791-00dcc994a43e'}?w=40&h=40&fit=crop`}
                        sx={{ width: 22, height: 22, border: '1.5px solid #ffffff' }}
                      />
                    ))}
                  </Stack>
                </Box>

                {/* Floating Card 2: 📅 Quick Booking */}
                <Box
                  className="hero-float-2"
                  sx={{
                    display: { xs: 'none', sm: 'flex' },
                    position: 'absolute',
                    bottom: '22%',
                    left: { sm: '-8%', md: '-14%' },
                    backgroundColor: 'background.paper',
                    borderRadius: '16px',
                    p: 2,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
                    border: '1px solid',
                    borderColor: 'divider',
                    alignItems: 'center',
                    gap: 1.5,
                    width: '210px',
                    zIndex: 3,
                  }}
                >
                  <Avatar sx={{ backgroundColor: 'rgba(7F, 70, 229, 0.08)', color: '#4F46E5', width: 36, height: 36 }}>
                    <CalendarIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '13px' }}>
                      Quick Booking
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
                      Book in just a few clicks
                    </Typography>
                  </Box>
                </Box>

                {/* Floating Card 3: ✔ Trusted Customers */}
                <Box
                  className="hero-float-3"
                  sx={{
                    display: { xs: 'none', sm: 'flex' },
                    position: 'absolute',
                    bottom: '-6%',
                    right: '-2%',
                    backgroundColor: 'background.paper',
                    borderRadius: '16px',
                    p: 2,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
                    border: '1px solid',
                    borderColor: 'divider',
                    alignItems: 'center',
                    gap: 1.5,
                    width: '190px',
                    zIndex: 3,
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                      Trusted by
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'text.primary', lineHeight: 1 }}>
                      10,000+
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>
                      Happy Customers
                    </Typography>
                  </Box>
                  <Avatar sx={{ backgroundColor: '#10B981', color: '#FFFFFF', width: 32, height: 32, ml: 'auto' }}>
                    <CheckCircleIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ==========================================
          2. POPULAR CATEGORIES SECTION (Light: pure white, Dark: body base)
          ========================================== */}
      <Box
        sx={{
          backgroundColor: (theme) => theme.palette.mode === 'light' ? '#FFFFFF' : 'background.default',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: { xs: 6, md: 10 },
        }}
      >
        <Container id="categories-section" maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'flex-end' }, gap: { xs: 2, sm: 0 }, mb: 5 }}>
            <Box>
              <Typography variant="h4" component="h2" sx={{ fontWeight: 850, fontFamily: '"Outfit", sans-serif', color: 'text.primary', mb: 1 }}>
                Popular Categories
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Choose a category to browse top service providers in your neighborhood
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              to="/search"
              variant="outlined"
              sx={{
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: '8px',
                borderColor: 'divider',
                color: 'text.primary',
                backgroundColor: 'background.paper',
                '&:hover': { borderColor: '#4F46E5', backgroundColor: 'rgba(79, 70, 229, 0.02)' },
              }}
            >
              See All Categories
            </Button>
          </Box>

          {categoriesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : categories.length === 0 ? (
            <Typography variant="body1" color="text.secondary" align="center">
              No active service categories available right now.
            </Typography>
          ) : (
            <Grid container spacing={3.5}>
              {categories.slice(0, 6).map((category) => (
                <Grid item xs={12} sm={6} md={4} key={category.id}>
                  <Card
                    sx={{
                      borderRadius: '16px',
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: (theme) => theme.palette.mode === 'light' ? '#F8FAFC' : 'background.paper',
                      boxShadow: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.04)',
                        borderColor: '#4F46E5',
                        '& .cat-avatar': { backgroundColor: 'rgba(79, 70, 229, 0.08)', color: '#4F46E5' },
                      },
                    }}
                  >
                    <CardActionArea onClick={() => handleCategoryClick(category.slug)} sx={{ p: 4, textAlign: 'left' }}>
                      <Avatar
                        className="cat-avatar"
                        sx={{
                          width: 52,
                          height: 52,
                          backgroundColor: (theme) => theme.palette.mode === 'light' ? '#EFF6FF' : '#1E293B',
                          color: 'text.secondary',
                          mb: 2.5,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {getCategoryIcon(category.slug)}
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
                        {category.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5, fontSize: '13px' }}>
                        {getCategoryDescription(category.slug)}
                      </Typography>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* ==========================================
          3. TOP RATED PROVIDERS SECTION (Light: soft grey-blue EEF2F6, Dark: dark-slate 0B0F19)
          ========================================== */}
      <Box
        sx={{
          backgroundColor: (theme) => theme.palette.mode === 'light' ? '#EEF2F6' : '#0B0F19',
          py: { xs: 6, md: 10 },
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'flex-end' }, gap: { xs: 2, sm: 0 }, mb: 5 }}>
            <Box>
              <Typography variant="h4" component="h2" sx={{ fontWeight: 850, fontFamily: '"Outfit", sans-serif', color: 'text.primary', mb: 1 }}>
                Top Rated Local Professionals
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Hire pre-screened and customer-approved experts in your city
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              to="/search"
              variant="outlined"
              sx={{
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: '8px',
                borderColor: 'divider',
                color: 'text.primary',
                backgroundColor: 'background.paper',
                '&:hover': { borderColor: '#4F46E5', backgroundColor: 'rgba(79, 70, 229, 0.02)' },
              }}
            >
              View All
            </Button>
          </Box>

          {providersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : featuredProviders.length === 0 ? (
            <Typography variant="body1" color="text.secondary" align="center">
              No registered providers available right now.
            </Typography>
          ) : (
            <Grid container spacing={3.5}>
              {featuredProviders.map((provider) => (
                <Grid item xs={12} sm={6} md={3} key={provider.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '16px',
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: 'background.paper',
                      boxShadow: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.04)',
                        borderColor: '#4F46E5',
                      },
                    }}
                  >
                    {/* Favorite Heart Bookmark */}
                    <IconButton
                      onClick={(e) => toggleFavorite(provider.id, e)}
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        backgroundColor: (theme) => theme.palette.mode === 'light' ? '#FFFFFF' : '#1E293B',
                        border: '1px solid',
                        borderColor: 'divider',
                        p: 0.8,
                        '&:hover': { backgroundColor: 'background.default', color: '#EF4444' },
                        color: favorites[provider.id] ? '#EF4444' : '#9CA3AF',
                        zIndex: 2,
                      }}
                    >
                      {favorites[provider.id] ? <FavoriteIcon sx={{ fontSize: 16 }} /> : <FavoriteBorderIcon sx={{ fontSize: 16 }} />}
                    </IconButton>

                    <CardActionArea
                      component={RouterLink}
                      to={`/providers/${provider.id}`}
                      sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                      {/* Avatar */}
                      <Avatar
                        src={provider.user?.avatarUrl || undefined}
                        alt={`${provider.user?.firstName} ${provider.user?.lastName}`}
                        sx={{
                          width: 72,
                          height: 72,
                          mb: 2,
                          border: '2px solid #E0E7FF',
                        }}
                      >
                        {provider.user?.firstName?.[0]}
                      </Avatar>

                      {/* Verified Badge & Name */}
                      <Stack direction="row" alignItems="center" gap={0.5}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', textAlign: 'center' }}>
                          {provider.user?.firstName} {provider.user?.lastName}
                        </Typography>
                        <CheckCircleIcon sx={{ color: '#4F46E5', fontSize: 16 }} />
                      </Stack>

                      {/* Ratings */}
                      <Stack direction="row" alignItems="center" gap={0.5} sx={{ mt: 0.5, mb: 1.5 }}>
                        <Rating
                          value={Number(provider.avgRating)}
                          readOnly
                          precision={0.1}
                          size="small"
                          emptyIcon={<StarIcon style={{ opacity: 0.4 }} fontSize="inherit" />}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '13px' }}>
                          {Number(provider.avgRating).toFixed(1)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({provider.totalReviews})
                        </Typography>
                      </Stack>

                      {/* Location & Experience */}
                      <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }}>
                        <Stack direction="row" alignItems="center" gap={0.4} sx={{ color: 'text.secondary' }}>
                          <LocationIcon sx={{ fontSize: 14 }} />
                          <Typography variant="caption" sx={{ fontWeight: 500 }}>{provider.city}</Typography>
                        </Stack>
                        {provider.experienceYears !== null && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            {provider.experienceYears} Years Exp.
                          </Typography>
                        )}
                      </Stack>

                      {/* Starting Price & Book Button */}
                      {provider.services && provider.services.length > 0 && (
                        <Box sx={{ mt: 'auto', width: '100%', borderTop: '1px solid', borderColor: 'divider', pt: 2, textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.2 }}>
                            Starting Price:
                          </Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#4F46E5', mb: 1.5 }}>
                            ${Number(provider.services[0].price).toFixed(2)}
                            {provider.services[0].priceType === 'HOURLY' ? '/hr' : ''}
                          </Typography>
                        </Box>
                      )}

                      <Button
                        variant="contained"
                        fullWidth
                        sx={{
                          py: 0.8,
                          textTransform: 'none',
                          fontWeight: 750,
                          borderRadius: '8px',
                          backgroundColor: '#4F46E5',
                          boxShadow: 'none',
                          fontSize: '13px',
                          '&:hover': { backgroundColor: '#3730A3' },
                        }}
                      >
                        Book Now
                      </Button>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* ==========================================
          4. WHY CHOOSE LOCALLINK (Light: pure white, Dark: body base)
          ========================================== */}
      <Box
        sx={{
          backgroundColor: (theme) => theme.palette.mode === 'light' ? '#FFFFFF' : 'background.default',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7.5 } }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 850, fontFamily: '"Outfit", sans-serif', color: 'text.primary', mb: 1.5 }}>
              Why Choose LocalLink?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '580px', mx: 'auto', fontWeight: 500 }}>
              We bridge the gap between clients and skilled professionals, ensuring stress-free services with guaranteed peace of mind.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              { icon: <ShieldIcon sx={{ fontSize: 28, color: '#4F46E5' }} />, title: 'Verified Professionals', desc: 'Every single expert goes through rigid identity, background, and license checks.' },
              { icon: <SpeedIcon sx={{ fontSize: 28, color: '#4F46E5' }} />, title: 'Fast Booking', desc: 'Choose a provider, pick a convenient time slot, and confirm within seconds.' },
              { icon: <PaymentIcon sx={{ fontSize: 28, color: '#4F46E5' }} />, title: 'Secure Payments', desc: 'Funds are securely escrowed and only released after your absolute satisfaction.' },
              { icon: <ReviewIcon sx={{ fontSize: 28, color: '#4F46E5' }} />, title: 'Trusted Reviews', desc: 'Read genuine ratings and verified text feedback left by other local customers.' },
              { icon: <NearbyIcon sx={{ fontSize: 28, color: '#4F46E5' }} />, title: 'Nearby Services', desc: 'Discover certified professionals operating right in your immediate neighborhood.' },
              { icon: <SupportIcon sx={{ fontSize: 28, color: '#4F46E5' }} />, title: '24x7 Customer Support', desc: 'Our dedicated customer success team is available round-the-clock to guide you.' },
            ].map((item, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Box
                  sx={{
                    p: 4,
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                    height: '100%',
                    transition: 'all 0.2s ease',
                    '&:hover': { borderColor: '#4F46E5', transform: 'translateY(-2px)' },
                  }}
                >
                  <Avatar sx={{ backgroundColor: 'rgba(79, 70, 229, 0.05)', mb: 2.5, width: 48, height: 48 }}>
                    {item.icon}
                  </Avatar>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', mb: 1.2 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, fontSize: '13px' }}>
                    {item.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ==========================================
          5. HOW IT WORKS SECTION (Light: soft indigo-blue F0F4FF, Dark: dark-slate 0B0F19)
          ========================================== */}
      <Box
        id="how-it-works-section"
        sx={{
          backgroundColor: (theme) => theme.palette.mode === 'light' ? '#F0F4FF' : '#0B0F19',
          py: { xs: 6, md: 10 },
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 8 } }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 850, fontFamily: '"Outfit", sans-serif', color: 'text.primary', mb: 1.5 }}>
              How LocalLink Works
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '500px', mx: 'auto', fontWeight: 500 }}>
              Book any local professional service in 3 simple steps
            </Typography>
          </Box>

          <Grid container spacing={4} sx={{ position: 'relative' }}>
            {[
              { num: '01', title: 'Search Service', desc: 'Enter keywords or click popular categories to discover matching local service experts.' },
              { num: '02', title: 'Choose Provider', desc: 'Filter experts by ratings, experience, starting prices, and user feedback.' },
              { num: '03', title: 'Book Service', desc: 'Securely confirm bookings and complete checkouts online in a few clicks.' },
            ].map((step, idx) => (
              <Grid item xs={12} md={4} key={idx} sx={{ position: 'relative' }}>
                <Box sx={{ textAlign: 'center', px: 2 }}>
                  {/* Step Number Circle */}
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      backgroundColor: 'background.paper',
                      color: '#4F46E5',
                      border: '2px solid #4F46E5',
                      fontWeight: 900,
                      fontSize: '18px',
                      mx: 'auto',
                      mb: 3,
                      boxShadow: '0 4px 10px rgba(79, 70, 229, 0.15)',
                    }}
                  >
                    {step.num}
                  </Avatar>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', mb: 1.5 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, fontSize: '13px', maxWidth: '280px', mx: 'auto' }}>
                    {step.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
