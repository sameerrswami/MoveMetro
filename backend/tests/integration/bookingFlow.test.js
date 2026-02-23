const request = require('supertest');
const app = require('../../src/app');
const { initDatabase, closeDB } = require('../../src/config/db');
const { User, Stop, Route, RouteStop } = require('../../src/models');
const GraphManager = require('../../src/engine/GraphManager');

let adminToken;
let userToken;
let stops = {};

beforeAll(async () => {
    // initDatabase() in test mode uses SQLite in-memory as per src/config/db.js
    const sequelize = initDatabase();
    await sequelize.sync({ force: true });

    // Create admin user
    const admin = await User.create({
        name: 'Admin',
        email: 'admin@test.com',
        password_hash: 'admin123',
        role: 'ADMIN',
    });

    // Create regular user
    const user = await User.create({
        name: 'User',
        email: 'user@test.com',
        password_hash: 'user123',
        role: 'USER',
    });

    // Login admin
    const adminLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@test.com', password: 'admin123' });
    adminToken = adminLogin.body.data.accessToken;

    // Login user
    const userLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'user@test.com', password: 'user123' });
    userToken = userLogin.body.data.accessToken;

    // Create stops
    const stopNames = [
        { name: 'Stop A', code: 'STOPA' },
        { name: 'Stop B', code: 'STOPB' },
        { name: 'Stop C', code: 'STOPC' },
        { name: 'Stop D', code: 'STOPD' },
    ];

    for (const s of stopNames) {
        const stop = await Stop.create(s);
        stops[s.code] = stop;
    }

    // Create route: A -> B -> C (Route1)
    const route1 = await Route.create({ name: 'Route 1', color: '#FF0000' });
    await RouteStop.bulkCreate([
        { route_id: route1.id, stop_id: stops.STOPA.id, stop_order: 0, travel_time_to_next: 3 },
        { route_id: route1.id, stop_id: stops.STOPB.id, stop_order: 1, travel_time_to_next: 4 },
        { route_id: route1.id, stop_id: stops.STOPC.id, stop_order: 2, travel_time_to_next: 0 },
    ]);

    // Create route: B -> D (Route2) - interchange at B
    const route2 = await Route.create({ name: 'Route 2', color: '#00FF00' });
    await RouteStop.bulkCreate([
        { route_id: route2.id, stop_id: stops.STOPB.id, stop_order: 0, travel_time_to_next: 5 },
        { route_id: route2.id, stop_id: stops.STOPD.id, stop_order: 1, travel_time_to_next: 0 },
    ]);

    // Build graph
    GraphManager.resetInstance();
    const gm = GraphManager.getInstance();
    await gm.buildGraph();
}, 60000);

afterAll(async () => {
    await closeDB();
});

describe('Full Booking Flow Integration Tests', () => {
    test('should register a new user', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({ name: 'New User', email: 'new@test.com', password: 'newuser123' });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.accessToken).toBeTruthy();
    });

    test('should reject duplicate registration', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({ name: 'Admin', email: 'admin@test.com', password: 'admin123' });

        expect(res.status).toBe(409);
    });

    test('should preview route between stops', async () => {
        const res = await request(app)
            .get('/api/v1/routes/preview?source=STOPA&destination=STOPC&mode=OPTIMAL')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.totalTravelTime).toBe(7); // 3 + 4
        expect(res.body.data.totalTransfers).toBe(0);
    });

    test('should preview route with interchange', async () => {
        const res = await request(app)
            .get('/api/v1/routes/preview?source=STOPA&destination=STOPD&mode=OPTIMAL')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.totalTransfers).toBeGreaterThanOrEqual(1); // Transfer at B
    });

    test('should create a booking', async () => {
        const res = await request(app)
            .post('/api/v1/bookings')
            .set('Authorization', `Bearer ${userToken}`)
            .set('x-idempotency-key', 'test-booking-001')
            .send({
                sourceStopId: stops.STOPA.id,
                destinationStopId: stops.STOPC.id,
                mode: 'OPTIMAL',
            });

        expect(res.status).toBe(201);
        expect(res.body.data.qr_string).toBeTruthy();
        expect(res.body.data.total_travel_time).toBe(7);
        expect(res.body.data.status).toBe('ACTIVE');
    });

    test('should prevent duplicate booking (idempotency)', async () => {
        // First one already created in previous test
        const res = await request(app)
            .post('/api/v1/bookings')
            .set('Authorization', `Bearer ${userToken}`)
            .set('x-idempotency-key', 'test-booking-001')
            .send({
                sourceStopId: stops.STOPA.id,
                destinationStopId: stops.STOPC.id,
            });

        // In my service logic for idempotency, I return the existing booking (201 or 200) instead of error if it matches
        // Actually, my service code says: return existing; 
        expect(res.status).toBe(201);
    });

    test('should prevent same-stop booking', async () => {
        const res = await request(app)
            .post('/api/v1/bookings')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                sourceStopId: stops.STOPA.id,
                destinationStopId: stops.STOPA.id,
            });

        expect(res.status).toBe(400);
    });

    test('should get user bookings', async () => {
        const res = await request(app)
            .get('/api/v1/bookings/my')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.bookings.length).toBeGreaterThanOrEqual(1);
    });

    test('should reject unauthenticated request', async () => {
        const res = await request(app).post('/api/v1/bookings').send({
            sourceStopId: stops.STOPA.id,
            destinationStopId: stops.STOPC.id,
        });

        expect(res.status).toBe(401);
    });

    test('should prevent non-admin from creating stops', async () => {
        const res = await request(app)
            .post('/api/v1/admin/stops')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ name: 'Test Stop', code: 'TST' });

        expect(res.status).toBe(403);
    });

    test('admin can create stops', async () => {
        const res = await request(app)
            .post('/api/v1/admin/stops')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'New Stop', code: 'NWSTP' });

        expect(res.status).toBe(201);
    });

    test('health endpoint returns healthy', async () => {
        const res = await request(app).get('/api/v1/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBeDefined();
    });
});
