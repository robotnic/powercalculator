export interface Sankey {
  nodes: Nodes;
  links: Links;
}

interface Nodes {
  nodeId: string;
  name: string;
}

interface Links {
  source: string;
  target: string;
  value: number;
  color: string;
}