export interface Chart {
  key: string;
  originalKey: string;
  values: Value[];
}

interface Value {
  x: number;
  y: number;
}
