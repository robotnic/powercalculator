import { Injectable } from '@angular/core';
import { Observable, Scheduler } from 'rxjs';
import { PowerService } from './power.service';
import { InstalledService } from './installed.service';
import { ConfigService } from './config.service';
import { RulesService } from './rules.service';
import { EventService } from '../eventhandler.service';
import { HydrofillService } from './hydrofill.service';
import { ConsumptionService } from './consumption.service';
import * as moment from 'moment';
import { Data } from '../models/data';
import { Chart } from '../models/charts';
import { Installed } from '../models/installed';
import { Config } from '../models/config';
import { Rules } from '../models/rules';
import { Consumption } from '../models/consumption';
import { CalcschedulerService } from '../calculator/calcscheduler.service';

@Injectable({
  providedIn: 'root'
})
export class Loader {
  currentDate;
  currentCountry;
  currentTimetype;
  data: Data;
  loadSubscription: any;
  constructor(
    private powerService: PowerService,
    private eventHandler: EventService,
    private installedService: InstalledService,
    private configService: ConfigService,
    private hydrofillService: HydrofillService,
    private rulesService: RulesService,
    private scheduler: CalcschedulerService,
    private consumptionService: ConsumptionService
  ) {}
  power() {
    return new Observable((observer) => {
      // observable execution
      this.loadSubscription = this.load().subscribe(data => {
        if (data) {
          const rdata = JSON.parse(JSON.stringify(data));
          observer.next(rdata);
        } else {
          console.log('no data');
        }
      });
    });
  }
  year() {

  }
  load() {
    return new Observable(observer => {
      if (this.data) {
        observer.next(this.data);
      } else {
        this.loaddata(observer);
      }
      this.eventHandler.on('navigate').subscribe((e) => {
        this.loaddata(observer);
      });
      this.eventHandler.on('mutate').subscribe(() => {
        this.loaddata(observer);
      });
    });
  }

  loaddata(observer) {
    const state = this.eventHandler.getState();
//    console.log('STATE', state, this.currentDate, this.currentCountry);
    if (this.currentDate !== state.navigate.date ||
      this.currentCountry !== state.navigate.country ||
      this.currentTimetype !== state.navigate.timetype ||
      state.navigate.refresh
    ) {
      // this.eventHandler.setState('refresh', false);
      this.currentDate = state.navigate.date;
      this.currentCountry = state.navigate.country;
      this.currentTimetype = state.navigate.timetype;
      const year = moment(state.navigate.date, 'YYYYMMDD').format('YYYY');
      const promises = [
        this.powerService.charts(),
        this.installedService.installed(),
        this.configService.config(),
        this.rulesService.rules(),
        this.hydrofillService.hydrofill(year, state.navigate.country),
        this.consumptionService.load()
      ];
      Promise.all(promises).then((data) => {
        this.data = {
          power: <Chart[]>data[0],
          installed: <Installed>data[1],
          config: <Config>data[2],
          rules: <Rules>data[3],
          hydrofill: <Chart>data[4],
          consumption: <Consumption>data[5],
          meta: {
            date: <string>this.currentDate,
            country: <string>this.currentCountry,
            timetype: <string>this.currentTimetype
          },
          sum: null,
          loadshifted: null
        };
        this.scheduler.init(this.data).then(() => {
          if (this.data.power) {
            observer.next(this.data);
          }
        }, error => {
          console.log('error');
        })
        .catch(c => {
          console.log('catch', c);
        });
      });
    } else {
      observer.next(this.data);
    }
  }
}
