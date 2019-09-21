export interface Rules {
  loadshift: Loadshift;
  timeshift: Timeshift;
}

interface Loadshift {
  from: string[];
  to: string[];
}

interface Timeshift {
  from: string[];
  to: string[];
}