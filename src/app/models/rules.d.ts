export interface Rules {
  loadshift: Loadshift;
  timeshift: Timeshift;
  schedule: Schedule;
}

interface Loadshift {
  from: string[];
  to: string[];
}

interface Timeshift {
  from: string[];
  to: string[];
}
interface Schedule {
  init: string[];
  calc: string[];
}