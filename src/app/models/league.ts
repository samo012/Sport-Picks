export class League {
  id: string;
  name: string;
  created: number;
  added: number;
  rank: number;
  points = 0;
  uid: string;
  creator: string;
  og: boolean;
  constructor(public isPrivate = false) {}
}

//Both Unranked - 1pt
//One Ranked - ranked-1, unranked-2
//Both Ranked - 2pt
//Both top 15 - 3pt
