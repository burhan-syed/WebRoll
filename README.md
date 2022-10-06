<div align="center">  
    <a href="https://webroll.io" target="_blank" ><img src="/public/android-chrome-512x512.png" alt="" width="128" height="128"  /></a>
    <h1>WebRoll</h1>
</div>

A place to gather and discover commendable creations on the internet.

## Description

### The Website

WebRoll.io allows users to submit websites for others to discover. When submitting, you are asked to select from a predefined list of categories and freely enter tags to properly catalogue the site. WebRoll then parses the site and submits it into a queue for moderators of WebRoll to review. If the submission is approved the site will be available for discovery.  
Users of WebRoll.io discover sites simply by pressing the "Next" button on the explore page. A site is randomly shown from the database of approved sites. Users have the ability to narrow the scope of websites shown by selecting from the preset categories. Users are also able to save sites by leaving a like and leave suggestions to correct miss-labeled categories, tags, or broken websites with a report button.
Every submitted site also creates a unique page in the /sites directory with information such as how many times the site was viewed as users were "rolling" on the explore page and the number of likes it has received. This page is also shareable.

### Primary Technologies

This site was built with Astro and React with Typescript. It was styled with DaisyUI and TailwindCSS.
The MySQL database is queried and managed with Prisma. Rate-limiting is handled with an Upstash Redis cache.
Playwright is used to screenshot sites for backup images in case embedding is not possible. This is maintained on a separate Fastify server ([repo here](https://github.com/burhan-syed/webroll-parser)) due to size limitations with Vercel's serverless AWS Lambda functions. All screenshots are stored in a S3 bucket.

## Getting Started

### Installing

Clone this repo. If you want to screenshot sites follow directions to ([setup this repo as well](https://github.com/burhan-syed/webroll-parser)).

### Executing program

- Follow the .example.env file to create a .env with all necessary environment variables. Only the DATABASE_URL is strictly necessary but others are needed for AWS, authentication, and email service. If no Upstash variables are provided you will need to clear the rate-limit check.
- To install and run:

```
yarn
yarn dev
```

or

```
npm install
npm run dev
```

## Version History
- 0.2
  - History Page
- 0.1
  - Initial Release

## Roadmap

- [x] History page to easily find previous rolls.
- [ ] Search by tags
- [ ] General search
- [ ] Aggregate sites performance page (likes, views)
- [ ] User created custom collections

## Acknowledgments

This project was heavily inspired by [CloudHiker](https://cloudhiker.net)

Libraries:

- [Astro](https://github.com/withastro/astro)
- [React](https://github.com/facebook/react)
- [TailwindCSS](https://github.com/tailwindlabs/tailwindcss)
- [DaisyUI](https://github.com/saadeghi/daisyui)
- [React-Hook-Form](https://github.com/react-hook-form/react-hook-form)
- [Tanstack/Query](https://github.com/TanStack/query)
- [Tanstack/Virtual](https://github.com/TanStack/virtual)
- [Prisma](https://github.com/prisma/prisma)
- [Upstash/Ratelimit](https://github.com/upstash/ratelimit)
- [Nodemailer](https://github.com/upstash/ratelimit)
- [Astro-Auth](https://github.com/astro-community/astro-auth)
