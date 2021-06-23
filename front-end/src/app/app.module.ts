import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IllustrationComponent } from './illustration/illustration.component';
import { NgsRevealModule } from 'ngx-scrollreveal';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from "@angular/material/dialog";
import { MatSidenavModule } from '@angular/material/sidenav';
import { NewUserDialogComponent } from './new-user-dialog/new-user-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxJdenticonModule, JDENTICON_CONFIG } from 'ngx-jdenticon';
import { MapComponent } from './map/map.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { RideComponent } from './ride/ride.component';
import { GetRideComponent } from './get-ride/get-ride.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
@NgModule({
  declarations: [
    AppComponent,
    IllustrationComponent,
    NewUserDialogComponent,
    MapComponent,
    LandingPageComponent,
    RideComponent,
    GetRideComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgsRevealModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatSidenavModule,
    FormsModule,
    ReactiveFormsModule,
    NgxJdenticonModule,
    HttpClientModule,
    MatSnackBarModule
  ],
  providers: [
    {
      provide: JDENTICON_CONFIG,
      useValue: {
        lightness: {
          color: [0.26, 0.53],
          grayscale: [0.71, 0.90]
        },
        saturation: {
          color: 0.99,
          grayscale: 0.42
        },
        backColor: "#000000e8"
      },
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
