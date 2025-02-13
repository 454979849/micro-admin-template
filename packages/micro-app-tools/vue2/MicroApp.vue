<template>
  <div
    class="__micro-app-container __content"
    v-if="getAppIsInConfig() || _forceInit"
  >
    <!-- micro-app子应用 -->
    <component
      :class="[{ '__micro-app': subAppStatus === 'mounted' }]"
      :is="MicroAppConfig.tagName"
      v-if="subAppSettting"
      :default-page="defaultPage"
      :keep-alive="_keepAlive"
      :name="nameWithPrefix"
      :iframe="subAppSettting?.iframe"
      :url="subAppSettting?.urlMap[_env || MicroAppConfig.env]"
      :inline="MicroAppConfig.env === 'localhost'"
      :destroy="_destroy"
      :clearData="_clearData"
      :router-mode="_routerMode || isSubApp ? 'pure' : 'search'"
      :disable-scopecss="_disableScopecss"
      @mounted="microAppMounted"
      @unmount="microAppUnmount"
      @error="microAppError"
    ></component>
    <!-- 子应用环境下使用才显示状态，顶层应用有额外的状态UI -->
    <template v-if="isSubApp && subAppStatus !== 'mounted'">
      <!-- 应用未配置样式 -->
      <div
        v-if="!subAppSettting"
        class="__content"
      >
        <slot name="config"></slot>
        <div
          v-if="!$slots.config"
          class="__tip-msg __config"
        >
          模块未配置
        </div>
      </div>
      <!-- 加载失败样式 -->
      <div
        class="__content"
        v-else-if="subAppStatus === 'error'"
      >
        <slot
          name="error"
          v-if="!isHideErrorTip"
        ></slot>
        <div
          v-if="!$slots.error && !isHideErrorTip"
          class="__tip-msg __error"
        >
          <span>模块加载失败</span>
          <span>&nbsp;&nbsp;</span>
          <span
            class="__reload-btn"
            @click="reloadApp"
            >重新加载</span
          >
          <span>&nbsp;&nbsp;</span>
          <span
            class="__close-btn"
            @click="isHideErrorTip = true"
            >点击关闭</span
          >
        </div>
      </div>
      <!-- 加载中样式 -->
      <div
        class="__content"
        v-else-if="subAppStatus === 'loading'"
      >
        <slot name="loading"></slot>
        <div
          v-if="!$slots.loading"
          class="__tip-msg __loading"
        >
          模块加载中...
        </div>
      </div>
    </template>
  </div>
  <span v-else>组件无法显示</span>
</template>

<script>
import microApp from '@micro-zoe/micro-app';
import {
  getAppIsInConfig,
  getSubAppPrefixFromRouteUrl,
  isSubApp,
  sendDataDown,
} from '../index';
import { MicroAppConfig, dataListener, microAppInitFunction } from '../data';

/** 递增顺序 */
let microAppIndex = 0;

/** 微前端环境是否已经初始化 */
let isInited = false;

/** name_path_props子应用prefix_name和其它值的分隔标识 */
const splitTag = '_____';

