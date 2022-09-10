export interface SiteResData {
  tags: {
    tag: string;
  }[];
  status: "REVIEW" | "APPROVED" | "QUARANTINE" | "BANNED";
  url: string;
  name: string;
  description: string | null;
  imgKey: string | null;
  sourceLink: string | null;
  categories: {
    category: string;
    description: string | null;
  }[];
}