import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NvD3Module } from 'ng2-nvd3';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule, MatInputModule, MatTabsModule, MatSelectModule, MatCheckboxModule, MatExpansionModule,
  MatIconModule, MatButtonModule, MatCardModule, MatDatepickerModule, MatNativeDateModule, MatTableModule } from '@angular/material';
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

registerLocaleData(localeFr);

@NgModule({
  declarations: [
    AppComponent,
    PowerComponent,
    HomeComponent,
    DateComponent,
    DatepickerComponent,
    MutateuiComponent,
    StateComponent
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
    MatTableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
