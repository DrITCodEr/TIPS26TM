export interface TitelEdge {
  teamIdx: number;
  name: string;
  flag: string;
  simP: number; // %
  marktP: number; // %
  edge: number;
  absEdge: number;
}

export interface MatchEdge {
  matchIdx: number;
  teamA: string;
  teamB: string;
  date: string;
  time: string;
  simWinA: number;
  simDraw: number;
  simWinB: number;
  marketWinA: number;
  marketDraw: number;
  marketWinB: number;
  edgeWinA: number;
  edgeDraw: number;
  edgeWinB: number;
  maxAbsEdge: number;
}
