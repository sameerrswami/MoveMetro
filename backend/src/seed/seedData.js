require('dotenv').config();
const { connectDB, syncDB, getSequelize } = require('../config/db');
const { User, Stop, Route, RouteStop } = require('../models');
const GraphManager = require('../engine/GraphManager');

/**
 * Seed data for Delhi Metro (sample network)
 */

const stopsData = [
    // Blue Line
    { name: 'Dwarka Sector 21', code: 'DWRK21', latitude: 28.5523, longitude: 77.0583 },
    { name: 'Dwarka Sector 8', code: 'DWRK8', latitude: 28.5650, longitude: 77.0650 },
    { name: 'Dwarka', code: 'DWRK', latitude: 28.5921, longitude: 77.0205 },
    { name: 'Janakpuri West', code: 'JNKW', latitude: 28.6295, longitude: 77.0775 },
    { name: 'Rajouri Garden', code: 'RJGDN', latitude: 28.6393, longitude: 77.1218 },
    { name: 'Kirti Nagar', code: 'KRTNR', latitude: 28.6558, longitude: 77.1504 },
    { name: 'Rajiv Chowk', code: 'RJVCHK', latitude: 28.6330, longitude: 77.2190 }, // Interchange: Blue + Yellow
    { name: 'Mandi House', code: 'MNDHS', latitude: 28.6253, longitude: 77.2341 },
    { name: 'Barakhamba Road', code: 'BRKHMB', latitude: 28.6318, longitude: 77.2309 },
    { name: 'Pragati Maidan', code: 'PRGTM', latitude: 28.6200, longitude: 77.2435 },
    { name: 'Noida Sector 15', code: 'NDA15', latitude: 28.5878, longitude: 77.3118 },
    { name: 'Noida Sector 16', code: 'NDA16', latitude: 28.5800, longitude: 77.3195 },
    { name: 'Noida City Centre', code: 'NDACC', latitude: 28.5747, longitude: 77.3560 },

    // Yellow Line
    { name: 'Samaypur Badli', code: 'SMPBD', latitude: 28.7441, longitude: 77.1378 },
    { name: 'Vishwavidyalaya', code: 'VSHVD', latitude: 28.6946, longitude: 77.2140 },
    { name: 'Kashmere Gate', code: 'KSHGT', latitude: 28.6675, longitude: 77.2285 }, // Interchange: Yellow + Red
    { name: 'Chandni Chowk', code: 'CHDNC', latitude: 28.6578, longitude: 77.2307 },
    { name: 'New Delhi', code: 'NWDLH', latitude: 28.6430, longitude: 77.2223 },
    // RJVCHK already defined
    { name: 'Patel Chowk', code: 'PTLCHK', latitude: 28.6234, longitude: 77.2141 },
    { name: 'Central Secretariat', code: 'CNTSC', latitude: 28.6146, longitude: 77.2120 },
    { name: 'AIIMS', latitude: 28.5684, longitude: 77.2078, code: 'AIIMS' },
    { name: 'Hauz Khas', code: 'HZKHS', latitude: 28.5432, longitude: 77.2065 },
    { name: 'HUDA City Centre', code: 'HUDACC', latitude: 28.4593, longitude: 77.0725 },

    // Red Line
    { name: 'Shaheed Sthal', code: 'SHDSTH', latitude: 28.6811, longitude: 77.3484 },
    { name: 'Dilshad Garden', code: 'DLSHGD', latitude: 28.6759, longitude: 77.3216 },
    { name: 'Welcome', code: 'WLCM', latitude: 28.6719, longitude: 77.2778 },
    // KSHGT already defined
    { name: 'Tis Hazari', code: 'TSHZR', latitude: 28.6674, longitude: 77.2174 },
    { name: 'Inderlok', code: 'INDLK', latitude: 28.6732, longitude: 77.1685 },
    { name: 'Netaji Subhash Place', code: 'NTJSP', latitude: 28.6917, longitude: 77.1519 },
    { name: 'Rithala', code: 'RTHL', latitude: 28.7111, longitude: 77.1065 },
];


const routesData = [
    {
        name: 'Blue Line',
        color: '#0052A5',
        stopCodes: ['DWRK21', 'DWRK8', 'DWRK', 'JNKW', 'RJGDN', 'KRTNR', 'RJVCHK', 'BRKHMB', 'MNDHS', 'PRGTM', 'NDA15', 'NDA16', 'NDACC'],
        travelTimes: [3, 2, 4, 3, 2, 4, 2, 2, 3, 5, 2, 3],
    },
    {
        name: 'Yellow Line',
        color: '#FFCC00',
        stopCodes: ['SMPBD', 'VSHVD', 'KSHGT', 'CHDNC', 'NWDLH', 'RJVCHK', 'PTLCHK', 'CNTSC', 'AIIMS', 'HZKHS', 'HUDACC'],
        travelTimes: [4, 3, 2, 3, 3, 2, 2, 3, 4, 5],
    },
    {
        name: 'Red Line',
        color: '#E42313',
        stopCodes: ['SHDSTH', 'DLSHGD', 'WLCM', 'KSHGT', 'TSHZR', 'INDLK', 'NTJSP', 'RTHL'],
        travelTimes: [3, 4, 5, 2, 3, 3, 4],
    },
];

async function seed() {
    try {
        console.log('🌱 Connecting to PostgreSQL...');
        await connectDB();

        // Clear existing data and sync
        console.log('🗑️  Syncing database schema (force: true)...');
        await syncDB({ force: true });

        // Create stops
        console.log('📍 Creating stops...');
        const createdStops = {};
        for (const s of stopsData) {
            const stop = await Stop.create(s);
            createdStops[s.code] = stop;
        }
        console.log(`   ✅ ${Object.keys(createdStops).length} stops created`);

        // Create routes with route-stops
        console.log('🚇 Creating routes...');
        for (const r of routesData) {
            const route = await Route.create({ name: r.name, color: r.color });

            const routeStops = r.stopCodes.map((code, index) => ({
                route_id: route.id,
                stop_id: createdStops[code].id,
                stop_order: index,
                travel_time_to_next: r.travelTimes[index] || 0,
            }));

            await RouteStop.bulkCreate(routeStops);
            console.log(`   ✅ ${r.name}: ${r.stopCodes.length} stops`);
        }

        // Create admin user
        console.log('👤 Creating admin user...');
        await User.create({
            name: 'Admin',
            email: 'admin@movemetro.com',
            password_hash: 'admin123',
            role: 'ADMIN',
        });

        // Create test user
        await User.create({
            name: 'Test User',
            email: 'user@movemetro.com',
            password_hash: 'user123',
            role: 'USER',
        });

        console.log('   ✅ Admin: admin@movemetro.com / admin123');
        console.log('   ✅ User: user@movemetro.com / user123');

        // Build graph
        console.log('📊 Building graph...');
        GraphManager.resetInstance();
        const gm = GraphManager.getInstance();
        await gm.buildGraph();
        const stats = gm.getStats();
        console.log(`   ✅ Graph: ${stats.stops} stops, ${stats.edges} edges`);

        console.log('\n🎉 Seed completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
}

seed();
