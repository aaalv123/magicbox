/* eslint-disable import/prefer-default-export */
// 字符替换成数字
export function replaceToNumber(value) {
  return value.replace(/\D/g, '');
}
// 输入字符为数字，不能0开头
export function replaceToNumberNotZero(value) {
  return value.replace(/^0+|\D/g, '');
}
// 秒转换为00:00:00格式的时分秒
export function formatMsToHHmmss(secondTime) {
  // const time = msTime / 1000;
  const second = `0${Math.floor(secondTime) % 60}`.slice(-2);
  const minute = `0${Math.floor(secondTime / 60) % 60}`.slice(-2);
  const hour = `0${Math.floor(secondTime / 60 / 60)}`.slice(-2);
  return `${hour}:${minute}:${second}`;
}
