#! /usr/bin/env node
const program = require('commander');
const sourceMap = require('source-map');
const axios = require('axios');
const fs = require('fs');
const _ = require('lodash')
const http = axios.create({
  withCredentials: false,
  timeout: 30000
});

program
  .version('0.0.1')
  .option('-u, --url [url]', 'url地址', '')
  .option('-f, --filepath [filepath]', '文件路径', '')
  .option('-e, --error [error]', '错误信息')
  .option('-l, --line [line]', '行数', '')
  .option('-c, --column [column]', '列数', '')
  .parse(process.argv);

let url = program.url;
let filepath = program.filepath;

let error = program.error;
let line = Number(program.line);
let column = Number(program.column);

function getSourceMapObjByFileName(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err)
      }
      
      resolve(new sourceMap.SourceMapConsumer(JSON.parse(data)))
    });
  })
}

function getSourceMapObjByUrl(url) {
  console.log("从网络获取sourceMap数据", url);
  return http.get(url, {}).then(({data}) => {
    return new sourceMap.SourceMapConsumer(data)
  }).catch(err => {
    console.log("从网络下载sourceMap发生错误", url, err);
    throw(err)
  })
}

function getRealStackLine(sourceMapObj, stackLine) {
  // 期望格式: filepath:line:column
  let stackLineBlockArr = stackLine.split(":");

  // 符合期望格式
  if (stackLineBlockArr.length >= 3 && _.isNumber(Number(stackLineBlockArr[1])) && _.isNumber(Number(stackLineBlockArr[2]))) {
    let {source, line, column, name} = sourceMapObj.originalPositionFor({
      line: Number(stackLineBlockArr[1]),
      column: Number(stackLineBlockArr[2])
    });

    if (source && line && column) {
      return [source, name, line, column].join(":")
    } else {
      return stackLine;
    }
  } else {
    return stackLine;
  }
}

function getRealStack(sourceMapObj, stack) {
  let stackArr = stack.split("\n");
  return stackArr.map(stackLine => getRealStackLine(sourceMapObj, stackLine)).join("\n");
}



async function run() {
  try {
    let smc;

    if (url) {
      smc = await getSourceMapObjByUrl(url);
    } else if (filepath) {
      smc = await getSourceMapObjByFileName(filepath);
    }

    console.log("\n")
    console.log("################source map翻译结果################");
    if (error) {
      console.log(getRealStack(smc, error));
    } else {
      console.log(smc.originalPositionFor({
        line: line,
        column: column
      }));
    }
  } catch(err) {
    console.log("发生错误", err)
  }
}

if ((url || filepath) && (error || (line && column))) {
  run();
} else {
  console.log(`Usage: sourcemap [options]

Options:
  -V, --version              output the version number
  -u, --url [url]            url地址 (default: "")
  -f, --filepath [filepath]  文件路径 (default: "")
  -e, --error [error]        错误信息
  -l, --line [line]          行数 (default: "")
  -c, --column [column]      列数 (default: "")
  -h, --help                 display help for command

示例:
  sourcemap -u sourcemap的http地址 -e "错误栈字符串"
  sourcemap -u sourcemap的http地址 -c 391 -l 96
  sourcemap -f /Desktop/ios.bundle.map -e "错误栈字符串"
  sourcemap -f ./ios.bundle.map -c 391 -l 96
  `)
}