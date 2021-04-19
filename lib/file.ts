import * as fs from 'fs';
import * as path from 'path';

export const tempDirpath = '.temp';
export const tempApolloConfigFileName = 'apollo_config.json';

/**
 * 同步写文件内容
 * @param {string} path 路径
 * @param {object} data 数据
 */
export function writeFileSync(path, data) {
  if (path == null || path == undefined) {
    return;
  }
  try {
    if (isObject(data)) {
      data = JSON.stringify(data, null, 2);
    }
    fs.writeFileSync(path, data);
  } catch (error) {
    console.log('writeFileSync error', error);
  }
}

/**
 * 同步读取文件内容
 * @param {string} path 路径
 */
export function readFileSync(path) {
  let data = fs.readFileSync(path);
  try {
    data = JSON.parse(data);
  } catch (error) {
    console.log('readFileSync error', error);
  }
  return data;
}

/**
 * 路径是否存在，不存在则创建
 * @param {string} dir 路径
 */
export async function dirExists(dir) {
  let isExists = await getStat(dir);
  //如果该路径且不是文件，返回true
  if (isExists && isExists.isDirectory()) {
    return true;
  } else if (isExists) {
    //如果该路径存在但是文件，返回false
    return false;
  }
  //如果该路径不存在，拿到上级路径
  let tempDir = path.parse(dir).dir;
  //递归判断，如果上级目录也不存在，则会代码会在此处继续循环执行，直到目录存在
  let status = await dirExists(tempDir);
  let mkdirStatus;
  if (status) {
    mkdirStatus = await mkdir(dir);
  }
  return mkdirStatus;
}

function isObject(s) {
  return {}.toString.call(s) === '[object Object]';
}

/**
 * 读取路径信息
 * @param {string} path 路径
 */
function getStat(path) {
  return new Promise((resolve) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        resolve(false);
      } else {
        resolve(stats);
      }
    });
  });
}

/**
 * 创建路径
 * @param {string} dir 路径
 */
function mkdir(dir) {
  return new Promise((resolve) => {
    fs.mkdir(dir, (err) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}
