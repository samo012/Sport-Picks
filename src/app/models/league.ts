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
  uid: string;
  username: string;
  creator: string;
  og: boolean;
  picks: { eventId: string; teamId: string }[];
}

//Both Unranked - 1pt
//One Ranked - ranked-1, unranked-2
//Both Ranked - 2pt
//Both top 15 - 3pt
