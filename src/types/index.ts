export interface SiteResData {
  tags: {
    tag: string;
  }[];
  url: string;
  name: string;
  description: string | null;
  categories: {
    category: string;
    description: string | null;
  }[];
}