let request = require('request-promise')
let cheerio = require('cheerio')
let fs = require('fs')

let pageInfo = { tag: '青山区', filename: 'qingshan' }

const pageUrlList = [
  'https://www.qingshan.gov.cn/sy/gsgg/202310/t20231031_2290879.shtml',
  'https://www.qingshan.gov.cn/sy/gsgg/202211/t20221104_2084820.shtml',
  'https://www.qingshan.gov.cn/sy/gsgg/202111/t20211117_1836317.shtml',
  'https://www.qingshan.gov.cn/sy/gsgg/202011/t20201106_1496251.shtml',
  'https://www.qingshan.gov.cn/zfxxgk/fdzdgknr/gysyjs/jy/ywjy/202004/t20200413_1016057.shtml'
]

async function getPage(url, num) {
  let html = await request({ url })
  console.log('连接成功！', `正在爬取第${num + 1}页数据`)
  let $ = cheerio.load(html)
  let pageNode = $('.content')
  let tableThNodes = pageNode.find('table tbody th')
  let tabletTdNodes = pageNode.find('table tbody td')
  let table = ''
  let tableTh = '|'
  let tableLine = '|'
  let tableTd = '|'

  tableThNodes.each((i, thNode) => {
    tableTh += $(thNode).text() + '|'
    tableLine += ':----:|'
  })
  tabletTdNodes.each((i, tdNode) => {
    tableTd += $(tdNode).text() + '|'
  })

  table = tableTh + `\n` + tableLine + `\n` + tableTd

  let title = pageNode.find('h2.tc').text()
  let abstract = ''
  let contentNodes = pageNode.find('.article1-box p')
  contentNodes.each((i, node) => {
    abstract += $(node).text() + `\n`
  })

  return { title, table, abstract }
}

async function main() {
  for (let i = 0; i < pageUrlList.length; i++) {
    let url = pageUrlList[i]
    let info = await getPage(url, i)
    const content = `---
title: ${info.title}
link: ${url}
date: ${info.date}
abstract: ${info.abstract}
tags: 
  - 武汉市
  - ${pageInfo.tag}
---

## ${info.title}

${info.table}

${info.abstract}
 
[原文链接](${url})
`
    let filename = `./${pageInfo.filename}-${+new Date()}-${i + 1}.md`
    fs.writeFile(filename, content, 'utf-8', () => {
      console.log(`生成${filename}文件成功！`)
    })
  }
}

main()
