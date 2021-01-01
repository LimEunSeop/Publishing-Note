const { Builder } = require('selenium-webdriver')
const fs = require('fs')
const findChromeVersion = require('find-chrome-version')
const path = require('path')
const liveServer = require('live-server')
const { hashElement } = require('folder-hash')
const cheerio = require('cheerio')
const sharp = require('sharp')

const params = {
  port: 8181, // Set the server port. Defaults to 8080.
  host: '0.0.0.0', // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
  open: false, // When false, it won't load your browser by default.
  file: 'index.html', // When set, serve this file (server root relative) for every 404 (useful for single-page applications)
  wait: 1000, // Waits for all changes, before reloading. Defaults to 0 sec.
  logLevel: 0, // 0 = errors only, 1 = some, 2 = lots
  middleware: [
    function (req, res, next) {
      next()
    },
  ], // Takes an array of Connect-compatible middleware that are injected into the server middleware stack
}
liveServer.start(params)

if (!fs.existsSync('projects')) {
  console.log("there's no project to build")
  process.exit()
}

if (!fs.existsSync('images')) {
  fs.mkdirSync('images')
}

if (!fs.existsSync('.projectcache')) {
  fs.writeFileSync('.projectcache', '{}')
}

const projects = fs.readdirSync('projects')
let projectCache = fs.readFileSync('.projectcache')
try {
  projectCache = JSON.parse(projectCache)
} catch (e) {
  projectCache = {}
}

;(async function () {
  let driver = null
  try {
    driver = await new Builder().forBrowser('chrome').build()
  } catch (e) {
    const chromeVersion = await findChromeVersion()
    console.error(
      `Chrome Driver is not valid. Please download the driver in following URL and place it in the Project Root. http://chromedriver.storage.googleapis.com/index.html?path=${chromeVersion}/`
    )
    console.error(e.message)
    return
  }

  try {
    for (let i = 0; i < projects.length; i++) {
      const projectHash = (
        await hashElement(path.join('projects', projects[i]))
      ).hash
      if (
        fs.existsSync(path.join('images', projects[i] + '.png')) &&
        projectCache[projects[i]] &&
        projectCache[projects[i]] === projectHash
      ) {
        continue
      }
      projectCache[projects[i]] = projectHash

      await driver.get(`http://0.0.0.0:8181/projects/${projects[i]}`)
      const screenshot_base64 = await driver.takeScreenshot()
      sharp(Buffer.from(screenshot_base64, 'base64'))
        .resize(300)
        .toFile(path.join('images', projects[i] + '.png'), (err, info) => {
          console.log(`a thumbnail of ${projects[i]} created`)
        })
    }
  } finally {
    await driver.quit()
    liveServer.shutdown()
  }

  fs.writeFileSync('.projectcache', JSON.stringify(projectCache))

  if (!fs.existsSync('index.html')) {
    fs.writeFileSync(
      'index.html',
      `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="initial-scale=1.0,user-scalable=no,maximum-scale=1,width=device-width"
    />

    <link rel="stylesheet" href="styles/style.css" />
    <title>Publishing Projects</title>
  </head>
  <body></body>
</html>`
    )
    console.log('No index.html, created a new one.')
  } else {
    fs.copyFileSync('index.html', 'index.html.backup')
    console.log("backup file 'index.html.backup' is made.")
  }

  const $ = cheerio.load(fs.readFileSync('index.html'))
  let $projects = $('#projects')
  if ($('#projects').length === 0) {
    $('body').append('<div id="projects"></div>')
    $projects = $('#projects')
    console.log(
      "Element that has selector '#projects' is not detected. So I appended a new one to the body."
    )
  }

  const $list = $('<ul></ul>')
  projects.forEach((project_name) => {
    const itemHTML = `
      <li>
        <a href="/projects/${project_name}">
          <figure>
            <img src="/images/${project_name}.png" />
            <figcaption>${project_name}</figcaption>
          </figure>
        </a>
      </li>
    `
    $list.append(itemHTML)
  })
  $projects.wrapInner($list)
  fs.writeFileSync('index.html', $.html())
  console.log('Project index successfully generated!')
})()
