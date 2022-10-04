import { parseTags } from '../metaparser/utils';
import prisma from '../utils/prisma';

export const diffTags = async ({
  siteID,
  tags,
}: {
  siteID: string;
  tags: string[];
}) => {
  const siteTags = await prisma.sites.findFirst({
    where: { id: siteID },
    select: { tags: { select: { tag: true } } },
  });
  const prevTags = siteTags?.tags.map((t) => t.tag.tag);
  const { cleanedTags } = parseTags(tags);
  let removedTags = [] as string[];
  let newTags = [] as string[];
  if (!prevTags) {
    return { newTags: cleanedTags, removedTags: undefined };
  }
  cleanedTags.forEach((t) => {
    if (!prevTags.includes(t)) {
      newTags.push(t);
    }
  });
  prevTags.forEach((t) => {
    if (!cleanedTags.includes(t)) {
      removedTags.push(t);
    }
  });

  return { removedTags, newTags };
};
