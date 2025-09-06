export interface StudentViewLoginDto{
  personalNumber: string;
  captchaToken?: string; // Přidáno pole pro token z Turnstile
}