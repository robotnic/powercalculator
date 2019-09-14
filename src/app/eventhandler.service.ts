import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  state = {
    date: moment().add('day', -1).format('YYYYMMDD'),
    country: 'Austria',
    mutate: {
    'Wind Onshore': 0,
    'Wind Offshore': 0,
    'Solar': 0,
    'Power2Gas': 0,
    'Transport': 0,
    'quickview': false
    },
    timetype: 'day'

  };
  observers = [];
  constructor() { }
  /*
  init() {
    console.log('init');
    this.setState(this.state);
  }
  */
  stateChange() {
    return new Observable(observer => {
      this.observers.push(observer);
    });
  }
  setState(type, state) {
    this.state[type] = state;
    this.observers.forEach(observer => {
      observer.next(this.state);
    });
  }
  getState() {
    return this.state;
  }
}
