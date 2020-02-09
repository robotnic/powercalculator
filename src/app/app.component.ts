import { Component } from '@angular/core';
import { EventService } from './eventhandler.service';
import * as moment from 'moment';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  constructor(private eventService: EventService) {}
  title = 'powercalculator';

  panend() {
    this.eventService.setState('navigate.timetype', 'day');
  }
  pitchend() {
    this.eventService.setState('navigate.timetype', 'week');
  }


  inctime() {
    const state = this.eventService.getState();
    const type: any = state.navigate.timetype;
    console.log(type, state.navigate.timetype);
    const date = moment(state.navigate.date, 'YYYYMMDD');
    date.add(type, 1);
    this.eventService.setState('navigate.date', date.format('YYYYMMDD'));
  }

  dectime() {
    const state = this.eventService.getState();
    const type: any = state.navigate.timetype;
    const date = moment(state.navigate.date, 'YYYYMMDD');
    date.add(type, -1);
    this.eventService.setState('navigate.date', date.format('YYYYMMDD'));
  }
}
