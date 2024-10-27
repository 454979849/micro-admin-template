<template>
  <div>
    <section class="-m-card">
      <span class="-m-title">低代码渲染器</span>
      <div class="lowcode-card">
        <UseSchemaRender
          :ref="(ref: any) => schemaInsRef = ref"
          :nodeId="4"
        ></UseSchemaRender>
      </div>
      <el-button
        style="margin-top: 10px"
        @click="SchemaOnClick"
        >点击调用低代码里面的onClick方法</el-button
      >
    </section>
  </div>
</template>

<script lang="ts" setup>
import UseSchemaRender from '@/components/use-schema-render/index.vue';
import { ref } from 'vue';
import { ElButton } from 'element-plus';

/** 低代码实例 */
const schemaInsRef = ref<InstanceType<typeof UseSchemaRender>>();

/** 调用低代码里面的onClick方法 */
function SchemaOnClick() {
  schemaInsRef.value?.getCxt()?.current?.onClick?.();
}
</script>

<style lang="scss" scoped>
.lowcode-card {
  border: 1px solid rgb(233, 233, 233);
  background-color: white;
}
</style>
