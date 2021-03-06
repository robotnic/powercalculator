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
  calcing = '';
  notloaded = [];
  thedate;
  figures;
  constructor(private eventService: EventService) {}

  ngOnInit() {
    this.thedate = this.calcDate();
    this.eventService.on('figures').subscribe((state: any) => {
      this.thedate = this.calcDate();
      this.figures = state.figures;
    });
    this.eventService.on('calcing').subscribe((state: any) => {
      this.calcing = state.calcing;
      this.figures = state.figures;
    });
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
              this.calcing = state.message[k];
            }
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
    let endOfWeek = date.clone();
    let startOfWeek = date.clone();
    endOfWeek = endOfWeek.endOf('week');
    startOfWeek = startOfWeek.startOf('week');
    let thedate = 'unknown';
    switch (eventstate.navigate.timetype) {
      case 'day':
        thedate = date.format('YYYY MMM DD');
        break;
      case 'week':
        thedate = date.format('YYYY') + '/' + date.format('W') + ' ' + startOfWeek.format('dd') + ' ' + startOfWeek.format('D') + ' ' + startOfWeek.format('MMM') + ' - ' + endOfWeek.format('D') + ' ' + endOfWeek.format('MMM') 
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
