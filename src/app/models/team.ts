export class Team {
  id: string;
  name: string;
  abbr: string;
  logo: string;
  score: string;
  rank: number;
  homeAway: string;
  selected: boolean;
  record?: string;
  standingSummary?: string;
  stats?: { name: string; value: number }[];
}
