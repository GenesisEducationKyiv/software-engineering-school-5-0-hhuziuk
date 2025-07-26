export class Weather {
  constructor(
    public readonly city: string,
    public readonly temperature: number,
    public readonly humidity: number,
    public readonly description: string,
    public readonly fetchedAt: Date,
  ) {}
}
