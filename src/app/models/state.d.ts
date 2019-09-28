export interface State {
  navigate: Navigate;
  mutate: Mutate;
  message: Message;
  view: View;
}
interface Mutate {
  'Wind Onshore': number;
  'Wind Offshore': number;
  'Solar': number;
  'Power2Gas': number;
  'Transport': number;
  'quickview': boolean;
}

interface Navigate {
  country: string;
  date: string;
  timetype: string;
  refresh: boolean;
}

interface Message {
  calced: string;
  calcing: string;
  loaded: string;
  loading: string;
}

interface View {
  navigate: boolean;
  mutate: boolean;
  charts: string;
}