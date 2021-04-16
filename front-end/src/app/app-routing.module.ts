import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GetRideComponent } from './get-ride/get-ride.component';
import { IllustrationComponent } from './illustration/illustration.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { MapComponent } from './map/map.component';
import { RideComponent } from './ride/ride.component';

const routes: Routes = [
  { path: 'illustration', component: IllustrationComponent },
  { path: 'ride', component: RideComponent },
  { path: 'get-ride', component: GetRideComponent },
  { path: 'map', component: MapComponent },
  { path: "", component: LandingPageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
