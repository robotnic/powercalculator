import { Component, OnInit } from '@angular/core';
import { EventService } from 'src/app/eventhandler.service';
import { CountriesService } from 'src/app/loader/countries.service';
import * as moment from 'moment';
import { Loader } from 'src/app/loader/loader.service';
import { Data } from 'src/app/models/data';

@Component({
  selector: 'app-mutateui',
  templateUrl: './mutateui.component.html',
  styleUrls: ['./mutateui.component.less']
})
export class MutateuiComponent implements OnInit {
  countries: string[] = [];
  timeout = null;
  country;
  layers = [];
  year = 2015;
  month = 5;
  day = 6;
  date = '2018-03-11';
  timetype;
  mutate = {
    'Wind Onshore': 0,
    'Wind Offshore': 0,
    'Solar': 0,
    'Power2Gas': 0,
    'Transport': 0,
    'quickview': false,
    'refresh': true
  };

  constructor(private eventService: EventService, private countryService: CountriesService, private loader: Loader) { }

  ngOnInit() {
    const date: moment.Moment = moment().add('day', -2);
    this.country = this.eventService.getState().country;
    this.timetype = this.eventService.getState().timetype;
    this.eventService.setState('date', date.format('YYYYMMDD'));
    this.hrtime(date);
    this.countryService.countries().then(countries => {
      console.log(countries);
      this.countries = Object.keys(countries);
    });
    this.loader.power().subscribe((power: Data) => {
      const data: Data = power;
      console.log('danke für data', data.loadshifted);
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
      this.eventService.setState('mutate', this.mutate);
    }, 0);
  }


  inc(type) {
    let delta = 1;
    if (type === 'Transport') {
      delta = 5;
    }
    this.mutate[type] += delta;
    if (type === 'Transport' && this.mutate[type] > 100) {
      this.mutate[type] = 100;
    }
    this.change();
  }

  dec(type) {
    let delta = 1;
    if (type === 'Transport') {
      delta = 5;
    }
    this.mutate[type] -= delta;
    if (this.mutate[type] < 0) {
      this.mutate[type] = 0;
    }
    this.change();
  }

  inctime(type) {
    const state = this.eventService.getState();
    const date = moment(state.date, 'YYYYMMDD');
    date.add(type, 1);
    this.hrtime(date);
    this.eventService.setState('date', date.format('YYYYMMDD'));
  }

  dectime(type) {
    const state = this.eventService.getState();
    const date = moment(state.date, 'YYYYMMDD');
    date.add(type, -1);
    this.hrtime(date);
    this.eventService.setState('date', date.format('YYYYMMDD'));
  }
  setdate(e) {
    console.log('e', e);
    console.log('setdate', this.date);
    const date = moment(this.date, 'YYYY-MM-DD');
    this.hrtime(date);
    this.eventService.setState('date', date.format('YYYYMMDD'));
  }
  today() {
    const date = moment();
    this.hrtime(date);
    this.eventService.setState('date', date.format('YYYYMMDD'));
  }

  selectcountry(country) {
    this.eventService.setState('country', country);
  }

  hrtime(date) {
    this.year = date.format('YYYY');
    this.month = date.format('MM');
    this.day = date.format('DD');
    this.date = date.format('YYYY-MM-DD');
  }
  selecttimetype(type) {
    this.eventService.setState('timetype', type);
  }
  refresh() {
    this.eventService.setState('refresh', true);
    this.eventService.setState('refresh', false);
  }
}
