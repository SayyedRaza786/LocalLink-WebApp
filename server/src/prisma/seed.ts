// =============================================================================
// Database Seeding Script — Localized for Maharashtra (Mumbai, Nagpur, Jalgaon, Bhusawal)
// Seeds:
//   - An initial Admin user
//   - Main service categories
//   - Multiple Indian Customers
//   - Multiple Indian Providers (each with profile, services, availability, bookings, and reviews)
// =============================================================================

import { PrismaClient, Role, DayOfWeek, BookingStatus, PriceType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
  console.log('🌱 Starting localized database seeding for Maharashtra (Mumbai, Nagpur, Jalgaon, Bhusawal)...');

  // 1. Clean existing records in dependency order
  console.log('🗑️ Cleaning database...');
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.serviceImage.deleteMany();
  await prisma.service.deleteMany();
  await prisma.providerGallery.deleteMany();
  await prisma.providerProfile.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
  console.log('✅ Database cleaned.');

  // Common password for all seed accounts
  const passwordHash = await bcrypt.hash('Password123!', SALT_ROUNDS);

  // 2. Seed Admin User
  console.log('👤 Creating administrator account...');
  await prisma.user.create({
    data: {
      email: 'admin@locallink.com',
      passwordHash,
      role: Role.ADMIN,
      firstName: 'System',
      lastName: 'Admin',
      phone: '9999999999',
      isEmailVerified: true,
    },
  });
  console.log('✅ Admin account seeded.');

  // 3. Seed Service Categories
  console.log('📂 Seeding service categories...');
  const categoriesData = [
    {
      name: 'Home Repair',
      slug: 'home-repair',
      description: 'Plumbing, electrical work, carpentry, and general household maintenance.',
      icon: '🔧',
      sortOrder: 1,
    },
    {
      name: 'Cleaning Services',
      slug: 'cleaning',
      description: 'Full house deep cleaning, sanitization, and specialized dusting.',
      icon: '🧹',
      sortOrder: 2,
    },
    {
      name: 'Tutors & Education',
      slug: 'education',
      description: 'Private academic tutoring, language training, and skill development classes.',
      icon: '📚',
      sortOrder: 3,
    },
    {
      name: 'Beauty & Wellness',
      slug: 'beauty',
      description: 'Hair styling, massage therapies, makeup, and personalized grooming services.',
      icon: '💆‍♀️',
      sortOrder: 4,
    },
  ];

  const categoriesMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categoriesMap[cat.slug] = created.id;
  }
  console.log('✅ Categories seeded.');

  // 4. Seed Customers
  console.log('👥 Seeding customer accounts...');
  const customersData = [
    {
      email: 'rohan@locallink.com',
      firstName: 'Rohan',
      lastName: 'Sharma',
      phone: '9876543210',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    },
    {
      email: 'priya@locallink.com',
      firstName: 'Priya',
      lastName: 'Patel',
      phone: '9876543211',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    },
    {
      email: 'amit@locallink.com',
      firstName: 'Amit',
      lastName: 'Verma',
      phone: '9876543212',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop',
    },
    {
      email: 'ananya@locallink.com',
      firstName: 'Ananya',
      lastName: 'Iyer',
      phone: '9876543213',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    },
  ];

  const customers: any[] = [];
  for (const cust of customersData) {
    const user = await prisma.user.create({
      data: {
        ...cust,
        passwordHash,
        role: Role.CUSTOMER,
        isEmailVerified: true,
      },
    });
    customers.push(user);
  }
  console.log('✅ Customers seeded.');

  // 5. Seed Providers distributed across Mumbai, Nagpur, Jalgaon, Bhusawal
  console.log('🛠️ Seeding provider profiles across Mumbai, Nagpur, Jalgaon, and Bhusawal...');
  const providersData = [
    // --- MUMBAI ---
    {
      email: 'arjun@locallink.com',
      firstName: 'Arjun',
      lastName: 'Singh',
      phone: '9111222333',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
      profile: {
        bio: 'Licensed electrician and plumber with 8+ years of experience in residential towers and apartments. Expert in geyser setup, socket wiring, board replacements, and leak fixes.',
        experienceYears: 8,
        city: 'Mumbai',
        area: 'Andheri West',
        address: 'Veera Desai Road, Andheri West, Mumbai, Maharashtra 400053',
        latitude: 19.1363,
        longitude: 72.8293,
        serviceRadiusKm: 15,
        avgRating: 4.8,
        totalReviews: 2,
        totalBookings: 3,
        isAvailable: true,
        isVerified: true,
      },
      services: [
        {
          name: 'Geyser & Appliance Installation',
          description: 'Safe wall mounting, plumbing line inlet/outlet connect, and load check.',
          price: 499.0,
          priceType: PriceType.FIXED,
          durationMinutes: 90,
          categorySlug: 'home-repair',
        },
        {
          name: 'General Electrical Maintenance',
          description: 'Fixing short circuits, faulty switchboards, MCBs, and ceiling fans.',
          price: 250.0,
          priceType: PriceType.HOURLY,
          durationMinutes: 60,
          categorySlug: 'home-repair',
        },
      ],
      reviews: [
        { customerIdx: 0, rating: 5, comment: 'Arjun fixed my geyser in 45 mins. Very neat work!' },
        { customerIdx: 1, rating: 4, comment: 'Reliable electrical work, solved our balcony light fuse.' },
      ],
    },
    {
      email: 'sunita@locallink.com',
      firstName: 'Sunita',
      lastName: 'Sharma',
      phone: '9333444555',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
      profile: {
        bio: 'Professional house cleaner specializing in kitchen deep cleaning, chimney degreasing, bathroom descaling, and high dusting.',
        experienceYears: 5,
        city: 'Mumbai',
        area: 'Bandra West',
        address: 'Hill Road, Bandra West, Mumbai, Maharashtra 400050',
        latitude: 19.0544,
        longitude: 72.8402,
        serviceRadiusKm: 12,
        avgRating: 4.9,
        totalReviews: 2,
        totalBookings: 2,
        isAvailable: true,
        isVerified: true,
      },
      services: [
        {
          name: 'Kitchen Chimney & Deep Clean',
          description: 'Filters degreased, tile scrubbing, slab polish, and kitchen cabinet cleaning.',
          price: 1299.0,
          priceType: PriceType.FIXED,
          durationMinutes: 180,
          categorySlug: 'cleaning',
        },
      ],
      reviews: [
        { customerIdx: 2, rating: 5, comment: 'Our kitchen chimney has no grease left! Exceptional deep cleaning.' },
        { customerIdx: 3, rating: 4, comment: 'Punctual team and clean results. Fully satisfied.' },
      ],
    },

    // --- NAGPUR ---
    {
      email: 'rajesh@locallink.com',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      phone: '9222333444',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop',
      profile: {
        bio: 'Expert plumber specializing in bathroom line leaks, water pump setup, flush repairs, and copper pipe replacements.',
        experienceYears: 10,
        city: 'Nagpur',
        area: 'Dharampeth',
        address: 'West High Court Road, Dharampeth, Nagpur, Maharashtra 440010',
        latitude: 21.1415,
        longitude: 79.0628,
        serviceRadiusKm: 10,
        avgRating: 5.0,
        totalReviews: 1,
        totalBookings: 2,
        isAvailable: true,
        isVerified: true,
      },
      services: [
        {
          name: 'Bathroom Leak Repairs',
          description: 'Emergency pipe repair, tap change, and water pressure diagnostics.',
          price: 350.0,
          priceType: PriceType.HOURLY,
          durationMinutes: 60,
          categorySlug: 'home-repair',
        },
      ],
      reviews: [
        { customerIdx: 2, rating: 5, comment: 'Highly skilled plumber. Resolved our bathroom pipe leak quickly.' },
      ],
    },
    {
      email: 'deepak@locallink.com',
      firstName: 'Deepak',
      lastName: 'Gupta',
      phone: '9444555666',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop',
      profile: {
        bio: 'Professional upholstery and sofa vacuum cleaner. Deep dirt extraction using eco-friendly shampoo formulations.',
        experienceYears: 4,
        city: 'Nagpur',
        area: 'Ramdaspeth',
        address: 'Central Bazar Road, Ramdaspeth, Nagpur, Maharashtra 440010',
        latitude: 21.1352,
        longitude: 79.0744,
        serviceRadiusKm: 8,
        avgRating: 4.7,
        totalReviews: 1,
        totalBookings: 1,
        isAvailable: true,
        isVerified: false,
      },
      services: [
        {
          name: 'Sofa Wet Vacuum & Shampoo',
          description: 'Full fabric extraction, scrubbing, and dry vacuuming for a 5-seater sofa set.',
          price: 999.0,
          priceType: PriceType.FIXED,
          durationMinutes: 120,
          categorySlug: 'cleaning',
        },
      ],
      reviews: [
        { customerIdx: 0, rating: 5, comment: 'My sofa looks fresh and clean. Very neat extraction process.' },
      ],
    },

    // --- JALGAON ---
    {
      email: 'vikram@locallink.com',
      firstName: 'Vikram',
      lastName: 'Joshi',
      phone: '9555666777',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
      profile: {
        bio: 'M.Sc. Mathematics teacher. 12+ years preparing students for CBSE, ICSE boards and JEE foundation algebra courses.',
        experienceYears: 12,
        city: 'Jalgaon',
        area: 'Court Road',
        address: 'Jilha Peth, Court Road, Jalgaon, Maharashtra 425001',
        latitude: 21.0076,
        longitude: 75.5626,
        serviceRadiusKm: 15,
        avgRating: 5.0,
        totalReviews: 2,
        totalBookings: 2,
        isAvailable: true,
        isVerified: true,
      },
      services: [
        {
          name: 'Board Mathematics Tutoring',
          description: 'Personalized Math guidance for class 9-12 students. Board mock paper solving.',
          price: 500.0,
          priceType: PriceType.HOURLY,
          durationMinutes: 60,
          categorySlug: 'education',
        },
      ],
      reviews: [
        { customerIdx: 1, rating: 5, comment: 'Joshi sir makes algebra incredibly easy. Board exams went very well!' },
        { customerIdx: 3, rating: 5, comment: 'Patient, highly conceptual and clear math lessons.' },
      ],
    },
    {
      email: 'priyanka@locallink.com',
      firstName: 'Priyanka',
      lastName: 'Sen',
      phone: '9777888999',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
      profile: {
        bio: 'Salon at home stylist. Specializing in hd party makeup, custom hair trim designs, facial massage, and threading.',
        experienceYears: 7,
        city: 'Jalgaon',
        area: 'Ring Road',
        address: 'Ganpati Nagar, Ring Road, Jalgaon, Maharashtra 425001',
        latitude: 21.0112,
        longitude: 75.5532,
        serviceRadiusKm: 10,
        avgRating: 4.9,
        totalReviews: 2,
        totalBookings: 2,
        isAvailable: true,
        isVerified: true,
      },
      services: [
        {
          name: 'Bridal & Party Makeup',
          description: 'Full face makeup base, designer hair bun, and saree draping. Premium brands only.',
          price: 2999.0,
          priceType: PriceType.FIXED,
          durationMinutes: 120,
          categorySlug: 'beauty',
        },
      ],
      reviews: [
        { customerIdx: 1, rating: 5, comment: 'Did a wonderful engagement makeup look. Very satisfied!' },
        { customerIdx: 3, rating: 4, comment: 'Polite makeup artist, highly structured hair styling.' },
      ],
    },

    // --- BHUSAWAL ---
    {
      email: 'meera@locallink.com',
      firstName: 'Meera',
      lastName: 'Nair',
      phone: '9666777888',
      avatarUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop',
      profile: {
        bio: 'Hindustani vocal classical singer. Voice coaching, scales training, and learning classical ragas.',
        experienceYears: 8,
        city: 'Bhusawal',
        area: 'Jamner Road',
        address: 'Khadka Road, near Jamner Road, Bhusawal, Maharashtra 425201',
        latitude: 21.0478,
        longitude: 75.7925,
        serviceRadiusKm: 15,
        avgRating: 4.8,
        totalReviews: 1,
        totalBookings: 1,
        isAvailable: true,
        isVerified: true,
      },
      services: [
        {
          name: 'Vocal Music Coaching',
          description: 'Hindustani vocal pitch training, scale practice, and singing ragas.',
          price: 450.0,
          priceType: PriceType.HOURLY,
          durationMinutes: 60,
          categorySlug: 'education',
        },
      ],
      reviews: [
        { customerIdx: 0, rating: 5, comment: 'Meera did an excellent job introducing classical ragas to my kids.' },
      ],
    },
    {
      email: 'rahul@locallink.com',
      firstName: 'Rahul',
      lastName: 'Choudhury',
      phone: '9888999000',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop',
      profile: {
        bio: 'Certified physiotherapy and therapeutic body massage expert. Deep tissue release to address back pain and muscle stress.',
        experienceYears: 6,
        city: 'Bhusawal',
        area: 'Station Road',
        address: 'Near Railway Station, Station Road, Bhusawal, Maharashtra 425201',
        latitude: 21.0501,
        longitude: 75.7891,
        serviceRadiusKm: 8,
        avgRating: 5.0,
        totalReviews: 1,
        totalBookings: 1,
        isAvailable: true,
        isVerified: false,
      },
      services: [
        {
          name: 'Deep Tissue Body Massage',
          description: '60 minutes deep tissue massage for back pain relief and shoulder tension release.',
          price: 1499.0,
          priceType: PriceType.FIXED,
          durationMinutes: 60,
          categorySlug: 'beauty',
        },
      ],
      reviews: [
        { customerIdx: 2, rating: 5, comment: 'Perfect pressure and highly relaxing. Relieved my shoulder stiffness.' },
      ],
    },
  ];

  for (const prov of providersData) {
    // A. Create User
    const user = await prisma.user.create({
      data: {
        email: prov.email,
        passwordHash,
        role: Role.PROVIDER,
        firstName: prov.firstName,
        lastName: prov.lastName,
        phone: prov.phone,
        avatarUrl: prov.avatarUrl,
        isEmailVerified: true,
      },
    });

    // B. Create ProviderProfile
    const profile = await prisma.providerProfile.create({
      data: {
        userId: user.id,
        bio: prov.profile.bio,
        experienceYears: prov.profile.experienceYears,
        city: prov.profile.city,
        area: prov.profile.area,
        address: prov.profile.address,
        latitude: prov.profile.latitude,
        longitude: prov.profile.longitude,
        serviceRadiusKm: prov.profile.serviceRadiusKm,
        isVerified: prov.profile.isVerified,
        avgRating: prov.profile.avgRating,
        totalReviews: prov.profile.totalReviews,
        totalBookings: prov.profile.totalBookings,
        isAvailable: prov.profile.isAvailable,
      },
    });

    // C. Create Services
    const createdServices: any[] = [];
    for (const s of prov.services) {
      const service = await prisma.service.create({
        data: {
          providerId: profile.id,
          categoryId: categoriesMap[s.categorySlug],
          name: s.name,
          description: s.description,
          price: s.price,
          priceType: s.priceType,
          durationMinutes: s.durationMinutes,
          isActive: true,
        },
      });
      createdServices.push(service);
    }

    // D. Create Availability
    const days: DayOfWeek[] = [DayOfWeek.MON, DayOfWeek.TUE, DayOfWeek.WED, DayOfWeek.THU, DayOfWeek.FRI];
    for (const d of days) {
      await prisma.availability.create({
        data: {
          providerId: profile.id,
          dayOfWeek: d,
          startTime: new Date('1970-01-01T09:00:00Z'),
          endTime: new Date('1970-01-01T17:00:00Z'),
          isAvailable: true,
        },
      });
    }

    // E. Create Bookings and Reviews
    let bookingCounter = 1;
    for (const rev of prov.reviews) {
      const targetCustomer = customers[rev.customerIdx];
      const targetService = createdServices[0];

      const bookingNum = `LL-${prov.firstName.substring(0,3).toUpperCase()}-${bookingCounter.toString().padStart(4, '0')}`;
      const booking = await prisma.booking.create({
        data: {
          bookingNumber: bookingNum,
          customerId: targetCustomer.id,
          providerId: profile.id,
          serviceId: targetService.id,
          status: BookingStatus.COMPLETED,
          scheduledDate: new Date('2026-07-10'),
          scheduledTime: new Date('1970-01-01T14:00:00Z'),
          address: 'Main Road Cross, Sector 4, Metro Lane',
          notes: 'Regular maintenance request',
          quotedPrice: targetService.price,
          finalPrice: targetService.price,
          completedAt: new Date(),
        },
      });

      await prisma.review.create({
        data: {
          bookingId: booking.id,
          customerId: targetCustomer.id,
          providerId: profile.id,
          rating: rev.rating,
          comment: rev.comment,
        },
      });

      bookingCounter++;
    }

    // F. Create 1 pending booking request
    if (prov.profile.totalBookings > prov.reviews.length) {
      const pendingCustomer = customers[0]; // Rohan Sharma
      const targetService = createdServices[0];
      const bookingNum = `LL-${prov.firstName.substring(0,3).toUpperCase()}-9999`;
      await prisma.booking.create({
        data: {
          bookingNumber: bookingNum,
          customerId: pendingCustomer.id,
          providerId: profile.id,
          serviceId: targetService.id,
          status: BookingStatus.PENDING,
          scheduledDate: new Date('2026-07-20'),
          scheduledTime: new Date('1970-01-01T11:00:00Z'),
          address: 'Flat 405, B-Block Society Apartment',
          notes: 'Please call before arriving.',
          quotedPrice: targetService.price,
        },
      });
    }
  }

  console.log('✅ Provider accounts distributed across Mumbai, Nagpur, Jalgaon, and Bhusawal successfully seeded.');
  console.log('🌲 Seeding completed successfully! Login with password: "Password123!" for any seeded user.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
