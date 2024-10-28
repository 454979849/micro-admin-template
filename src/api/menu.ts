import request from '@/utils/request';

/**
 * 获取菜单树
 */
export function getMenuTree(params: any = {}) {
  return request('GET', '/menu/tree', params);
}
