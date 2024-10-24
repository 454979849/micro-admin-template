<template>
  <ReactComponent
    :_is="SchemaRender"
    :ref="(ref: any) => ReactComponentRef = ref"
    v-bind="otherProps"
  ></ReactComponent>
</template>
<script lang="ts" setup>
import ReactComponent from 'micro-app-tools/vue3/ReactComponent.vue';
import SchemaRender from './index';
import { ref, useAttrs } from 'vue';

const otherProps = useAttrs();

const ReactComponentRef = ref();

defineExpose({
  /** 获取低代码实例的上下文 */
  getCxt() {
    return ReactComponentRef.value?.getReactRef?.();
  },
});
</script>
