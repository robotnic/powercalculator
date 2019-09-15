import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EventService } from '../eventhandler.service';
import * as moment from 'moment';


@Injectable({
  providedIn: 'root'
})
export class PowerService {

  constructor(private http: HttpClient, private eventService: EventService) { }

  charts() {
    return new Promise((resolve) => {
      const state = this.eventService.getState();
      const date = moment(state.date, 'YYYYMMDD');
      const start = moment(date).startOf(state.timetype);
      const end = moment(start).add(state.timetype + 's', +1); 

      if (state.timetype === 'year') {
        const promises = [];
        for (let m = 0; m < 12; m++) {
          const monthStart = moment(start).add(m, 'month');
          const monthEnd = moment(start).add(m + 1, 'month');
          promises.push(this.loadChart(monthStart, monthEnd, state.country));
          Promise.all(promises).then(result => {
            if (promises.length === result.length) {
              resolve(this.combineResult(result));
            }
          });
        }
      } else {
        console.log(state.timetype, start, end);
        this.loadChart(start, end, state.country).then(chart => {
          resolve(chart);
        });
      }
    });
  }
  loadChart(start, end, country) {
    return new Promise(resolve => {
      const startString = start.format('YYYYMMDD');
      const endString = end.format('YYYYMMDD');
      //console.log(start, end, country);
      // const url = '/api/generated?start=201909050000&end=201909060000&area=' + state.country;
      const url = `/api/generated?start=${startString}0000&end=${endString}0000&area=${country}`;
      this.http.get(url).toPromise().then(data => {
        resolve(data);
      });
    });
  }


  combineResult(result) {
    result[0].forEach((chart ,i) => {
        let values = [];
        result.forEach(month => {
          if (month && month[i]) {
            values = values.concat(month[i].values);
          }
        });
        result[0][i].values = values;
    });
    return result[0];
  }
}
