export class Notification {
  id: string;
  day: string;
  constructor(
    public title: string,
    public recipient: string,
    public token: string,
    public leagueId: string,
    public body?: string,
    public created = Date.now()
  ) {}
}