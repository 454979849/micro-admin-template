<template>
  <div ref="renderDom"><!-- 渲染节点 --></div>
</template>

<script setup lang="ts">
import { PropType, onMounted, onUnmounted, ref, useAttrs, watchEffect } from 'vue';
import {
  reactComponentMountCallback,
  reactComponentUnMountCallback,
  reactComponentUpdateCallback,
} from './utils';

const props = defineProps({
  _is: {
    type: Object as PropType<any>,
    required: true,
  },
});

/**
 * 剩余参数(包括事件)
 */
const otherProps = useAttrs();

/** 当前组件唯一key */
const key = Symbol();

/** 渲染节点 */
const renderDom = ref<HTMLElement | undefined>(undefined);

/** 获取react组件ref的方法，组件mounted后会重置这个变量 */
let getReactRefMethod: Function = () => undefined;

/**
 * 剩余参数变化, 重新渲染
 */
watchEffect(() => {
  reactComponentUpdateCallback(key, props._is, {
    props: JSON.parse(JSON.stringify(otherProps)),
  });
});

/**
 * 组件初始化
 */
onMounted(() => {
  if (renderDom.value) {
    getReactRefMethod = reactComponentMountCallback(renderDom.value, key, props._is, {
      props: { ...otherProps },
    });
  }
});

/**
 * 组件销毁
 */
onUnmounted(() => {
  reactComponentUnMountCallback(key);
});

defineExpose({
  /**
   * 获取react组件实例
   * ps：要想用这个方法，需修改react组件代码，在初始完成时调用props.setReactCtxOnMounted?.(ctx);
   */
  getReactRef() {
    return getReactRefMethod();
  },
});
</script>
