import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PowerService } from './power.service';
import { InstalledService } from './installed.service';
import { ConfigService } from './config.service';
import { RulesService } from './rules.service';
import { EventService } from '../eventhandler.service';
import { HydrofillService } from './hydrofill.service';
import * as moment from 'moment';
import { Calculator } from '../calculator/calculator.service';
import { Data } from '../models/data';
import { Chart } from '../models/charts';
import { Installed } from '../models/installed';

@Injectable({
  providedIn: 'root'
})
export class Loader {
  currentDate;
  currentCountry;
  currentTimetype;
  data: Data;
  constructor(
    private powerService: PowerService,
    private eventHandler: EventService,
    private installedService: InstalledService,
    private configService: ConfigService,
    private hydrofillService: HydrofillService,
    private rulesService: RulesService,
    private calculator: Calculator
  ) {}
  power() {
    return new Observable((observer) => {
      // observable execution
      this.load().subscribe(data => {
        const rdata = JSON.parse(JSON.stringify(data));
        observer.next(rdata);
      });
    });
  }
  year() {

  }
  load() {
    return new Observable(observer => {
      if (this.data) {
        observer.next(this.data);
      }
      this.eventHandler.on('date').subscribe(() => {
        this.loaddata(observer);
      });

      this.eventHandler.on('timetype').subscribe(() => {
        this.loaddata(observer);
      });
      this.eventHandler.on('country').subscribe(() => {
        this.loaddata(observer);
      });
      this.eventHandler.on('mutate').subscribe(() => {
        this.loaddata(observer);
      });
    });
  }

  loaddata(observer) {
    const state = this.eventHandler.getState();
    console.log('STATE', state, this.currentDate, this.currentCountry);
    if (this.currentDate !== state.date || this.currentCountry !== state.country || this.currentTimetype !== state.timetype) {
      this.currentDate = state.date;
      this.currentCountry = state.country;
      this.currentTimetype = state.timetype;
      const year = moment(state.date, 'YYYYMMDD').format('YYYY');
      this.powerService.charts().then((x: Chart) => console.log(x));
      const promises = [
        this.powerService.charts(),
        this.installedService.installed(),
        this.configService.config(),
        this.rulesService.rules(),
        this.hydrofillService.hydrofill(year, state.country),
      ];
      Promise.all(promises).then((data) => {
        this.data = {
          power: <Chart>data[0],
          installed: <Installed>data[1],
          config: data[2],
          rules: data[3],
          hydrofill: <Chart>data[4],
          meta: {
            date: this.currentDate,
            country: this.currentCountry,
            timetype: this.currentTimetype
          },
          sum: null,
          loadshifted: null
        };
        this.calculator.init(this.data);
        if (this.data.power) {
          observer.next(this.data);
        }
      });
    } else {
      observer.next(this.data);
    }
  }
}
