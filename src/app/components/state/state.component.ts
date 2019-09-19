import { Component, OnInit } from '@angular/core';
import { EventService } from 'src/app/eventhandler.service';
import * as moment from 'moment';

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
    this.eventService.on('loading').subscribe(state => {
      const thing: any = state;
      if (thing.loading) {
        this.loading.push(thing.loading);
      }
    });
    this.eventService.on('loaded').subscribe(state => {
      const thing: any = state;
      this.loading = this.loading.filter(item => {
        return item !== thing.loaded;
      });
      this.notloaded = this.notloaded.filter(item => {
        return item !== thing.loaded;
      });
    });
    this.eventService.on('calcing').subscribe(state => {
      const thing: any = state;
      if (thing.calcing) {
        this.calcing.push(thing.calcing);
      }
    });
    this.eventService.on('calced').subscribe(state => {
      const thing: any = state;
      this.calcing = this.calcing.filter(item => {
        return item !== thing.calced;
      });
      const eventstate = this.eventService.getState();
      this.thedate = this.calcDate();
    });
    this.eventService.on('notloaded').subscribe(state => {
      const thing: any = state;
      if (thing.notloaded) {
        this.notloaded.push(thing.notloaded);
      }
      this.loading = this.loading.filter(item => {
        return item !== thing.notloaded;
      });
    });

  }
  calcDate() {
    const eventstate = this.eventService.getState();
    const date = moment(eventstate.date, 'YYYYMMDD');
    let thedate = 'unknown';
    switch (eventstate.timetype) {
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