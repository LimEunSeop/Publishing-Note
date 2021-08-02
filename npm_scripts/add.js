const readlineSync = require('readline-sync')
const fs = require('fs')
const path = require('path')

// 프로젝트명 입력: 프로젝트명 이미 존재하면 다시 입력
let project_name = null
do {
  if (project_name !== null) {
    console.log(`Project named ${project_name} already exists!`)
  }
  project_name = readlineSync.question('Project Name: ')
} while (fs.existsSync(path.join('projects', project_name)))

// 템플릿 생성
if (!fs.existsSync('projects')) {
  fs.mkdirSync('projects')
}

fs.mkdirSync(path.join('projects', project_name))
fs.mkdirSync(path.join('projects', project_name, 'scss'))
fs.appendFileSync(
  path.join('projects', project_name, 'index.html'),
  `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="initial-scale=1.0,user-scalable=no,maximum-scale=1,width=device-width"
    />
    <link rel="stylesheet" href="css/style.css" />
    <title>${project_name}</title>
  </head>
  <body></body>
</html>
`
)
fs.appendFileSync(
  path.join('projects', project_name, 'scss', 'index.scss'),
  `@import '../../../styles/normalize.scss';
@import '../../../styles/common.scss';`
)
console.log(`Project ${project_name} has made successfully!`)
