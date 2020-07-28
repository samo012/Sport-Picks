import { User } from "./user";

export class League {
  id: string;
  name: string;
  created: number;
  uid?: string;
  rank?: number;
  users?: User[];
  constructor(public isPrivate = false) {}
}
