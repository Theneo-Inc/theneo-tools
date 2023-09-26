export interface ProfileConfig {
  token: string;
  apiUrl?: string;
  appUrl?: string;
}

export interface Profile {
  token: string;
  apiUrl: string;
  appUrl: string;
}

export interface TheneoConfig {
  readonly profiles: Record<string, ProfileConfig>;
}
