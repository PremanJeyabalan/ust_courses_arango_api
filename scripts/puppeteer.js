const puppeteer = require('puppeteer')
const {flatten} = require('lodash');
require('dotenv').config()


const courseCrawler = async ({page, code}) => {
    await page.goto(`https://ust.space/review/${code}`);
    await page.waitForSelector('h3[class="selectable"]')
   
    pre_ex = await page.evaluate(() => {
        var abc = document.querySelectorAll('[class="attribute selectable"]')
        let pre, ex = Array();
        abc.forEach((a)=>{
            if (a.innerText.includes('Prerequisites')){  
                if(a.querySelectorAll('[class="course-link"]')){
                    a.querySelectorAll('[class="course-link"]').forEach((b) => {console.log(b.innerText); pre.push(b.innerText)}, pre)
                }
            } else if (a.innerText.includes('Exclusions')){
                if(a.querySelectorAll('[class="course-link"]')){
                    a.querySelectorAll('[class="course-link"]').forEach((b) => ex.push(b.innerText), ex)
                }
            }
            
        })
        return [pre, ex]
    })
    
    return {code, Prerequisites: pre_ex[0], Exclusions: pre_ex[1]}

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

const initPup = async () => {
    const browser = await puppeteer.launch({headless: false})
    const page = await browser.newPage()

    
    await page.goto('https://ust.space/review')
    await page.type('input[name=username]', process.env.USTSPACE_USERNAME)
    await page.type('input[name=password]', process.env.USTSPACE_PASSWORD)
    await page.keyboard.press('Enter')
    await page.waitForSelector('div[class="most-popular"]')

    return  {browser, page}
}

const getDepartments = async ({page}) => {
    const departmentList = await page.evaluate(() => {
        const departmentSelector = document.querySelector('ul[id="main-selector-list"]');
        let y = Array();
        departmentSelector.querySelectorAll('li[data-type="subject"]').forEach((element) => {
            y.push(element.getAttribute("data-value"))
        })

        return y;
    })

    return departmentList;

}

const getCourseList = async ({page, departmentList}) => {
    let fullCourses = Array();

    for (let depCode of departmentList){
        const courses = await courseListCrawler({page, depCode})

        fullCourses.push(courses);
    }
    return flatten(fullCourses);
}

const siteCrawler = async () => {
    const {browser, page} = await initPup();

    // const departmentList = await getDepartments({page});
    
    // const fullCourses =  await getCourseList({page, departmentList});

    let courseRelation = Array();

    // for (code of fullCourses){
        const course = await courseCrawler({page, code: 'MATH1012'})
        courseRelation.push(course);
    // }



    await browser.close();

    return courseRelation
}


module.exports = {
    siteCrawler,
}