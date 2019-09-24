import { Component, OnInit } from '@angular/core';
import { EventService } from 'src/app/eventhandler.service';
import { CountriesService } from 'src/app/loader/countries.service';
import { Loader } from 'src/app/loader/loader.service';
import { Data } from 'src/app/models/data';
import {FormControl} from '@angular/forms';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material';

import * as moment from 'moment';
import { State } from 'src/app/models/state';
// tslint:disable-next-line:no-duplicate-imports
// import {default as _rollupMoment} from 'moment';

// const moment = _rollupMoment || _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};

@Component({
  selector: 'app-mutateui',
  templateUrl: './mutateui.component.html',
  styleUrls: ['./mutateui.component.less'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class MutateuiComponent implements OnInit {
  countries: string[] = [];
  timeout = null;
  country;
  layers = [];
  year = 2015;
  month = 5;
  day = 6;
  date;
  state: State;

  timetype;

  constructor(private eventService: EventService, private countryService: CountriesService, private loader: Loader) { }

  ngOnInit() {
    const date: moment.Moment = moment().add('day', -2);
    const state = this.eventService.getState();
    this.state = state;
    this.eventService.setState('navigate', state.navigate);

    this.countryService.countries().then(countries => {
      this.countries = Object.keys(countries);
    });
    this.loader.power().subscribe((power: Data) => {
      const data: Data = power;
      this.layers.length = 0;
      if (data.loadshifted) {
        // tslint:disable-next-line:forin
        for (const c in data.loadshifted) {
          const chart = data.loadshifted[c];
          this.layers.push({
            key: chart.key,
            value: true,
            color: chart.color
          });
        }
      }
    });
  }
  change() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      this.eventService.setState('mutate', this.state.mutate);
    }, 30);
  }


  inc(type) {
    let delta = 1;
    if (type === 'Transport') {
      delta = 5;
    }
    this.state.mutate[type] += delta;
    if (type === 'Transport' && this.state.mutate[type] > 100) {
      this.state.mutate[type] = 100;
    }
    this.change();
  }

  dec(type) {
    let delta = 1;
    if (type === 'Transport') {
      delta = 5;
    }
    this.state.mutate[type] -= delta;
    if (this.state.mutate[type] < 0) {
      this.state.mutate[type] = 0;
    }
    this.change();
  }

  inctime(type) {
    const state = this.eventService.getState();
    const date = moment(state.navigate.date, 'YYYYMMDD');
    date.add(type, 1);
    this.eventService.setState('navigate.date', date.format('YYYYMMDD'));
  }

  dectime(type) {
    const state = this.eventService.getState();
    const date = moment(state.navigate.date, 'YYYYMMDD');
    date.add(type, -1);
    this.eventService.setState('navigate.date', date.format('YYYYMMDD'));
  }
  setdate(date) {
    this.eventService.setState('navigate.date', date.format('YYYYMMDD'));
  }
  today() {
    const date = moment();
    this.eventService.setState('navigate.date', date.format('YYYYMMDD'));
  }

  selectcountry(country) {
    this.eventService.setState('navigate.country', country);
  }

  selecttimetype(type) {
    this.eventService.setState('navigate.timetype', type);
  }
  refresh() {
    this.eventService.setState('navigate.refresh', true);
    this.eventService.setState('navigate.refresh', false);
  }
}
