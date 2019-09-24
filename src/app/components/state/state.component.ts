import { Component, OnInit } from '@angular/core';
import { EventService } from 'src/app/eventhandler.service';
import * as moment from 'moment';
import { State } from 'src/app/models/state';

@Component({
  selector: 'app-state',
  templateUrl: './state.component.html',
  styleUrls: ['./state.component.less']
})
export class StateComponent implements OnInit {
  loading = [];
  calcing = [];
  notloaded = [];
  thedate;
  constructor(private eventService: EventService) {}

  ngOnInit() {
    this.eventService.on('message').subscribe((state: State) => {
      // tslint:disable-next-line:forin
      for (const k in state.message) {
        switch (k) {
          case 'loading':
            if (state.message[k]) {
              this.loading.push(state.message[k]);
              state.message[k] = '';
            }
            break;
          case 'loaded':
            this.loading = this.loading.filter(item => {
              return item !== state.message[k];
            });
            this.notloaded = this.notloaded.filter(item => {
              return item !== state.message[k];
            });
            break;
          case 'calcing':
            if (state.message[k]) {
              this.calcing.push(state.message[k]);
            }
            break;
          case 'calced':
            this.calcing = this.calcing.filter(item => {
              return item !== state.message[k];
            });
            this.thedate = this.calcDate(); // date
            break;
          case 'notloaded':
            const thing: any = state;
            if (thing.notloaded) {
              this.notloaded.push(state.message[k]);
            }
            this.loading = this.loading.filter(item => {
              return item !== state.message[k];
            });
            break;
        }
      }
    });
  }
  calcDate() {
    const eventstate = this.eventService.getState();
    const date = moment(eventstate.navigate.date, 'YYYYMMDD');
    let thedate = 'unknown';
    switch (eventstate.navigate.timetype) {
      case 'day':
        thedate = date.format('YYYY MMM DD');
        break;
      case 'week':
        thedate = date.format('YYYY') + ' week ' + date.format('W');
        break;
      case 'month':
        thedate = date.format('YYYY MMMM');
        break;
      case 'year':
        thedate = date.format('YYYY');
    }
    return thedate;
  }
}
