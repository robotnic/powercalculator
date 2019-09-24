import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { State } from './models/state';
import { HashService } from './hash.service';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  defaultState: State = {
    navigate: {
      date: moment().add('day', -1).format('YYYYMMDD'),
      country: 'Austria',
      timetype: 'day',
      refresh: false
    },
    mutate: {
      'Wind Onshore': 0,
      'Wind Offshore': 0,
      'Solar': 0,
      'Power2Gas': 0,
      'Transport': 0,
      'quickview': false
    },
    message: {
      calced: '',
      calcing: '',
      loaded: '',
      loading: ''
    }
  };
  state: State = this.hashService.getStateHash(this.defaultState);
  observers = {};
  constructor(private hashService: HashService) {}
  /*
  init() {
    console.log('init');
    this.setState(this.state);
  }
  */
  on(type ? ) {
    return new Observable(observer => {
      if (!this.observers[type]) {
        this.observers[type] = [];
      }
      this.observers[type].push(observer);
    });
  }
  setState(name, state) {
    const parts = name.split('.');
    const type = parts[0];
    if (parts.length === 2) {
      const subtype = parts[1];
      this.state[type][subtype] = state;
    } else {
      if (parts.length === 1) {
        this.state[name] = state;
      }
    }
    if (this.observers[type]) {
        this.observers[type].forEach(observer => {
          observer.next(this.state);
        });
      }
      this.hashService.setStateHash(this.state, this.defaultState);
 
  }
  getState() {
    return this.state;
  }
}