export default {
  name: 'MicroApp',
  /**
   * micro-app对应的属性
   * 推导属性不用传：url, inline
   */
  props: {
    /** 子应用名称 */
    _name: {
      type: String,
      required: true,
    },
    /**
     * 要跳转的路径, 一般不要带查询参数
     * @example /#/ExportComponent/contract/ContractDetailByUUID
     */
    _path: {
      type: String,
      required: true,
    },
    /** 强制初始化微前端环境 (默认顶级、二级应用会自动初始化微前端环境) */
    _forceInit: {
      type: Boolean,
      default: false,
    },
    /** 指定应用环境 */
    _env: {
      type: String,
      default: '',
    },
    /** 子应用名称前缀, name不能重复, 不传则自动生成前缀, 如果不需要前缀传个空字符串过来 */
    _prefix: {
      type: String,
      required: false,
    },
    /** 默认路由，一般用`前缀/#/empty`做中转路由（hash模式），对应子应用需要添加这个路由 */
    _defaultPage: {
      type: String,
      default: '',
    },
    /** 是否keep-alive，需要对应子应用也开启keep-alive，一般不用 */
    _keepAlive: {
      type: Boolean,
      default: false,
    },
    /** 卸载时是否强制删除缓存资源 */
    _destroy: {
      type: Boolean,
      default: false,
    },
    /** 卸载时清空数据通讯中的缓存数据, 默认false */
    _clearData: {
      type: Boolean,
      default: false,
    },
    /** 虚拟路由系统分为四种模式search、native、native-scope、pure (顶级应用默认search，子应用默认pure) */
    _routerMode: {
      type: String,
      default: '',
    },
    /** 是否关闭样式隔离，在某些极端情况下会使用，例如子应用独立运行时，主应用跨应用渲染需要关闭样式隔离确保样式导入生效 */
    _disableScopecss: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      MicroAppConfig,
      /** 实际的path */
      activePath: '',
      /** 子应用状态 'unMounted' | 'loading' | 'mounted' | 'error' */
      subAppStatus: 'unMounted',
      /** 定时器 */
      timer: 0,
      /** 子应用真实name（旧的），用于判断当前跳转是否跨子应用跳转 */
      nameWithPrefix_old: '',
      isSubApp,
      /** 记录应用开始加载时间点 */
      appStartTimeStamp: Date.now(),
      /** 是否隐藏错误提示卡片（应用加载失败时可以点击手动关闭错误提示） */
      isHideErrorTip: false,
    };
  },
  computed: {
    /** 子应用真实name（连前缀, 默认: M[序号]_[应用名]） */
    nameWithPrefix() {
      return (this._prefix ?? `M${microAppIndex++}_`) + this._name;
    },
    /** 子应用配置 */
    subAppSettting() {
      return MicroAppConfig.subAppSettingList.find((item) => item.name === this._name);
    },
    /** 默认页面（中转页） */
    defaultPage() {
      return (
        this._defaultPage ||
        (this.subAppSettting?.prefix
          ? `/${this.subAppSettting?.prefix}/#/empty`
          : '/#/empty')
      );
    },
    /** 由prefix\name\path\参数组成的唯一字符串 */
    name_path_props() {
      return this.nameWithPrefix + splitTag + this._path + JSON.stringify(this.$attrs);
    },
  },
  /**
   * 初始化微前端环境
   * 1. 前两层应用
   * 2. 带_forceInit参数
   */
  beforeMount() {
    if (isInited) return;
    if (getAppIsInConfig() || this._forceInit) {
      isInited = true;
      microAppInitFunction();
    }
  },
  mounted() {
    this.subAppStatus = this._name ? 'loading' : 'unMounted';
    this.activePath = this.defaultPage;
  },
  watch: {
    /** 子应用name / prefix / path / 剩余参数发生变化，重新跳转页面 */
    name_path_props: {
      handler(newValue, oldValue) {
        const index = oldValue?.indexOf('___');
        this.nameWithPrefix_old = index > -1 ? oldValue.slice(0, index) : '';
        /**
         * 当主应用子应用切换时，路由结束后(即nameWithPrefix.value变化了)子应用的卸载钩子还没有执行，此时isMicroAppMounted状态还没有得到更新，所以需要setTimeout一下
         */
        setTimeout(() => {
          if (this.subAppSettting && this._path && this.subAppStatus === 'mounted') {
            this.toSubAppPathSafe();
          }
        });
      },
      immediate: true,
    },
  },
  methods: {
    getAppIsInConfig,
    /**
     * 重新渲染该组件
     */
    reloadApp() {
      /** 修改当前组件的key */
      this.$vnode.key = Symbol();
      /** 让父组件强制更新视图 */
      this.$parent?.$forceUpdate?.();
    },
    /**
     * 子应用渲染完成钩子（需要延迟执行！）
     * 1. 更新渲染完成标识
     * 2. 跳到目标页
     * 3. 抛出事件
     * ps: 如果是非pure模式，会导致子应用的url发生改变，会导致路由重新跳转(例如应用未加载前路由还没加载，应用加载完成前动态路由加载了，search模式会自动刷新页面，但pure模式不会，所以要以兼容pure模式为准：跳转到不存在页面先暂存，动态添加路由后跳转到暂存页面)
     */
    microAppMounted() {
      if (dataListener) microApp.addDataListener(this.nameWithPrefix, dataListener);
      this.timer = setTimeout(() => {
        /** 确保子应用真的渲染成功了 */
        if (microApp.getAllApps().includes(this.nameWithPrefix)) {
          const durationMS = Date.now() - this.appStartTimeStamp;
          const callback = () => {
            this.subAppStatus = 'mounted';
            /** 这里需要手动跳转一次，watch时的跳转可能不会生效，因为应用还没挂载完成 */
            this.toSubAppPathSafe();
            this.$emit('_mounted');
          };
          if (durationMS < 300) {
            setTimeout(() => callback(), 300 - durationMS);
          } else {
            callback();
          }
        } else {
          this.subAppStatus = 'error';
          this.$emit('_error');
        }
      }, 4);
    },
    /**
     * 子应用卸载钩子
     * 1. 更新渲染完成标识
     * 2. 清空数据
     */
    microAppUnmount() {
      if (dataListener) microApp.removeDataListener(this.nameWithPrefix, dataListener);
      microApp.clearDataListener(this.nameWithPrefix);
      this.subAppStatus = this._name ? 'loading' : 'unMounted';
      this.appStartTimeStamp = Date.now();
      /** 需要子应用每次window.mount的时候重建router 或 window.unmount的时候重定向路由至默认路由 */
      this.activePath = this.defaultPage;
      microApp.clearData(this.nameWithPrefix);
      this.$emit('_unmount');
    },
    /**
     * 子应用渲染报错
     */
    microAppError() {
      this.subAppStatus = 'error';
      this.$emit('_error');
    },
    /**
     * 跳转到目标页面
     * 会处理是否在目标页的情况
     */
    toSubAppPathSafe() {
      /**
       * _name为空时不允许跳转
       * 前缀不匹配时时不允许跳转
       */
      if (
        !this._name ||
        this.subAppSettting?.prefix !== getSubAppPrefixFromRouteUrl(this._path)
      )
        return;
      if (this.activePath === this.defaultPage) {
        /** 如果当前是中转路由，直接替换 */
        this.timer = setTimeout(() => {
          this.toSubAppPath({ mode: 'replace' });
        }, 4);
      } else if (this.activePath !== this._path) {
        /** 如果当前其它路由，直接跳转，如果是同一应用页面跳转用push，如果是跨应用跳转，用replace */
        this.timer = setTimeout(() => {
          this.toSubAppPath({
            mode: this.nameWithPrefix_old === this.nameWithPrefix ? 'push' : 'replace',
          });
        }, 4);
      } else {
        /**
         * 目标路径和当前路径一致，先跳中转再跳目标
         * 可能的场景：子应用嵌套，路径不变，参数变化
         */
        this.toDefaultPage();
        this.timer = setTimeout(() => {
          this.toSubAppPath({ mode: 'replace' });
        }, 4);
      }
    },
    /**
     * 跳转到目标页，该方法不会校验是否在当前页
     * @param options {
     *   mode: 'replace' | 'push',
     * }
     * 1. 清除传递的参数
     * 2. 传递组件参数
     * 3. 控制子应用路由跳转
     */
    toSubAppPath(options) {
      const { mode } = {
        ...options,
      };

      microApp.router[mode]({
        name: this.nameWithPrefix,
        /**
         * 不要对props._path进行处理（比如添加参数），原样跳转就行
         * ps：props._path有可能是编码 或 半编码的，解析很可能报错
         */
        path: this._path,
      });

      sendDataDown(this.nameWithPrefix, {
        eventType: 'component',
        props: this.$attrs,
        subAppPath: this._path,
      });
      this.activePath = this._path;
    },
    /** 跳到默认页面 */
    toDefaultPage() {
      microApp.router.push({
        name: this.nameWithPrefix,
        path: this.defaultPage,
      });
      this.activePath = this.defaultPage;
    },
  },
  beforeDestroy() {
    /** 不清除，会导致子应用重新挂载时监听到2次数值变化 */
    microApp.clearData(this.nameWithPrefix);
    clearTimeout(this.timer);
  },
  /** 销毁组件时销毁应用 */
  destroyed() {
    if (microApp.getAllApps().includes(this.nameWithPrefix))
      microApp.unmountApp(this.nameWithPrefix);
  },
};
</script>

<style lang="scss">
// 样式写在全局文件@/style/index.scss
</style>
