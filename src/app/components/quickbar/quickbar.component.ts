import { Component, OnInit } from '@angular/core';
import { EventService } from 'src/app/eventhandler.service';

@Component({
  selector: 'app-quickbar',
  templateUrl: './quickbar.component.html',
  styleUrls: ['./quickbar.component.less']
})
export class QuickbarComponent implements OnInit {
  state = null;
  members = [
    { name: 'Solar', icon: 'sun', unit: 'GWp' },
    { name: 'Wind Onshore', icon: 'wind', unit: 'GWp' },
    { name: 'Wind Offshore', icon: 'offshore', unit: 'GWp' },
    { name: 'Transport', icon: 'car', unit: '%' },
    { name: 'Power2Gas', icon: 'h2', unit: 'GW' }
  ];
  timeout: any;
  popup: any = '';
  interval: any;
  initspeed = 800;
  speed: number;

  constructor(private eventService: EventService) { }

  ngOnInit() {
    this.state = this.eventService.getState();
  }
  change() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      this.eventService.setState('mutate', this.state.mutate);
    }, 30);
  }

  inc(type) {
//    this.stop();
    let delta = 1;
    if (type === 'Transport') {
      delta = 5;
    } 
    if (!this.state.mutate[type]) {
      this.state.mutate[type] = 0;
    }
    this.state.mutate[type] += delta;
    if (type === 'Transport' && this.state.mutate[type] > 100) {
      this.state.mutate[type] = 100;
    }
  }
  dec(type) {
 //   this.stop();
    let delta = 1;
    if (type === 'Transport') {
      delta = 5;
    }
    if (!this.state.mutate[type]) {
      this.state.mutate[type] = 0;
    }
    this.state.mutate[type] -= delta;
    if (this.state.mutate[type] < 0) {
      this.state.mutate[type] = 0;
    }
  }
  startinc(type) {
    this.loop('inc', type, this.initspeed);
    this.popup = type;
    /*
    this.interval = setInterval(() => {
      this.inc(type);
      this.speed = this.speed * 0.7;
    }, this.speed);
    */
  }
  startdec(type) {
    this.loop('dec', type, this.initspeed);
    this.popup = type;
    /*
    this.popup = type;
    this.interval = setInterval(() => {
      this.dec(type);
    }, this.speed);
    */
  }
  loop(direction, type, speed) {
    this.interval = setTimeout(() => {
      if (this.interval) {
        speed = speed * 0.9;
        this.loop(direction, type, speed);
      }
    }, speed);
    if (direction === 'inc') {
      this.inc(type);
    }
    if (direction === 'dec') {
      this.dec(type);
    }
  }
  stop() {
    clearTimeout(this.interval);
    this.interval = null;
    this.change();
    this.popup = '';
  }
}
