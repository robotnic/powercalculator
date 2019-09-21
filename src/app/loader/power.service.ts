import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EventService } from '../eventhandler.service';
import * as moment from 'moment';
import { unitOfTime } from 'moment';
import { Chart } from '../models/charts';
import { State } from '../models/state';

@Injectable({
  providedIn: 'root'
})
export class PowerService {

  constructor(private http: HttpClient, private eventService: EventService) {}

  charts() {
    return new Promise((resolve) => {
      const state: State = this.eventService.getState();
      console.log(state);
      const date: moment.Moment = moment(state.date, 'YYYYMMDD');
      const start: moment.Moment = moment(date).startOf(state.timetype as unitOfTime.StartOf);
      const end: moment.Moment = moment(start).add(state.timetype + 's' as unitOfTime.DurationConstructor, +1);

      if (state.timetype === 'year') {
        const promises = [];
        for (let m = 0; m < 12; m++) {
          const monthStart: moment.Moment = moment(start).add(m, 'month');
          const monthEnd: moment.Moment = moment(start).add(m + 1, 'month');
          promises.push(this.loadChart(monthStart, monthEnd, state.country, state.refresh));
          this.eventService.setState('loading', monthStart.format('MMM'));
          Promise.all(promises).then((result: Chart[]) => {
            this.eventService.setState('loaded', monthStart.format('MMM'));
            if (promises.length === result.length) {
              resolve(this.combineResult(result));
            }
          });
        }
      } else {
        console.log(state.timetype, start, end);
        this.eventService.setState('loading', 'power');
        this.loadChart(start, end, state.country, state.refresh).then((chart: Chart) => {
          if (chart) {
            this.eventService.setState('loaded', 'power');
          } else {
            this.eventService.setState('notloaded', 'power');
          }
          resolve(chart);
        }, error => {
          console.error(error);
          this.eventService.setState('notloaded', 'power');
        });
      }
    });
  }
  loadChart(start, end, country, refresh) {
    return new Promise((resolve, reject) => {
      const startString: string = start.format('YYYYMMDD');
      const endString: string = end.format('YYYYMMDD');
      let url = `/api/generated?start=${startString}0000&end=${endString}0000&area=${country}`;
      if (refresh) {
        url += '&refresh=true';
      }
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
