import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RideManagerService {

  constructor() { }
  currentLocation: any;
  destination: any;
  path: any;
  distance: any;
  duration: any;
  rideDetailsSet: boolean = false;
  costINR: any = null;
  costETH: any = null;
  rideRequestSuccessfull: boolean = false;

  ride_data: any = null;




  // below are all details related to driver. These are prefixed with _driver_
  _driver_currentLocation: any = null;

  _driver_fetchedOptimalRideData: any = null;
  _driver_driverMessage: any = null;

  _driver_pathToPickupPoint: any = null;
  _driver_distanceToPickupPoint: any = null;
  _driver_durationToPickupPoint: any = null;

  _driver_ongoingRideData: any = null;
}
