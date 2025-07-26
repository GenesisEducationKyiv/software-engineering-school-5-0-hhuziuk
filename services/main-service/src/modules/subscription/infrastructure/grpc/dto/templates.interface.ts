export interface EmailContext {
  city?: string;
  confirmUrl?: string;
  unsubscribeUrl: string;
  greeting?: string;
  weather?: {
    temperature: number;
    humidity: number;
    description: string;
  };
}
