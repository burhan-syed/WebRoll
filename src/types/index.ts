import type { Likes, SiteStatus, Sites, Categories } from "@prisma/client";
export interface SiteResData {
  url: string;
  id: string;
  name: string;
  description: string | null;
  views: number;
  status: SiteStatus;
  imgKey: string | null;
  sourceLink: string | null;
  allowEmbed: boolean;
  categories: {
    description: string | null;
    category: string;
  }[];
  tags:{ tag: { tag: string; }; }[]
}
export interface SiteResDataWithLikes extends SiteResData {
  likes: number;
}

export interface minSiteResData {
    id: string,
    imgKey: string | null,
    url: string,
    name: string,
    description: string | null,
    allowEmbed: boolean,
    status: SiteStatus;
    categories: { category: string; }[],
  
}
export interface minSiteResDataWithLikes extends minSiteResData {
  likes: Likes[];
}
