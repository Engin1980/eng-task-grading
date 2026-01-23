export interface AppLogDto {
  id: number;
  message: string | null;
  messageTemplate: string | null;
  level: string | null;
  timeStamp: Date | null;
  exception: string | null;
  properties: string | null;
  sourceContext: string | null;
}
