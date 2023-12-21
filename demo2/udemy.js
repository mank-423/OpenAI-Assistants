// import the package
import UdemyCrawler from 'udemy-crawler'

// const url = "https://www.udemy.com/course/the-complete-web-development-bootcamp"
const url_check = "https://www.udemy.com/success-life/"

// apply options
const crawler = new UdemyCrawler({
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
    'upgrade-insecure-requests': 1
  }
})

// execute crawler
const scrapeUdemyCourseToJSON = async url => {
  return crawler.execute(url, (err, course) => {
    if (err) {
      return console.error(err.message)
    }
    console.log('Finishing scraping...', course)
    // return course
  })
}

const udemyCourseContents = await scrapeUdemyCourseToJSON(url_check);