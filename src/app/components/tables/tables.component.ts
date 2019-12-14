import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Loader } from 'src/app/loader/loader.service';
import { MatSort } from '@angular/material';

import * as moment from 'moment';
import { EventService } from 'src/app/eventhandler.service';
import { Data } from 'src/app/models/data';
import { CalcschedulerService } from 'src/app/calculator/calcscheduler.service';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.less']
})
export class TablesComponent implements OnInit, OnDestroy  {
  total = {};
  tables = {};
  date;
  previousdate;
  country;
  meta;
  timetype;
  data;
  dataSource;
  math = Math;
  tabletype = 'energy';
  powerSubscription: any;

  constructor(
    private loader: Loader,
    private scheduler: CalcschedulerService,
    private eventService: EventService
  ) {}

  ngOnInit() {
    console.log('inittable');
    this.powerSubscription = this.loader.power().subscribe((original: Data) => {
      this.date = moment(original.meta.date, 'YYYYMMDD').format('YYYY/MM/DD');
      this.meta = original.meta;
      this.country = original.meta.country;
      this.timetype = original.meta.timetype;
      this.scheduler.mutate().then((modified: Data) => {
        this.data = modified;
        this.eventService.setState('message.calced', 'render');
        this.eventService.setState('message.calcing', '');
        this.previousdate = modified.meta.date;
      });
    });
  }
  ngOnDestroy() {
    this.powerSubscription.unsubscribe();
  }
}