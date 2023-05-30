import defaultSettings from '@/settings'

const title = '空闲停车位实时查询后台管理系统'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
