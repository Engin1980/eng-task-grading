export interface StudentViewLoginDto{
  studentNumber: string;
  captchaToken?: string; // Přidáno pole pro token z Turnstile
}