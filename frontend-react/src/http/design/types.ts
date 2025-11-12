export interface DesignTemplate {
    id: number;
    name: string;
    description: string;
  }

export interface GeneratedImage {
  id: number;
  imageUrl: string;
  createdAt: string;
  isSaved: boolean;
}