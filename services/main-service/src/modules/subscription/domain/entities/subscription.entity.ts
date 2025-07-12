import { UpdateFrequency } from "../../../../shared/enums/frequency.enum";

export class Subscription {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly city: string,
    public readonly frequency: UpdateFrequency,
    public confirmed: boolean,
    public readonly token: string,
    public readonly createdAt: Date,
  ) {}

  confirm() {
    this.confirmed = true;
  }
}
