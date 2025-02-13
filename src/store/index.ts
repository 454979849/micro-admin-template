import { getMenuTree } from '@/api/menu';
import { getUserInfo } from '@/api/userApi';
import { parseMenus, validateRoutes } from '@/router/helper';
import { MenuItemType, UserInfoType } from '@/types/common';
import Config from '@/utils/Config';
import Cookies from 'js-cookie';
import { defineStore } from 'pinia';

const useGlobalStore = defineStore({
  id: 'Store_Global',
  state: (): {
    menus: Array<MenuItemType>;
    permissions: Array<string>;
    userInfo: UserInfoType;
  } => ({
    /** 菜单 */
    menus: [],
    /** 权限 */
    permissions: [],
    /** 用户信息 */
    userInfo: {
      avatar: '',
      email: '',
      id: '',
      name: '',
      phone: '',
    },
  }),
  getters: {},
  actions: {
    updateMenu(menus: Array<MenuItemType>) {
      this.menus = menus;
    },
    updatePermissions(permissions: Array<string>) {
      this.permissions = permissions;
    },
    updateUserInfo(userInfo: UserInfoType) {
      this.userInfo = userInfo;
    },
    /**
     * 以下主应用才需要写
     */

    /** 加载菜单 */
    async loadMenu() {
      const res = await getMenuTree();
      // const res = await getUserMenus();
      if (res.code == 1 && res.data) {
        const _menus = res.data || [];
        // const _menus = res.data.menus || [];
        const permissions = res.data?.permissions || [];
        const menus = parseMenus(_menus);
        this.updateMenu(menus || []);
        this.updatePermissions(permissions);
        setTimeout(() => {
          validateRoutes(menus || []);
        }, 2000);
      }
      return res.code;
    },

    async loadUserInfo() {
      if (Cookies.get(Config.tokenKey) || true) {
        /** token存在 */
        const res = await getUserInfo();
        if (res.code == 1 && res.data) {
          /** 登录成功, 更新Global.user.info */
          this.updateUserInfo(res.data);
        }
        return res.code;
      }
    },
  },
  // 是否持久化
  persist: false,
});

export default useGlobalStore;
