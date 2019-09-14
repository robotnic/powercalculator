import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NvD3Module } from 'ng2-nvd3';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule, MatInputModule, MatTabsModule, MatSelectModule, MatCheckboxModule, MatExpansionModule,
  MatIconModule, MatButtonModule, MatCardModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PowerComponent } from './components/power/power.component';
import { PowerdiffComponent } from './components/powerdiff/powerdiff.component';
import { HomeComponent } from './components/home/home.component';
import { DateComponent } from './components/date/date.component';
import { DatepickerComponent } from './components/datepicker/datepicker.component';
import { MutateuiComponent } from './components/mutateui/mutateui.component';

import 'd3';
import 'nvd3';

@NgModule({
  declarations: [
    AppComponent,
    PowerComponent,
    PowerdiffComponent,
    HomeComponent,
    DateComponent,
    DatepickerComponent,
    MutateuiComponent
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
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
