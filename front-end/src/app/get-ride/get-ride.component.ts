import { Component, OnInit } from '@angular/core';
import { ContractManagerService } from '../contract-manager.service';
import { RideManagerService } from '../ride-manager.service';
import * as mapboxgl from 'mapbox-gl';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { environment } from 'src/environments/environment';
import { interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-get-ride',
  templateUrl: './get-ride.component.html',
  styleUrls: ['./get-ride.component.css']
})
export class GetRideComponent implements OnInit {
  map!: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/streets-v11';

  //Bangalore's long,lat
  lat = 12.9716;
  lng = 77.5946;

  curLocMarker: any = null;
  pickupMarker: any = null;
  dropOffMarker: any = null;

  constructor(
    public contractManager: ContractManagerService,
    public rideManager: RideManagerService) { }

  ngOnInit(): void {
    //map shown to the driver.
    this.map = new mapboxgl.Map({
      accessToken: environment.mapbox.accessToken,
      container: 'map',
      style: this.style,
      zoom: 13,
      center: [this.lng, this.lat],
      scrollZoom: true,
    });

    this.map.on('load', () => {
      this.map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position: any) => {
          if (position) {
            this.lat = position.coords.latitude;
            this.lng = position.coords.longitude;
            console.log(position);
            this.map.flyTo({
              center: [this.lng, this.lat],
              essential: true
            });
            var el = document.createElement('div');
            el.className = 'marker';
            // make a marker for drivers current loaction and add to the map
            this.curLocMarker = new mapboxgl.Marker(el).setLngLat([this.lng, this.lat]).addTo(this.map);
          }
        })
      }

      // Add geocoder for allowing drivers to enter currentLocation.
      const geocoder = new MapboxGeocoder({
        accessToken: environment.mapbox.accessToken,
        marker: false,
        placeholder: 'Enter Your Current Location'
      });

      document.getElementById('geocoder')!.appendChild(geocoder.onAdd(this.map));

      // adding path between pickup and dropoff
      this.map.addSource('ride_path', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [], // Notice that initially there are no features
        },
      });
      this.map.addLayer({
        id: 'routeline1-active',
        type: 'line',
        source: 'ride_path',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3887be',
          'line-width': [
            "interpolate",
            ["linear"],
            ["zoom"],
            12, 3,
            22, 12
          ]
        }
      }, 'waterway-label');
      // adding path to pickup point
      this.map.addSource('pickup_path', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [], // Notice that initially there are no features
        },
      });
      this.map.addLayer({
        id: 'routeline2-active',
        type: 'line',
        source: 'pickup_path',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3887be',
          'line-width': [
            "interpolate",
            ["linear"],
            ["zoom"],
            12, 3,
            22, 12
          ]
        }
      }, 'waterway-label');

      geocoder.on('result', (value) => {
        console.log('Current Location Selected By Driver', value);
        this.rideManager._driver_currentLocation = value;
        if (!this.curLocMarker) {
          var el = document.createElement('div');
          el.className = 'marker';
          this.curLocMarker = new mapboxgl.Marker(el).setLngLat(this.rideManager._driver_currentLocation.result.geometry.coordinates).addTo(this.map).setPopup(
            new mapboxgl.Popup().setText('Your Location').addTo(this.map)
          );
        }
        else
          this.curLocMarker.setLngLat(this.rideManager._driver_currentLocation.result.geometry.coordinates).setPopup(
            new mapboxgl.Popup().setText('Your Location').addTo(this.map)
          );

        // now remove the geocoder input and show message 'fetching optimal ride based on your location';
        this.rideManager._driver_driverMessage = 'Fetching optimal ride based on your location...';
        this.contractManager.getOptimalRide().subscribe((response: any) => {
          console.log('fetched optimal ride', response);
          if (response.success) {
            if (response.message === "ride found!!") {
              // ride found successfully
              this.rideManager._driver_driverMessage = response.message;
              this.rideManager._driver_fetchedOptimalRideData = this.contractManager.parseRideData(response.data);

              var el1 = document.createElement('div'); el1.className = 'marker';
              var el2 = document.createElement('div'); el2.className = 'marker';
              this.pickupMarker = new mapboxgl.Marker(el1).setLngLat(this.rideManager._driver_fetchedOptimalRideData.source.result.geometry.coordinates).addTo(this.map).setPopup(
                new mapboxgl.Popup().setText('Pickup Point').addTo(this.map)
              );
              this.dropOffMarker = new mapboxgl.Marker(el2).setLngLat(this.rideManager._driver_fetchedOptimalRideData.destination.result.geometry.coordinates).addTo(this.map).setPopup(
                new mapboxgl.Popup().setText('Drop-Off').addTo(this.map)
              );
              (this.map.getSource('ride_path') as mapboxgl.GeoJSONSource).setData({
                type: "FeatureCollection",
                features: [
                  {
                    type: "Feature",
                    geometry: this.rideManager._driver_fetchedOptimalRideData.path,
                    properties: {}
                  }
                ]
              })
            }
            else {
              // when fecthing ride details fails due to unavailability of rides, show below message for 8 seconds and then show geocoder again.
              this.rideManager._driver_driverMessage = response.message;
              setTimeout(() => {
                this.rideManager._driver_driverMessage = null;
              }, 8000);
            }
          }
          else {
            // when fecthing ride details fails for some reason, show below message for 8 seconds and then show geocoder again.
            this.rideManager._driver_driverMessage = "fetching optimal ride failed!! Please enter new location";
            setTimeout(() => {
              this.rideManager._driver_driverMessage = null;
            }, 8000);
          }
        });
      });
    });
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
  acceptRide() {
    console.log('ride accepted');
    this.contractManager.acceptRide().subscribe((response: any) => {
      if (response.success) {
        if (response.message === "ride accepted successfully") {
          this.rideManager._driver_driverMessage = response.message + "!! Please head over to the pickup point";
          this.rideManager._driver_ongoingRideData = this.contractManager.parseRideData(response.data);
          this.startPollingForRideFinishConfirmation();
          // add markers and path data to the map.
        }
        else {
          this.rideManager._driver_driverMessage = response.message;
          setTimeout(() => {
            this.rideManager._driver_driverMessage = null;
          }, 8000);
        }
      }
      else {
        this.rideManager._driver_driverMessage = "Some unknown error occurred, Please try after sometime...";
        setTimeout(() => {
          this.rideManager._driver_driverMessage = null;
        }, 8000);
      }
    })
  }
  timeInterval: any;

  startPollingForRideFinishConfirmation() {
    this.timeInterval = interval(5000).pipe(
      startWith(0),
      switchMap(() => this.contractManager.checkRideStatusAndCompleteDriver())).subscribe((response: any) => {
        console.log(response);
        if (response.success) {
          this.rideManager._driver_driverMessage = 'Ride has been completed and payment done!';
          this.contractManager.snackBar.open('Ride has been completed and payment done!', 'OKAY', {
            duration: 8000
          })
          history.back();
          console.log(this.rideManager.ride_data);
          this.timeInterval.unsubscribe();
        }
        else {
          this.rideManager._driver_driverMessage = "Please drop-off the passenger/s to their respective";
          this.rideManager.rideRequestSuccessfull = false;
        }
      })
  }
}
