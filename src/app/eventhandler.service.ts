import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { State } from './models/state';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  state: State = {
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
    timetype: 'day',
    calced: '',
    calcing: '',
    loaded: '',
    loading: ''
  };
  observers = {};
  constructor() { }
  /*
  init() {
    console.log('init');
    this.setState(this.state);
  }
  */
  on(type?) {
    return new Observable(observer => {
      if (!this.observers[type]) {
        this.observers[type] = [];
      }
      this.observers[type].push(observer);
    });
  }
  setState(type, state) {
    this.state[type] = state;
    if (this.observers[type]) {
      this.observers[type].forEach(observer => {
        observer.next(this.state);
      });
    }
  }
  getState() {
    return this.state;
  }
}
