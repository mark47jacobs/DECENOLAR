import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { ContractManagerService } from '../contract-manager.service';
import { RideManagerService } from '../ride-manager.service';

@Component({
  selector: 'app-ride',
  templateUrl: './ride.component.html',
  styleUrls: ['./ride.component.css']
})
export class RideComponent implements OnInit {

  timeInterval!: Subscription;
  message: String = 'Waiting for a driver near you to accept you ride!!';
  constructor(public contractManager: ContractManagerService,
    public rideManager: RideManagerService,
    private breakPointObserver: BreakpointObserver,
    private dialog: MatDialog,) { }

  ngOnInit(): void {

  }
  infoSet(event: any) {
    this.rideManager.rideDetailsSet = true;
    console.log(event.message);
    this.contractManager.getCalculatedCost();
  }
  secondsToHms(d: any) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return hDisplay + mDisplay + sDisplay;
  }
  cancel() {
    this.rideManager.rideDetailsSet = false;
  }
  confirmRide() {
    this.contractManager.raiseRideRequest().subscribe((response: any) => {
      if (response.success) {
        console.log(response);
        this.rideManager.rideRequestSuccessfull = true;
        this.timeInterval = interval(30000).pipe(
          startWith(0),
          switchMap(() => this.contractManager.checkRideRequestStatus())).subscribe((response: any) => {
            console.log(response);
            if (response.status === "accepted") {
              this.message = 'Your ride has been accepted';
              this.rideManager.ride_data = response.data;
              console.log(this.rideManager.ride_data);
            }
            else if (response.status === "expired") {
              this.message = "Your ride request has expired please create a new one";
              this.rideManager.rideRequestSuccessfull = false;
            }
            if (response.status === "accepted" || response.status === "expired")
              this.timeInterval.unsubscribe();
          })
      }
    });

  }
}
