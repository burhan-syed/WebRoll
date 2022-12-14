import type {
  Likes,
  SiteStatus,
  Sites,
  Categories,
  SessionRole,
  Reports,
  ReportType,
} from "@prisma/client";
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
  submittedAt: Date;
  updatedAt: Date;
  categories: {
    description: string | null;
    category: string;
  }[];
  tags: { tag: { tag: string } }[];
}
export interface SiteResDataWithLikes extends SiteResData {
  likes: number;
}

export interface minSiteResData {
  id: string;
  imgKey: string | null;
  url: string;
  name: string;
  description: string | null;
  allowEmbed: boolean;
  status: SiteStatus;
  categories: { category: string }[];
  tags: { tag: { tag: string } }[];
}
export interface minSiteResDataWithLikes extends minSiteResData {
  likes: Likes[];
}

export interface User {
  session: string;
  role: SessionRole;
  email: string;
  provider: string;
  iat: number;
}

enum Sorts {
  DATE,
  LIKES,
  VIEWS,
}
export interface SitesQuery {
  sort?: "DATE" | "LIKES" | "VIEWS";
  status?: SiteStatus[];
  categories?: number[];
  select?: number;
  cursor?: string;
}

export interface SitesQueryResponseData {
  data?: SiteResData[];
  nextCursor: string | undefined;
  total?: number;
}

export interface SiteResWithReportsData extends SiteResData {
  Reports: { type: ReportType }[];
}
export interface SiteReportsQueryResponseData {
  data?: SiteResWithReportsData[];
  nextCursor: string | undefined;
  total?: number;
}

export interface SiteFormData {
  url: string;
  sourceLink?: string;
  description?: string;
  categories: string[];
  tags: { name: string }[];
  privacy: boolean;
  captchaToken: string;
}

export interface HistoryPage {
  site: string;
  time: Date;
}
