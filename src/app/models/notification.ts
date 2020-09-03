export class Notification {
  id: string;
  constructor(
    public title: string,
    public recipient: string,
    public created = Date.now()
  ) {}
}
