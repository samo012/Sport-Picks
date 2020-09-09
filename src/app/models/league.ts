import { Pick } from "./pick";

export class League {
  id: string;
  leagueId: string;
  name: string;
  created: number;
  added: number;
  rank = 1;
  type = "straight";
  permissions = 0;
  points = 0;
  sport: string;
  uid: string;
  username: string;
  creator: string;
  og: boolean;
  picks: Pick[] = [];
  edit?: boolean;
}
