export class Team {
  id: string;
  winner: boolean;
  linescores: { value: number }[];
  name: string;
  abbr: string;
  logo: string;
  group: string;
  score: string;
  rank: number;
  homeAway: string;
  selected: boolean;
  record?: string;
  standingSummary?: string;
  stats?;
}
