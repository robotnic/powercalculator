import { Component, OnInit } from '@angular/core';
import { EventService } from 'src/app/eventhandler.service';

@Component({
  selector: 'app-state',
  templateUrl: './state.component.html',
  styleUrls: ['./state.component.less']
})
export class StateComponent implements OnInit {
  loading = [];
  constructor(private eventService: EventService) { }

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
    });
  }
}
