export interface Installed {
    [index: number]: InstalledType;
}
interface InstalledType {
  [index: string]: number;
}