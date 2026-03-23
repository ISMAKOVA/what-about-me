export type Beat = {
  id: string;
  title: string;
  bpm: number;
  youtubeUrl?: string;
  image?: string;
  type: string;
  previewUrl: string; // public preview mp3 path
  tags?: string[];
  price?: number; // USD
};
