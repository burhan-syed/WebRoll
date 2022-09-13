import type { SiteStatus } from "@prisma/client";

// export interface SiteResData {
//   tags: {
//     tag: string;
//   }[];
//   status: "REVIEW" | "APPROVED" | "QUARANTINE" | "BANNED";
//   url: string;
//   name: string;
//   description: string | null;
//   imgKey: string | null;
//   sourceLink: string | null;
//   categories: {
//     category: string;
//     description: string | null;
//   }[];
// }

export interface SiteResData {
  url: string;
  id: string;
  name: string;
  description: string | null;
  status: SiteStatus;
  imgKey: string | null;
  sourceLink: string | null;
  categories: {
    description: string | null;
    category: string;
  }[];
  tags: {
    tag: string;
  }[];
}
