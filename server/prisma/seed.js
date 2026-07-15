"use strict";
// =============================================================================
// Database Seeding Script
// Seeds:
//   - An initial Admin user
//   - Main service categories
// =============================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const SALT_ROUNDS = 12;
async function main() {
    console.log('🌱 Starting database seeding...');
    // 1. Seed Admin User
    const adminEmail = 'admin@locallink.com';
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });
    if (!existingAdmin) {
        console.log('👤 Creating administrator account...');
        const passwordHash = await bcryptjs_1.default.hash('adminSecurePassword123', SALT_ROUNDS);
        await prisma.user.create({
            data: {
                email: adminEmail,
                passwordHash,
                role: 'ADMIN',
                firstName: 'System',
                lastName: 'Admin',
                phone: '1234567890',
                isEmailVerified: true,
            },
        });
        console.log('✅ Administrator account created successfully.');
    }
    else {
        console.log('👤 Administrator account already exists.');
    }
    // 2. Seed Service Categories
    const categories = [
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
    console.log('📂 Seeding service categories...');
    for (const cat of categories) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {
                name: cat.name,
                description: cat.description,
                icon: cat.icon,
                sortOrder: cat.sortOrder,
            },
            create: cat,
        });
    }
    console.log('✅ Service categories seeded successfully.');
    console.log('🌲 Seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Seeding failed with error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map