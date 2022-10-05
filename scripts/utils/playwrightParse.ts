import chrome from 'chrome-aws-lambda'
import { chromium } from 'playwright-core'
import he from 'he'; 
import { compressImage } from '../../src/server/utils/images';
import { putImageObject } from './awsUpload';

const decode = (str:string) => {
  const text = he.decode(str)
  return text
}

export default async function grabScreenAndData ({ params, url }: {params:{colorScheme?:"light" | "dark" | "no-preference" | null | undefined,skipCookieBannerClick?:boolean}, url:string}) {
  const { colorScheme, skipCookieBannerClick } = params
  const metadata = {} as any; 
  const checkMetas = (html:string) => {
    const headText = html.split('</head>')?.[0] ?? ''
    const head = decode(headText)
    const metas = head.split('<meta ')
    metas.forEach((meta, i) => {
      if (i === 0) return
      meta.replace(
        /(property|name)="(.*?)".+content="(.*?)".*\/>/gim,
        (match, p0, p1, p2) => {
          //console.log('type', p1, 'P2', p2)
          if (!metadata?.[p1] || p2?.length > metadata[p1]?.length) {
            metadata[p1] = p2
          }
          return ''
        }
      )
    })
    const siteTitle = head?.split('<title>')?.[1]?.split('</title>')?.[0]
    metadata['title'] = siteTitle
  }
  const browser = await chromium.launch({
    args: chrome.args,
    executablePath:
      // process.env.NODE_ENV !== 'development'
      //   ? await chrome.executablePath
      //   : 
        process.platform === 'win32'
        ? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
        : process.platform === 'linux'
        ? '/usr/bin/google-chrome'
        : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    //ignoreHTTPSErrors: true,
  })

  const page = await browser.newPage({
    viewport: {
      width: 1920,
      height: 1080,
    },
    deviceScaleFactor: 1,
  })
  if (colorScheme) {
    await page.emulateMedia({ colorScheme })
  }
  const res = await page.goto(url)
  if(!res){
    throw new Error(`No page response: ${url}`)
  }
  // Accepting cookie banners
  if (!skipCookieBannerClick) {
    const selectors = [
      '[id*=cookie] a',
      '[class*=consent] button',
      '[class*=cookie] a',
      '[id*=cookie] button',
      '[class*=cookie] button',
    ]

    const regex =
      /(Accept all|I agree|Accept|Agree|Agree all|Ich stimme zu|Okay|OK)/

    const elements = await page.$(`'${selectors.join(', ')}'`) as unknown as any[]
    if (elements) {
      for (const el of elements) {
        const innerText = (await el.getProperty('innerText')).toString()
        regex.test(innerText) && el.click()
      }
    }

  }
  // Snap screenshot
  const xFrameOptions = res.headers()?.["x-frame-options"]
  const resURL = res.url(); 
  const imageBuffer = await page.screenshot({ type: 'jpeg', quality: 80, path: `./scripts/utils/screens/${resURL.toString().replace(/\./g,"_").replace(/\//g,"").replace("https:","").replace("http","")}.jpeg` })
  //const base64data = buffer.toString('base64')
  const html = await res.text()
  await checkMetas(html)
  await page.close()
  await browser.close()

  return { metadata, imageBuffer, xFrameOptions, resURL }
}

// (async() => {
//   const {metadata, imageBuffer, xFrameOptions, resURL} = await grabScreenAndData({params: {skipCookieBannerClick: false}, url: 'https://amazon.com'});
//   console.log("grabbed?",resURL)
//   const compressed = await compressImage(imageBuffer);
//   console.log("compressed?", compressed); 
//   const uploadKey = await putImageObject({
//     image: compressed,
//     siteURL: resURL,
//   });
//   console.log("uploaded", uploadKey); 
// })()
