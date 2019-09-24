import { Component, OnInit } from '@angular/core';
import { EventService } from 'src/app/eventhandler.service';

@Component({
  selector: 'app-date',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.less']
})
export class DateComponent implements OnInit {

  constructor(private eventService: EventService) { }

  ngOnInit() {}
  changedate(date) {
    this.eventService.setState('navigate.date', date);
  }
  changecountry(country) {
    this.eventService.setState('navigate.country', country);
  }

}
