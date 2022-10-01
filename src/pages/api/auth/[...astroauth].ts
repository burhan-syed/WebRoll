import AstroAuth from "@astro-auth/core";
import { CredentialProvider } from "@astro-auth/providers";
import { comparePassword } from "../../../server/utils/passwordHasher";
import prisma from "../../../server/utils/prisma";

export const all = AstroAuth({
  authProviders: [
    CredentialProvider({
      authorize: async (properties) => {
        if (!properties.password || !properties.email) {
          return null;
        }
        const account = await prisma.accounts.findFirst({
          where: { email: properties.email },
          include: { sessions: true },
        });
        if (!account) {
          return null;
        }

        if (!(await comparePassword(properties.password, account.password))) {
          return null;
        }

        if (account.status === "PENDING") {
          return null;
        }

        return {
          session: account.sessions[0].id,
          role: account.sessions[0].role,
          email: account.email,
        };
      },
    }),
  ],
  hooks: {
    // signIn: async (user) => {
    //   return true;
    // },
    jwt: async (user) => {
      return {
        ...user,
      };
    },
  },
});
