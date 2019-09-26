import { Injectable } from '@angular/core';
import { State } from './models/state';

@Injectable({
  providedIn: 'root'
})
export class HashService {
  constructor() {}
  setStateHash(state, defaultState) {
    let url = '';
    // tslint:disable-next-line:forin
    for (const s in state) {
      let suburl = '&' + s + '=';
      let hit = false;
      // tslint:disable-next-line:forin
      if (s === 'navigate' || s === 'mutate') {
        for (const v in state[s]) {
          if (state[s][v] !== defaultState[s][v] && state[s][v]) {
            suburl += v + ':' + state[s][v] + ';';
            hit = true;
          }
        }
      }
      if (hit) {
        url += suburl;
      }
    }
    location.hash = url.substring(1);
  }
  getStateHash(defaultState) {
    const state: State = JSON.parse(JSON.stringify(defaultState));
    //    let hash = location.hash.substring(1);
    const hash = location.hash.replace(/^#+/, '');
    const parts = hash.split('&');
    if (parts[0]) {
      parts.forEach(part => {
        const kvss = part.split('=');
        kvss[1].split(';').forEach(kvs => {
          if (kvs) {
            const kv = kvs.split(':');
            let value: any = kv[1];
            value = decodeURIComponent(value);
            if (value === 'false') {
              value = false;
            } else {
              if (kvss[0] === 'mutate') {
                value = parseInt(value, 10) || 0;
              }
            }
            state[kvss[0]][decodeURIComponent(kv[0])] = value;
          }
        });
      });
    }
    return state;
  }
}
