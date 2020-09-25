import { Team } from "./team";

export class SportsEvent {
  id: string;
  name: string;
  shortName: string;
  date: string;
  venue: string;
  visible: boolean;
  odds: string;
  headlines: {
    description: string;
    shortLinkText: string;
    video: any[];
  }[];
  leaders: { displayName: string; leaders: any[] }[];
  status: string;
  clock: string;
  period: number;
  teams: Team[];
  competitions?: any[];
}
