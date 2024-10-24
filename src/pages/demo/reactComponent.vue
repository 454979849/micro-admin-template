<template>
  <div>
    <section class="-m-card lightcoral">
      <span
        className="-m-title"
        @click="increaseDouble"
        >这是一个react原生组件(.tsx), 点击这里从外部调用计数器+2</span
      >
      <ReactComponent
        :_is="reactCompDemo"
        ref="reactCompDemoRef"
        :value="555"
      ></ReactComponent>
    </section>

    <section class="-m-card lightcoral">
      <span className="-m-title">这是第三方react组件</span>
      <span>//TODO</span>
    </section>
  </div>
</template>

<script lang="ts" setup>
import ReactComponent from 'micro-app-tools/vue3/ReactComponent.vue';
import reactCompDemo from './reactCompDemo';
import { ref } from 'vue';

const reactCompDemoRef = ref<InstanceType<typeof ReactComponent>>();

/** 外部调用计数器+2 */
function increaseDouble() {
  reactCompDemoRef.value?.getReactRef()?.current?.increaseDouble();
}
</script>

<style lang="scss" scoped></style>
