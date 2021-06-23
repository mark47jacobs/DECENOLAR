import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { ContractManagerService } from '../contract-manager.service';
import { RideManagerService } from '../ride-manager.service';
import { environment } from '../../environments/environment';
import * as mapboxgl from 'mapbox-gl';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-ride',
  templateUrl: './ride.component.html',
  styleUrls: ['./ride.component.css']
})
export class RideComponent implements OnInit {

  map!: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/streets-v11';

  //Bangalore's long,lat
  lat = 12.9716;
  lng = 77.5946;

  curLocMarker: any;
  destMarker: any = null;
  distance: number = 0;

  timeInterval!: Subscription;
  message: String = 'Waiting for a driver near you to accept you ride!!';
  constructor(public contractManager: ContractManagerService,
    public rideManager: RideManagerService,
    private breakPointObserver: BreakpointObserver,
    private dialog: MatDialog,
    private http: HttpClient) { }

  ngOnInit(): void {
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

            // make a marker for each feature and add to the map
            this.curLocMarker = new mapboxgl.Marker(el).setLngLat([this.lng, this.lat]).addTo(this.map);
          }
        })
      }
      // Add map controls
      const geocoder1 = new MapboxGeocoder({
        accessToken: environment.mapbox.accessToken,
        marker: false,
        placeholder: this.contractManager.userData.isDriver ? 'Enter Your Current Location' : 'Enter the Source Location',
      });

      document.getElementById('geocoder1')!.appendChild(geocoder1.onAdd(this.map));
      geocoder1.on('result', (value) => {
        console.log('Source/Current Location Selected', value);
        this.rideManager.currentLocation = value;
        this.curLocMarker.setLngLat(this.rideManager.currentLocation.result.geometry.coordinates);
      });

      if (!this.contractManager.userData.isDriver) {

        const geocoder2 = new MapboxGeocoder({
          accessToken: environment.mapbox.accessToken,
          marker: false,
          placeholder: 'Enter the Destination',
        });
        document.getElementById('geocoder2')!.appendChild(geocoder2.onAdd(this.map));
        this.map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [], // Notice that initially there are no features
          },
        });
        this.map.addLayer({
          id: 'routeline-active',
          type: 'line',
          source: 'route',
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
        geocoder2.on('result', (value) => {
          console.log(' Destination Selected', value);
          this.rideManager.destination = value;
          if (!this.destMarker) {
            var el = document.createElement('div');
            el.className = 'marker';
            this.destMarker = new mapboxgl.Marker(el).setLngLat(this.rideManager.destination.result.geometry.coordinates).addTo(this.map);
          }
          else {
            this.destMarker.setLngLat(this.rideManager.destination.result.geometry.coordinates);
          }
          // the following code gets a new route to the destination every time the user changes the destination
          this.http.get('https://api.mapbox.com/optimized-trips/v1/mapbox/driving/' +
            this.rideManager.currentLocation.result.geometry.coordinates[0] + ',' + this.rideManager.currentLocation.result.geometry.coordinates[1] + ';' +
            this.rideManager.destination.result.geometry.coordinates[0] + ',' + this.rideManager.destination.result.geometry.coordinates[1] +
            '?overview=full&steps=true&geometries=geojson&roundtrip=false&source=first&destination=last&access_token=' + environment.mapbox.accessToken).subscribe((response: any) => {
              console.log(response);
              (this.map.getSource('route') as mapboxgl.GeoJSONSource).setData({
                type: "FeatureCollection",
                features: [
                  {
                    type: "Feature",
                    geometry: response.trips[0].geometry,
                    properties: {}
                  }
                ]
              })
              var coordinates = response.trips[0].geometry.coordinates;
              var bounds = coordinates.reduce(function (bounds: any, coord: any) {
                return bounds.extend(coord);
              }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

              this.map.fitBounds(bounds, {
                padding: 20
              });
              this.rideManager.path = response.trips[0].geometry;
              this.rideManager.distance = response.trips[0].distance;
              this.rideManager.duration = response.trips[0].duration;
              this.infoSet({
                message: 'info is set for the ride you mothafucker!!!'
              });
            });
        });
      }
    })
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
        this.timeInterval = interval(5000).pipe(
          startWith(0),
          switchMap(() => this.contractManager.checkRideRequestStatus())).subscribe((response: any) => {
            console.log(response);
            if (response.status === "accepted") {
              this.message = 'Your ride has been accepted';
              this.rideManager.ride_data = response.data[0];
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
