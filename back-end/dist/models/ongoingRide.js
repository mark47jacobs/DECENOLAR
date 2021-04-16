const mongoose1 = require('mongoose');
const OngoingRideSchema = new mongoose1.Schema({
    riderid: {
        type: String,
    },
    driverid: {
        type: String,
    },
    riderRating: {
        type: Number,
        default: 5
    },
    driverRating: {
        type: Number,
    },
    // driver travles the path from driverLocation to source along driverPath route, 
    // in duratiobn time to reach the source for pickup
    driverLocation: {
        type: String,
    },
    driverPath: {
        type: String,
    },
    driverDuration: {
        type: Number,
    },
    driverDistance: {
        type: Number
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
    request_accepted: {
        type: Date,
        default: Date.now()
    },
    ride_completion_conf_rider: {
        type: Boolean,
        default: false
    },
    ride_completion_conf_driver: {
        type: Boolean,
        default: false
    },
    ride_status: {
        type: String,
    }
});
module.exports = mongoose1.model('OngoingRide', OngoingRideSchema);
//# sourceMappingURL=ongoingRide.js.map