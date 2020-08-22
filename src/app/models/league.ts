export class League {
  id: string;
  leagueId: string;
  name: string;
  created: number;
  added: number;
  rank: number;
  count = 0;
  points = 0;
  uid: string;
  username: string;
  creator: string;
  og: boolean;
  picks: { eventId: string; teamId: string }[];
  constructor(public isPrivate = false) {}
}

//Both Unranked - 1pt
//One Ranked - ranked-1, unranked-2
//Both Ranked - 2pt
//Both top 15 - 3pt
