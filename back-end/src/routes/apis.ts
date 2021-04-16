const router = require('express').Router();
const rideController = require('../controllers/rideController');

router.post('/raiseRequest', rideController.raiseRequest);

router.get('/checkRequestStatus/:riderid', rideController.checkRequestStatus);

router.post('/getOptimumRideRequest', rideController.getOptimumRideRequest);

router.post('/acceptRide', rideController.acceptRide);

module.exports = router;