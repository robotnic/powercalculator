import { Component, OnInit } from '@angular/core';
import { EventService } from 'src/app/eventhandler.service';

@Component({
  selector: 'app-date',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.less']
})
export class DateComponent implements OnInit {

  constructor(private eventService: EventService) { }

  ngOnInit() {
    setTimeout(() => {
      //this.eventService.init();
      console.log('changedate');
      this.changedate('20181111');
    }, 2000);
  }
  changedate(date) {
    this.eventService.setState('date', date);
  }
  changecountry(country) {
    this.eventService.setState('country', country);
  }

}
