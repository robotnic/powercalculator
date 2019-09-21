export interface Config {
  [index: string]: ConfigType;
}
interface ConfigType {
  co2: number;
  color: string;
}