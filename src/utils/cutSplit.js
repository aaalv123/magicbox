/**
 * @author mizhiyong
 * @Description
 * @date 2021/7/12 13:33
 */
class Block {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
}

function isCovered(b1, b2) {
  if (b2.y >= b1.y + b1.h || b2.y + b2.h <= b1.y) {
    return false;
  }
  if (b2.x >= b1.x + b1.w || b2.x + b2.w <= b1.x) {
    return false;
  }
  return true;
}

function isValid(b) {
  return b.w > 0 && b.h > 0;
}
function split(b, k) {
  /**
    * 左右block的高
  */
  let lrh = (b.y + b.h - k.y) < (k.y + k.h - b.y) ? (b.y + b.h - k.y) : (k.y + k.h - b.y);
  lrh = lrh < k.h ? lrh : k.h;
  const lry = k.y > b.y ? k.y : b.y;
  const top = new Block(b.x, b.y, b.w, k.y - b.y);
  const down = new Block(b.x, k.y + k.h, b.w, (b.y + b.h) - (k.y + k.h));
  const left = new Block(b.x, lry, k.x - b.x, lrh);
  const right = new Block(k.x + k.w, lry, (b.x + b.w) - (k.x + k.w), lrh);
  const filledList = [];
  if (isValid(top)) {
    filledList.push(top);
  }
  if (isValid(down)) {
    filledList.push(down);
  }
  if (isValid(left)) {
    filledList.push(left);
  }
  if (isValid(right)) {
    filledList.push(right);
  }
  return filledList;
}
/* eslint-disable no-loop-func */
export default function splitList(base, blankList) {
  console.log(base, blankList);
  let baseList = [];
  let filledList = [];
  filledList.push(base);

  for (let a = 0; a < blankList.length; a += 1) {
    const k = blankList[a];
    // }
    // blankList.forEach((k) => {
    baseList = filledList;
    filledList = [];
    baseList.forEach((b) => {
      /**
       * b 与 k之间没有覆盖，直接把b加入到filledList
       */
      if (!isCovered(b, k)) {
        filledList.push(b);
      } else {
        filledList.push(...split(b, k));
      }
    });
    /**
      * 没有需要填充的block了，直接返回
    */
    if (filledList.length === 0) {
      return [];
    }
  }
  return filledList;
}
