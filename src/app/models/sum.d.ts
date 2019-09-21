export interface Sum {
  [index: string]: SumItem;
}
export interface SumItem {
  original: number;
  modified: number;
  delta: number;
}