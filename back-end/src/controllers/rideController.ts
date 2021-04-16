const OngoingRide = require('../models/ongoingRide');
const RideRequest = require('../models/rideRequest');
const helpers1 = require('./helpers');
import Web3 from 'web3';

// this has to later be replaced by link to the test-net
const network_url = "HTTP://127.0.0.1:8545";

const web3 = new Web3(network_url);

const rideController1 = {
    // raiseRequest: async (req, res) => {
    //     let response = {
    //         success: false,
    //         error: ''
    //     }
    //     try {
    //         console.log(req.body);
    //         await web3.eth.getBalance(req.body.riderid, async (err, balance) => {
    //             console.log(web3.utils.fromWei(String(balance)));
    //             if (err) {
    //                 response["error"] = String(err);
    //             }
    //             else if (Number(web3.utils.fromWei(String(balance), 'ether')) <= (Number(req.body.costETH) + 0.002))
    //                 response["error"] = String("Insufficient Account Balance");

    //             else 
    //             if (req.body.distance / 1000 > 60 || req.body.duration / (60 * 60) > 3) {
    //                 response["error"] = String("Source and destination are too far apart");
    //             }
    //             else {
    //                 response.success = true;
    //                 let temp1 = req.body, temp = new Date();
    //                 temp1["request_creation"] = new Date();
    //                 temp1["request_expiration"] = new Date(temp.getTime() + 10 * 60000);
    //                 let rideRequst = new RideRequest(temp1);
    //                 await rideRequst.save();
    //             }
    //         })
    //     } catch (error) {
    //         response.success = false;
    //         response.error = error;
    //     }
    //     res.json(response);
    // },

    // just replace the following method with the one above
    raiseRequest: async (req, res) => {
        let response = {
            success: false,
            error: ''
        }
        try {
            console.log(req.body);
            response.success = true;
            let temp1 = req.body, temp = new Date();
            temp1["request_creation"] = new Date();
            temp1["request_expiration"] = new Date(temp.getTime() + 60 * 60000);
            let rideRequst = new RideRequest(temp1);
            await rideRequst.save();
        } catch (error) {
            response.success = false;
            response.error = error;
        }
        res.json(response);
    },
    checkRequestStatus: async (req, res) => {
        let response = {
            status: '',
            error: '',
            data: {},
        }
        try {
            console.log(req.params.riderid);
            // heres a simple description of the algorithm that is used to check the ride status
            // first check with the given riderid in the rideRequest collection
            // if exists return status ='pending'
            // else find in ongoingRides collection if a ride with the given ride id exists
            // if the result of above is true then retrun the entire document with the response

            // checking in the rideReqeust collection
            let check_rideRequest_collec_res = await RideRequest.find({ "riderid": req.params.riderid });
            console.log(check_rideRequest_collec_res);// type of this is array
            if (check_rideRequest_collec_res.length === 0) {
                let check_ongoingRide_collec_res = await OngoingRide.find({ "riderid": req.params.riderid });
                if (check_ongoingRide_collec_res.length > 0) {
                    response.status = 'accepted';
                    response.data = check_ongoingRide_collec_res;
                }
                else if (check_ongoingRide_collec_res.length === 0) {
                    response.status = 'expired';
                }
            }
            else if (check_rideRequest_collec_res.length > 0) {
                response.status = 'pending';
            }
        } catch (error) {
            response.status = '';
            response.error = error;
        }
        res.json(response);
    },
    getOptimumRideRequest: async (req, res) => {
        // console.log(req);
        let response = {
            success: false,
            message: '',
            error: '',
            data: {}
        }
        try {
            let allReq = await RideRequest.find({});
            let minDist = Number.MAX_SAFE_INTEGER, optimumRide = {};
            for (let i = 0; i < allReq.length; i++) {
                let temp = JSON.parse(allReq[i].source);
                let long = temp.result.geometry.coordinates[0], lat = temp.result.geometry.coordinates[1];
                // console.log(lat, long, req.body.lat, req.body.long);
                let dist = helpers1.getDistanceFromLatLonInKm(Number(req.body.lat), Number(req.body.long), Number(lat), Number(long));
                console.log(dist);
                if (dist < minDist) {
                    minDist = dist;
                    optimumRide = allReq[i];
                }
            }
            if (minDist === Number.MAX_SAFE_INTEGER) {
                response.success = true;
                response.message = 'no rides available at the moment';
            }
            else {
                response.success = true;
                response.message = 'ride found!!';
                response.data = optimumRide;
            }
        }
        catch (err) {
            response.success = false;
            response.error = err;
        }
        res.json(response);
    },

    acceptRide: async (req, res) => {
        let response = {
            success: false,
            message: '',
            error: '',
            data: {}
        }
        try {
            let checkRideResult = await RideRequest.find({ "riderid": req.body.riderid });
            if (checkRideResult.length > 0) {
                // this means ride has not been accepted by nany other driver
                await RideRequest.deleteOne({ "riderid": req.body.riderid });
                let newOngoingRide = new OngoingRide(req.body);
                await newOngoingRide.save();
                response.success = true;
                response.data = newOngoingRide;
                response.message = 'ride accepted successfully';
            }
            else {
                // this means that ride has been accepted by some other driver or ride request has expired
                response.success = true;
                response.message = 'ride acceptance failed maybe because some other driver accepted the ride, or ride request expired';
            }
        }
        catch (err) {
            response.success = false;
            response.error = err;
        }
        res.json(response);
    }
};
module.exports = rideController1;

