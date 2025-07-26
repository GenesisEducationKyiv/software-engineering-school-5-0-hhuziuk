export interface WeatherInfo {
  temperature: number;
  humidity: number;
  description: string;
}

export interface EmailContext {
  greeting: string;
  city: string;
  unsubscribeUrl: string;
  weather: WeatherInfo;
}
