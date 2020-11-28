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
//#endregion

const getContent = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(wildBerriesUrl);
    await page.waitForSelector('.ref_goods_n_p, .j-open-full-product-card')
    const arr = await page.$$('.ref_goods_n_p, .j-open-full-product-card')
    const linksArrJsHandles = await Promise.all(arr.map(element => element.getProperty('href')))
    // @ts-ignore
    const linksArr = await Promise.all(linksArrJsHandles.map(handle => handle.jsonValue()))
    // console.log(linksArr);
    const secondLinks = [linksArr[0]]

    let shoes = []

    for (const link of secondLinks) {
        await page.goto(link)
        await page.waitForSelector('.product-content-v1 > .card-row > .first-horizontal > .brand-and-name > .name')
        const brandElement = await page.$('.product-content-v1 > .card-row > .first-horizontal > .brand-and-name > .brand')
        const descriptionElement = await page.$('.product-content-v1 > .card-row > .first-horizontal > .brand-and-name > .name')

        const sizesList = await page.$eval('.product-content-v1 > .card-row > .card-right > .i-sizes-block-v1 > .j-size-list', list => {
            const sizesArray = []
            // return list.children.length
            for (const sizeElement of list.children) {
                if (!Object.values(sizeElement.classList).includes('disabled')) {
                    sizesArray.push(sizeElement.innerText.trim())
                }
            }
            return sizesArray
        })

        console.log(sizesList);

        const brandName = await page.evaluate(element => element.textContent, brandElement);
        const descriptionText = await page.evaluate(element => element.textContent, descriptionElement)

        const shoeInfo = {
            brand: brandName,
            brandDescription: descriptionText,
            sizesList
        }

        shoes.push(shoeInfo)
    }

    console.log(shoes);


    // const nextPage = await page.$('.pagination-next')
    // const singleLinkJs = await Promise.resolve(nextPage)
    // const singleLink = await  Promise.resolve(singleLinkJs.jsonValue())
    // console.log(singleLinkJs);
    await browser.close();
}

getContent()
