export interface ITokenService {
  generate(): string;
  getConfirmUrl(token: string): string;
  getUnsubscribeUrl(token: string): string;
}
