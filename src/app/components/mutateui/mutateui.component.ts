import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventService } from 'src/app/eventhandler.service';
import { CountriesService } from 'src/app/loader/countries.service';
import { Loader } from 'src/app/loader/loader.service';
import { Data } from 'src/app/models/data';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';

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
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class MutateuiComponent implements OnInit, OnDestroy {
  countries: string[] = [];
  timeout = null;
  country;
  layers = [];
  year = 2015;
  month = 5;
  day = 6;
  date;
  state: State;
  previousState: State;

  timetype;
  loaderSubscription: any;

  constructor(private eventService: EventService, private countryService: CountriesService, private loader: Loader) {}

  ngOnInit() {
    const date: moment.Moment = moment().add('day', -2);
    const state = this.eventService.getState();
    this.state = state;

    this.eventService.setState('navigate', state.navigate);

    this.countryService.countries().then(countries => {
      this.countries = Object.keys(countries);
    });
    this.loaderSubscription = this.loader.power().subscribe((power: Data) => {
      const data: Data = power;
      this.layers.length = 0;
      if (data.power) {
        // tslint:disable-next-line:forin
        for (let c = 0; c < data.power.length; c++) {
          const chart = data.power[c];
          let value = '';
          if (state.view.charts[c] !== '1') {
            value = 'checked';
          }
          this.layers.push({
            key: chart.key,
            value: value,
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
  over() {
    console.log('over');
    this.previousState = JSON.parse(JSON.stringify(this.state));
    this.state.mutate = {
      'Solar': 0,
      'Wind Onshore': 0,
      'Wind Offshore': 0,
      'Transport': 0,
      'Power2Gas': 0
    };
    this.change();
  }
  out() {
    console.log('out');
    this.state = this.previousState;
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
  step(value) {
    let mod = 1;
    switch (true) {
      case (value < 10):
        mod = 1;
        break;
      case (value <= 100 && value > 10):
        mod = 5;
        break;
      case (value <= 1000 && value > 100):
        mod = 50;
        break;
      case (value > 1000 ):
        mod = 100;
        break;
      default:
        console.log('default', value);
    }
    return mod;
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
  panelaction() {
    this.eventService.setHash();
  }
  resetMutate() {
    // tslint:disable-next-line:forin
    for (const m in this.previousState.mutate) {
      this.previousState.mutate[m] = 0;
    }
    this.change();
  }
  showall() {
    this.layers.forEach(layer => {
      layer.value = true;
    });
    this.layeraction();
  }
  toggle() {
    this.layers.forEach(layer => {
      layer.value = !layer.value;
    });
    this.layeraction();
  }
  layeraction() {
    let layercode = '';
    console.log(this.layers);
    this.layers.forEach(layer => {
      if (!layer.value) {
        layercode += '1';
      } else {
        layercode += '0';
      }
    });
    console.log(layercode);
    this.eventService.setState('view.charts', layercode);
  }
  ngOnDestroy() {
    this.loaderSubscription.unsubscribe();
  }
}
