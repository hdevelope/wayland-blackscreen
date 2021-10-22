import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import '../polyfills';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';


@NgModule({
  declarations: [
    AppComponent, 
	HomeComponent
   
  ],
  imports: [
    AppRoutingModule,
	BrowserModule,
  
  ],
  providers:[],
  bootstrap: [AppComponent]
})
export class AppModule { }
