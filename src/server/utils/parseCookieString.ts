export const parseCookie = (str: string) => {
  if (!str) return {};
  return str
    .split(";")
    .map((v) => v.split("="))
    .reduce(
      (
        acc: {
          [key: string]: string;
        },
        v
      ) => {
        acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
        return acc;
      },
      {}
    );
};

export const getWebRollSession = (cookie: string | undefined | null) => {
  return parseCookie(cookie ?? "")?.["webroll_session"]?.split(".")?.[0];
};

