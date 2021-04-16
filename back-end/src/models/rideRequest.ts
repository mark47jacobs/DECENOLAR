const mongoose2 = require('mongoose');
const RideRequestSchema = new mongoose2.Schema({
    riderid: {
        type: String
    },
    riderRating: {
        type: Number,
        default: 5
    },
    source: {
        type: String,
    },
    destination: {
        type: String,
    },
    path: {
        type: String,
    },
    distance: {
        type: Number
    },
    duration: {
        type: Number,
    },
    costINR: {
        type: Number
    },
    costETH: {
        type: Number,
    },
    request_creation: {
        type: Date,
        default: Date.now()
    },
    request_expiration: {
        type: Date,
        defalut: Date.now(),
    }
});

module.exports = mongoose2.model('RideRequest', RideRequestSchema);