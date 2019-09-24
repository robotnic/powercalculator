import { Component, OnInit } from '@angular/core';
import { CountriesService } from '../../loader/countries.service';
import { EventService } from 'src/app/eventhandler.service';

@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.less']
})
export class DatepickerComponent implements OnInit {
  countries = [];
  selectedcountry = null;
  timetype = 'day';
  week;
  month = 'May';
  day = 12;
  year = 2018;
  days = Array(31).fill(0).map((x, i) => i + 1);
  weeks = Array(52).fill(0).map((x, i) => i + 1);

  constructor(private countriesService: CountriesService, private eventService: EventService) { }

  ngOnInit() {
    this.countriesService.countries().then(countries => {
      console.log('got countries', countries);
      this.countries = Object.keys(countries);
      console.log('country array', this.countries);
      this.changedate('20181111');
    });
  }
  onDate() {

  }
  back(type) {}
  forward(type) {}
  reload() {}
  changedate(date) {
    this.eventService.setState('navigate.date', date);
  }
  selectcountry(country) {
    this.eventService.setState('navigate.country', country);
  }

}
