export interface Installed {
    [index: string]: InstalledType;
}
interface InstalledType {
  [index: string]: number;
}