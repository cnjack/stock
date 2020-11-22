const apiUrl = 'http://qt.gtimg.cn/' // 接口地址
const timeSpan = 3000 // 时间间隔
const stockIndex = ['1.000001', '0.399001', '0.399006'] // 三大指数

/**
 * 比较两个金额大小并返回相应类名
 * @param value 被比较值
 * @param compare 比较值
 * @returns {string} 类名
 */
const comparePrice = (value: number, compare: number): string => {
  return value > compare ? 'gain-more' : (value < compare ? 'gain-less' : '')
}

/**
 * 将金额转为万为单位
 * @description 有万则加万字，没有则不显示万字
 * @param number {string|number} - 需要被转换的金额
 * @return {string} 返回转换后的金额字符串
 */
const transVolume = (number: string): string => {
  number = parseInt(number) + ''
  if (number.length > 4) {
    const integer = number.substring(0, number.length - 4)
    const decimal = integer.length > 3 ? '' : ('.' + number.substring(number.length - 5, number.length - 3))
    return integer + decimal + '万'
  } else {
    return number
  }
}

/**
 * 转换日期时间字符串
 * @param str {string} - 需要转换的时间字符串
 * @returns {string} - 转换后的时间字符串
 */
const transDate = (str: string): string => {
  const year = str.substring(0, 4)
  const month = str.substring(4, 6)
  const day = str.substring(6, 8)
  const hour = str.substring(8, 10)
  const minute = str.substring(10, 12)
  const second = str.substring(12, 14)
  return `${year}年${month}月${day}日 ${hour}:${minute}:${second}`
}

/**
 * 获取市场名称
 * @param code {string} - 市场代码
 * @returns {string} - 中文市场名称
 */
const transMarketName = (code: string): string => {
  switch (code) {
    case 'sh':
      return '上证'
    case 'sz':
      return '深证'
    case 'hk':
      return '港股'
    default:
      return ''
  }
}

export {
  apiUrl,
  timeSpan,
  stockIndex,
  comparePrice,
  transVolume,
  transDate,
  transMarketName
}
