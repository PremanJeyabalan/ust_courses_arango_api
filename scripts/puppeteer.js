const puppeteer = require('puppeteer')
const {flatten} = require('lodash');

const courseCrawler = async ({page}) => {
    
    await page.waitForSelector('[class="attribute selectable"]')
   
    pre_ex = await page.evaluate(() => {
        var abc = document.querySelectorAll('[class="attribute selectable"]')
        let pre, ex = Array();
        abc.forEach((a)=>{
            if (a.innerText.includes('Prerequisites')){  
                if(a.querySelectorAll('[class="course-link"]')){
                    let c = Array();
                    a.querySelectorAll('[class="course-link"]').forEach((b) => {console.log(b.innerText); c.push(b.innerText)})
                    pre = c;
                }
            } else if (a.innerText.includes('Exclusions')){
                if(a.querySelectorAll('[class="course-link"]')){
                    let d = Array();
                    a.querySelectorAll('[class="course-link"]').forEach((b) => d.push(b.innerText))
                    ex = d
                }
            }
            
        })
        return [pre.flat(), ex.flat()]
    })
    
    return await pre_ex
    // console.log({Prerequisites: pre_ex[0], Exclusions: pre_ex[1]});

}

const courseListCrawler = async ({page, depCode}) => {

    await page.click(`li[data-value="${depCode}"]`)
    await page.waitForSelector('li[data-type="course-review"]');

    const courses = await page.evaluate(() => {
        let y = Array();
        const courseSelector = document.querySelectorAll('li[data-type="course-review"]').forEach((element) => {
            y.push(element.getAttribute("data-value"))
        })

        return y
    })

    await page.click('a[id="main-selector-previous"]');
    await page.waitForSelector('li[data-type="subject"]')

    return courses;
}

const siteCrawler = async () => {
    const browser = await puppeteer.launch({headless: true})
    const page = await browser.newPage()

    
    await page.goto('https://ust.space/review')
    await page.type('input[name=username]', 'pjab')
    await page.type('input[name=password]', 'Iloveamma2001')
    await page.keyboard.press('Enter')
    await page.waitForSelector('div[class="most-popular"]')


    const departmentList = await page.evaluate(() => {
        const departmentSelector = document.querySelector('ul[id="main-selector-list"]');
        let y = Array();
        departmentSelector.querySelectorAll('li[data-type="subject"]').forEach((element) => {
            y.push(element.getAttribute("data-value"))
        })

        return y;
    })

    let fullCourses = Array();

    for (let depCode of departmentList){
        const courses = await courseListCrawler({page, depCode})

        fullCourses.push(courses.flat());
    }

    await browser.close();

    return flatten(fullCourses)

    
}


module.exports = {
    siteCrawler,
    courseListCrawler,
    courseCrawler
}