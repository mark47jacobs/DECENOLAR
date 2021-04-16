import { environment } from '../../environments/environment';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { ContractManagerService } from '../contract-manager.service';
import { HttpClient } from '@angular/common/http';
import { RideManagerService } from '../ride-manager.service';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  map!: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/streets-v11';

  //Bangalore's long,lat
  lat = 12.9716;
  lng = 77.5946;

  curLocMarker: any;
  destMarker: any = null;
  distance: number = 0;

  // incase of drivers this has to be triggered when they select their current location
  // incase of riders this will go off when destination is set i.e the optimisation API has responded.
  @Output() infoSet = new EventEmitter();

  constructor(public contractManager: ContractManagerService,
    public rideManager: RideManagerService,
    private http: HttpClient) { }

  ngOnInit() {
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
              this.infoSet.emit({
                message: 'info is set for the ride you mothafucker!!!'
              });
            });
        });
      }
    })
  }
}
