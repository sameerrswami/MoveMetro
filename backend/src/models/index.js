const User = require('./User');
const Stop = require('./Stop');
const Route = require('./Route');
const RouteStop = require('./RouteStop');
const Booking = require('./Booking');
const { getSequelize } = require('../config/db');

const sequelize = getSequelize();

const Wallet = require('./Wallet');
const Transaction = require('./Transaction');

// User <-> Booking
User.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User <-> Wallet
User.hasOne(Wallet, { foreignKey: 'user_id', as: 'wallet' });
Wallet.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Wallet <-> Transaction
Wallet.hasMany(Transaction, { foreignKey: 'wallet_id', as: 'transactions' });
Transaction.belongsTo(Wallet, { foreignKey: 'wallet_id', as: 'wallet' });

// User <-> Transaction
User.hasMany(Transaction, { foreignKey: 'user_id', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });


// Stop <-> Booking (Source)
Stop.hasMany(Booking, { foreignKey: 'source_stop_id', as: 'sourceBookings' });
Booking.belongsTo(Stop, { foreignKey: 'source_stop_id', as: 'sourceStop' });

// Stop <-> Booking (Destination)
Stop.hasMany(Booking, { foreignKey: 'destination_stop_id', as: 'destinationBookings' });
Booking.belongsTo(Stop, { foreignKey: 'destination_stop_id', as: 'destinationStop' });

// Route <-> RouteStop
Route.hasMany(RouteStop, { foreignKey: 'route_id', as: 'routeStops' });
RouteStop.belongsTo(Route, { foreignKey: 'route_id', as: 'route' });

// Stop <-> RouteStop
Stop.hasMany(RouteStop, { foreignKey: 'stop_id', as: 'stopRoutes' });
RouteStop.belongsTo(Stop, { foreignKey: 'stop_id', as: 'stop' });

module.exports = {
    User,
    Stop,
    Route,
    RouteStop,
    Booking,
    Wallet,
    Transaction,
    sequelize,
};


