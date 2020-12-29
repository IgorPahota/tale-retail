const puppeteer = require('puppeteer');

/**
 * wildberries
 * men shoes
 * brands: adidas, nike, puma, asics, asics tiger, diadora, reebok, new balance
 * url:
 * https://www.wildberries.ru/catalog/obuv/muzhskaya?fbrand=21;61;2428;6158;1616;671;758;777
 */

//#region global constants
const wildBerriesUrl = 'https://www.wildberries.ru/catalog/obuv/muzhskaya?fbrand=21;61;2428;6158;1616;671;758;777'
const waitSelectorTimeout = 5000
const args = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-infobars',
    '--window-position=0,0',
    '--ignore-certifcate-errors',
    '--ignore-certifcate-errors-spki-list',
    '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
];

const options = {
    args,
    headless: false,
    ignoreHTTPSErrors: true,
    userDataDir: './tmp'
};
//#endregion

const getContent = async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto(wildBerriesUrl);
    await page.setViewport({width: 1440, height: 764})

    // await page.waitForNavigation()
    const selectorString = '#catalog-content > .pager-bottom > .pager > .pageToInsert > .pagination-next'

    let shoes = []

    const getShoes = async () => {
        await page.waitForSelector('.ref_goods_n_p, .j-open-full-product-card')
        const arr = await page.$$('.ref_goods_n_p, .j-open-full-product-card')
        const linksArrJsHandles = await Promise.all(arr.map(element => element.getProperty('href')))
        // @ts-ignore
        const linksArr = await Promise.all(linksArrJsHandles.map(handle => handle.jsonValue()))
        //secondLinks - array for quick testing
        // const secondLinks = [linksArr[0]]

        for (const link of linksArr) {
            const pageForCurrentShoe = await browser.newPage()
            await pageForCurrentShoe.goto(link)
            await pageForCurrentShoe.waitForSelector('.product-content-v1 > .card-row > .first-horizontal > .brand-and-name > .name')
            const brandElement = await pageForCurrentShoe.$('.product-content-v1 > .card-row > .first-horizontal > .brand-and-name > .brand')
            const descriptionElement = await pageForCurrentShoe.$('.product-content-v1 > .card-row > .first-horizontal > .brand-and-name > .name')
            const brandName = await pageForCurrentShoe.evaluate(element => element.textContent, brandElement);
            const descriptionText = await pageForCurrentShoe.evaluate(element => element.textContent, descriptionElement)
            const availableSizes = await pageForCurrentShoe.$eval('.product-content-v1 > .card-row > .card-right > .i-sizes-block-v1 > .j-size-list', list => {
                const innerAvailableSizes = []
                for (const sizeElement of list.children) {
                    if (!Object.values(sizeElement.classList).includes('disabled')) {
                        innerAvailableSizes.push(sizeElement.innerText)
                    }
                }
                return innerAvailableSizes
            })

            const shoeInfo = {
                brand: brandName,
                brandDescription: descriptionText,
                availableSizes
            }
            shoes.push(shoeInfo)
            // console.log('<<<<<SHOES ARRAY',shoes);
            await pageForCurrentShoe.close()
        }
        // console.log('<<<<<SHOES ARRAY',shoes);
    }

    const interval = setInterval( () => {
            getShoes().then(() => {
                 page.$eval(selectorString, nextPageElement => {
                    nextPageElement.click()
                }).catch(e => {
                    console.log('Error inside eval', e)
                     clearInterval(interval)
                      browser.close();
                 })
            }).catch(e => {
                console.log('Error inside getShoes', e)
                clearInterval(interval)
                 browser.close();
            })
    }, 2000)

    // await browser.close();
}

getContent().catch(err => console.log(err))