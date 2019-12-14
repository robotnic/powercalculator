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
      const date: moment.Moment = moment(state.navigate.date, 'YYYYMMDD');
      const start: moment.Moment = moment(date).startOf(state.navigate.timetype as unitOfTime.StartOf);
      const end: moment.Moment = moment(start).add(state.navigate.timetype + 's' as unitOfTime.DurationConstructor, +1);

      if (state.navigate.timetype === 'year') {
        const promises = [];
        for (let m = 0; m < 12; m++) {
          const monthStart: moment.Moment = moment(start).add(m, 'month');
          const monthEnd: moment.Moment = moment(start).add(m + 1, 'month');
          promises.push(this.loadChart(monthStart, monthEnd, state.navigate.country, state.navigate.refresh));
          this.eventService.setState('message.loading', monthStart.format('MMM'));
          Promise.all(promises).then((result: Chart[]) => {
            this.eventService.setState('message.loaded', monthStart.format('MMM'));
            if (promises.length === result.length) {
              resolve(this.combineResult(result));
            }
          }, error => {
            console.log('promise failed');
          });
        }
      } else {
        this.eventService.setState('message.loading', 'power');
        this.loadChart(start, end, state.navigate.country, state.navigate.refresh).then((chart: Chart) => {
          this.eventService.setState('message.loading', '');
          if (chart) {
            this.eventService.setState('message.loaded', 'power');
          } else {
            this.eventService.setState('message.notloaded', 'power');
          }
          resolve(chart);
        }, error => {
          console.error(error);
          this.eventService.setState('message.notloaded', 'power');
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
        resolve(null);
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
