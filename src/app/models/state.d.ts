export interface State {
  calced: string;
  calcing: string;
  country: string;
  date: string;
  loaded: string;
  loading: string;
  timetype: string;
  mutate: Mutate;
}
interface Mutate {
  'Wind Onshore': number;
  'Wind Offshore': number;
  'Solar': number;
  'Power2Gas': number;
  'Transport': number;
  'quickview': boolean;
}