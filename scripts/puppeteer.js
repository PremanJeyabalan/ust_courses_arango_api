const puppeteer = require('puppeteer')
const {flatten} = require('lodash');
require('dotenv').config()
const db = require('../db/arangoConn');


const courseCrawler = async ({page, code}) => {
    await page.goto(`https://ust.space/review/${code}`);
    await page.waitForSelector('h3[class="selectable"]')
   
    pre_ex = await page.evaluate(() => {
        var abc = document.querySelectorAll('[class="attribute selectable"]')
        const pre = Array();
        const ex = Array();
        abc.forEach((a)=>{
            if (a.innerText.includes('Prerequisites')){  
                if(a.querySelectorAll('[class="course-link"]')){
                    a.querySelectorAll('[class="course-link"]').forEach((b) => {console.log(b.innerText); pre.push(b.innerText)})
                }
            } else if (a.innerText.includes('Exclusions')){
                if(a.querySelectorAll('[class="course-link"]')){
                    a.querySelectorAll('[class="course-link"]').forEach((b) =>ex.push(b.innerText))
                }
            }
            
        },)
        return [pre, ex]
    })
    
    return {code, prereqs: pre_ex[0], exclusions: pre_ex[1]}

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
    const browser = await puppeteer.launch({headless: true})
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

    console.log("Getting departments...")

    const departmentList = await getDepartments({page});
    console.log(departmentList)

    console.log("Success!")

    await departmentList.forEach(async (dept) => {
        const col = db.collection(dept);
        if(!col.exists()){
            await col.create();
        }
        
    })

    console.log("Getting courses...")
    
    const fullCourses =  await getCourseList({page, departmentList});
    console.log(fullCourses);

    console.log("Success!")

    let courseRelation = Array();

    console.log("Getting course details, this could take awhile...")

    for (code of fullCourses){
        const course = await courseCrawler({page, code})
        console.log(course);
        courseRelation.push(course);
    }

    console.log("Success! Closing script...")



    await browser.close();

    return courseRelation
}


module.exports = {
    siteCrawler,
}