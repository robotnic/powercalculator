import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EventService } from '../eventhandler.service';
import * as moment from 'moment';
import { unitOfTime } from 'moment';
import { Chart } from '../models/charts';

@Injectable({
  providedIn: 'root'
})
export class PowerService {

  constructor(private http: HttpClient, private eventService: EventService) {}

  charts() {
    return new Promise((resolve) => {
      const state = this.eventService.getState();
      const date = moment(state.date, 'YYYYMMDD');
      const start = moment(date).startOf(state.timetype as unitOfTime.StartOf);
      const end = moment(start).add(state.timetype + 's' as unitOfTime.DurationConstructor, +1);

      if (state.timetype === 'year') {
        const promises = [];
        for (let m = 0; m < 12; m++) {
          const monthStart = moment(start).add(m, 'month');
          const monthEnd = moment(start).add(m + 1, 'month');
          promises.push(this.loadChart(monthStart, monthEnd, state.country));
          this.eventService.setState('loading', monthStart.format('MMM'));
          Promise.all(promises).then(result => {
            this.eventService.setState('loaded', monthStart.format('MMM'));
            if (promises.length === result.length) {
              resolve(this.combineResult(result));
            }
          });
        }
      } else {
        console.log(state.timetype, start, end);
        this.eventService.setState('loading', 'power');
        this.loadChart(start, end, state.country).then(chart => {
          if (chart) {
            this.eventService.setState('loaded', 'power');
          } else {
            this.eventService.setState('notloaded', 'power');
          }
          resolve(chart);
        }, error => {
          this.eventService.setState('notloaded', 'power');
        });
      }
    });
  }
  loadChart(start, end, country) {
    return new Promise((resolve, reject) => {
      const startString = start.format('YYYYMMDD');
      const endString = end.format('YYYYMMDD');
      const url = `/api/generated?start=${startString}0000&end=${endString}0000&area=${country}`;
      this.http.get(url).toPromise().then((data: Chart) => {
        if (data) {
          resolve(data);
        } else {
          resolve(null);
        }
      }).catch(e => {
        console.log(e);
        reject(e);
      });
    });
  }

  combineResult(result) {
    result[0].forEach((chart, i) => {
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
