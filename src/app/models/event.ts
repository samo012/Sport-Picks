import { Team } from "./team";

export class SportsEvent {
  id: string;
  name: string;
  shortName: string;
  date: string;
  venue: string;
  visible: boolean;
  status: string;
  clock: string;
  period: number;
  teams: Team[];
  competitions?: any[];
}
