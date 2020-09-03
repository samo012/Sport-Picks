export class Team {
  id: string;
  winner: boolean;
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
  stats?: { name: string; value: number }[];
}
