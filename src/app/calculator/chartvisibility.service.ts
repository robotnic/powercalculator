import { Injectable } from '@angular/core';
import { EventService } from '../eventhandler.service';

@Injectable({
  providedIn: 'root'
})
export class ChartvisibilityService {

  constructor(private eventService: EventService) { }
  set(data) {
    const state = this.eventService.getState();
    data.loadshifted.forEach((chart, i) => {
      chart.disabled = false;
      if (state.view.charts[i] === '1') {
        chart.disabled = true;
      }
    });
  }
}
