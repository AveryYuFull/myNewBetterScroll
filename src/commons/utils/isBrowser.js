/**
 * 是否是浏览器环境
 * @returns {Boolean} 返回运行环境是否在浏览器
 */
export default function isBrowser () {
    return typeof window !== 'undefined';
}
