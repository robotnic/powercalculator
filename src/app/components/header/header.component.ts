import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less']
})
export class HeaderComponent implements OnInit {
  @Output() sidenavClose = new EventEmitter();
  open = false;
  mutate = false;

  constructor() { }

  ngOnInit() {
    if (window.innerWidth > 1000) {
      this.open = true;
    }
  }
  public onSidenavClose = () => {
//    this.sidenavClose.emit();
    if (window.innerWidth > 1000) {
      this.open = true;
    } else {
      this.open = false;
    }
  }
  openMutate() {
    this.mutate = true;
  }
}
