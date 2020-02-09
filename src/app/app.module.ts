import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NvD3Module } from 'ng2-nvd3';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatFormFieldModule,
  MatInputModule,
  MatTabsModule,
  MatSelectModule,
  MatCheckboxModule,
  MatExpansionModule,
  MatIconModule,
  MatButtonModule,
  MatCardModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatTableModule,
  MatSortModule,
  MatRadioModule,
  MatGridListModule,
  MatListModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PowerComponent } from './components/power/power.component';
import { HomeComponent } from './components/home/home.component';
import { DateComponent } from './components/date/date.component';
import { DatepickerComponent } from './components/datepicker/datepicker.component';
import { MutateuiComponent } from './components/mutateui/mutateui.component';

import 'd3';
import 'nvd3';
import { StateComponent } from './components/state/state.component';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { EnergyComponent } from './components/energy/energy.component';
import { TablesComponent } from './components/tables/tables.component';
import { ElectrictableComponent } from './electrictable/electrictable.component';
import { EnergytableComponent } from './energytable/energytable.component';
import { HeaderComponent } from './components/header/header.component';

import * as Hammer from 'hammerjs';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { QuickbarComponent } from './components/quickbar/quickbar.component';

export class HammerConfig extends HammerGestureConfig {
  overrides = <any>{
      'swipe': { direction: Hammer.DIRECTION_HORIZONTAL },
      'press': {}
    };
  }

registerLocaleData(localeFr);

@NgModule({
  declarations: [
    AppComponent,
    PowerComponent,
    HomeComponent,
    DateComponent,
    DatepickerComponent,
    MutateuiComponent,
    StateComponent,
    EnergyComponent,
    TablesComponent,
    ElectrictableComponent,
    EnergytableComponent,
    HeaderComponent,
    QuickbarComponent
  ],
  imports: [
    BrowserModule,
    NvD3Module,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatTabsModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatExpansionModule,
    BrowserAnimationsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    ReactiveFormsModule,
    MatSortModule,
    MatRadioModule,
    MatGridListModule,
    MatListModule
  ],
      providers: [
      {
        provide: HAMMER_GESTURE_CONFIG,
        useClass: HammerConfig
      }
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }