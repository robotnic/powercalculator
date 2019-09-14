import { Component, OnInit } from '@angular/core';
import { EventService } from 'src/app/eventhandler.service';
import { CountriesService } from 'src/app/loader/countries.service';
import * as moment from 'moment';
import { Loader } from 'src/app/loader/loader.service';
import { style } from '@angular/animations';

@Component({
  selector: 'app-mutateui',
  templateUrl: './mutateui.component.html',
  styleUrls: ['./mutateui.component.less']
})
export class MutateuiComponent implements OnInit {
  countries = [];
  timeout = null;
  country;
  layers = [];
  year = 2015;
  month = 5;
  day = 6;
  timetype;
  mutate = {
    'Wind Onshore': 0,
    'Wind Offshore': 0,
    Solar: 0,
    Power2Gas: 0,
    Transport: 0,
    quickview: false
  };

  constructor(private eventService: EventService, private countryService: CountriesService, private loader: Loader) { }

  ngOnInit() {
    const date = moment().add('day', -2);
    this.country = this.eventService.getState().country;
    this.timetype = this.eventService.getState().timetype;
    this.eventService.setState('date', date.format('YYYYMMDD'));
    this.hrtime(date);
    this.countryService.countries().then(countries => {
      console.log(countries);
      this.countries = Object.keys(countries);
    });
    this.loader.power().subscribe(data => {
      console.log('danke für data', data.loadshifted);
      this.layers.length = 0;
      if (data.loadshifted) {
        data.loadshifted.forEach(chart => {
          this.layers.push({
            key: chart.key,
            value: true,
            color: chart.color
          });
        });
      }
      console.log(this.layers);
    });
  }
  change() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      this.eventService.setState('mutate', this.mutate);
    }, 200);
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

  selectcountry(country) {
    this.eventService.setState('country', country);
  }

  hrtime(date) {
    this.year = date.format('YYYY');
    this.month = date.format('MM');
    this.day = date.format('DD');
  }
  selecttimetype(type) {
    this.eventService.setState('timetype', type);
  }

  refresh() {

  }

}
