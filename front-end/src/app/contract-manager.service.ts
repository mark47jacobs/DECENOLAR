import { Injectable, Inject } from '@angular/core';
import { NgsRevealConfig } from 'ngx-scrollreveal';
import { BehaviorSubject, Observable } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import Web3 from 'web3';

import *  as DecenOLAR from '../assets/abis/DecenOLAR.json';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NewUserDialogComponent } from './new-user-dialog/new-user-dialog.component';
import { RideManagerService } from './ride-manager.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContractManagerService {
  private window: any;
  DecenOLAR: any = (DecenOLAR as any).default;
  account: any;
  decenolar: any;

  existing_user = new BehaviorSubject<boolean>(false);
  $existing_user: Observable<boolean> = this.existing_user.asObservable();

  userData: any = null;

  RESOLUTION = 10000000000;

  constructor(public srconfig1: NgsRevealConfig,
    public rideManager: RideManagerService,
    public http: HttpClient,
    @Inject(DOCUMENT) private document: Document,) {

    srconfig1.duration = 2500;
    srconfig1.distance = '280px';
    srconfig1.easing = 'cubic-bezier(0.5, -0.01, 0, 1.005)',
      srconfig1.origin = 'bottom';
    srconfig1.interval = 1050;
    srconfig1.scale = 0.4;

    this.window = this.document.defaultView;

  }
  async loadWeb3() {
    if (this.window.ethereum) {
      this.window.web3 = new Web3(this.window.ethereum)
      await this.window.ethereum.enable()
    }
    else if (this.window.web3) {
      this.window.web3 = new Web3(this.window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }
  async loadBlockchainData() {
    const web3 = this.window.web3;
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.account = accounts[0];
    console.log(this.account);
    // Network ID
    const networkId = await web3.eth.net.getId()
    const networkData = this.DecenOLAR.networks[networkId]
    if (networkData) {
      this.decenolar = new web3.eth.Contract(this.DecenOLAR.abi, networkData.address);
      this.checkUser();

      var self = this;
      this.window.ethereum.on('accountsChanged', function (accounts: any) {
        console.log('Metamask account changed');
        self.account = accounts[0];
        self.userData = null;
        setTimeout(() => {
          self.checkUser();
        }, 500);
        self.window.location.reload();
      })
    } else {
      window.alert('DecenOLAR contract not deployed to detected network.');
    }
  }
  checkUser() {
    this.decenolar.methods.checkUser().call({ from: this.account }).then((result: any) => {
      console.log('Result of checking current user account', result);
      if (result) {
        this.existing_user.next(true);
        this.getUser();
      }
      else {
        this.existing_user.next(false);
      }
    });
  }
  getCalculatedCost() {
    this.decenolar.methods.getCalculatedCost(this.rideManager.distance * this.RESOLUTION / 1000).call({ from: this.account }).then((result: any) => {
      console.log('Result of cost calculation', result);
      this.rideManager.costINR = result / this.RESOLUTION;
      this.http.get('http://api.coinlayer.com/live?access_key=ae1de4e0e684e8058dfedc31b0c3e9b3&target=INR&symbols=ETH').subscribe((response: any) => {
        this.rideManager.costETH = this.rideManager.costINR / response.rates.ETH;
      });
    });
  }

  getUser() {
    this.decenolar.methods.getUser().call({ from: this.account }).then((return_value: any) => {
      console.log(return_value[0], return_value[1], return_value[2], return_value[3], return_value[4]);
      this.userData = {
        userid: return_value[0],
        rating: return_value[1],
        isDriver: return_value[2],
        driving_license_number: return_value[3],
        number_rides: return_value[4]
      };
      console.log('Fetched user details from contract', this.userData);
    });
  }
  addUser(_isDriver: boolean, _driver_license_number: string) {
    this.decenolar.methods.addUser(_isDriver, _driver_license_number).send({ from: this.account }).on('transactionHash', (result: any) => {
      console.log(result);
      // this.getUser();
      // this.existing_user.next(true);
      this.window.location.reload();
    });
  }
  getFakeName() {
    let temp = this.account.replace(/[^a-z]/gi, '');
    if (temp.length > 10)
      return temp.substr(2, 11);
    else
      return temp;
  }
  raiseRideRequest() {
    let rideInfo = {
      "riderid": String(this.account),
      "riderRating": Number(this.userData.rating),
      "source": JSON.stringify(this.rideManager.currentLocation),
      "destination": JSON.stringify(this.rideManager.destination),
      "path": JSON.stringify(this.rideManager.path),
      "distance": Number(this.rideManager.distance),
      "duration": Number(this.rideManager.duration),
      "costINR": Number(this.rideManager.costINR),
      "costETH": Number(this.rideManager.costETH)
    }
    return this.http.post(environment.backend.url + '/raiseRequest', rideInfo);
  }

  checkRideRequestStatus() {
    return this.http.get(environment.backend.url + '/checkRequestStatus/' + this.account);
  }


  getOptimalRide() {
    let temp = {
      driverid: this.account,
      lat: this.rideManager._driver_currentLocation.result.geometry.coordinates[1],
      long: this.rideManager._driver_currentLocation.result.geometry.coordinates[0],
    }
    return this.http.post(environment.backend.url + '/getOptimumRideRequest', temp);
  }

  acceptRide() {
    let temp = {
      riderid: String(this.rideManager._driver_fetchedOptimalRideData.riderid),
      driverid: String(this.account),
      riderRating: Number(this.rideManager._driver_fetchedOptimalRideData.riderRating),
      driverRating: Number(this.userData.rating),
      // driver travles the path from driverLocation to source along driverPath route, 
      // in duratiobn time to reach the source for pickup
      driverLocation: JSON.stringify(this.rideManager._driver_currentLocation),
      driverPath: JSON.stringify(this.rideManager._driver_pathToPickupPoint),
      driverDuration: Number(this.rideManager._driver_durationToPickupPoint),
      driverDistance: Number(this.rideManager._driver_distanceToPickupPoint),
      source: JSON.stringify(this.rideManager._driver_fetchedOptimalRideData.source),
      destination: JSON.stringify(this.rideManager._driver_fetchedOptimalRideData.destination),
      path: JSON.stringify(this.rideManager._driver_fetchedOptimalRideData.path),
      distance: Number(this.rideManager._driver_fetchedOptimalRideData.distance),
      duration: Number(this.rideManager._driver_fetchedOptimalRideData.duration),
      costINR: Number(this.rideManager._driver_fetchedOptimalRideData.costINR),
      costETH: Number(this.rideManager._driver_fetchedOptimalRideData.costETH),
      ride_completion_conf_rider: false,
      ride_completion_conf_driver: false,
      ride_status: 'driver headed to pickup point',
    }
    return this.http.post(environment.backend.url + '/acceptRide', temp);
  }


  parseRideData(data: any) {
    console.log(typeof (data));
    if (data.hasOwnProperty('source'))
      data.source = JSON.parse(data.source);
    if (data.hasOwnProperty('destination'))
      data.destination = JSON.parse(data.destination);
    if (data.hasOwnProperty('path'))
      data.path = JSON.parse(data.path);
    if (data.hasOwnProperty('driverLocation'))
      data.driverLocation = JSON.parse(data.driverLocation);
    if (data.hasOwnProperty('driverPath'))
      data.driverPath = JSON.parse(data.driverPath);
    return data;
  }
}
