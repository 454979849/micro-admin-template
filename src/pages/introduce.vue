<template>
  <div class="introduce">
    <section class="-m-card">
      <h2 className="-m-title">项目介绍</h2>
      <p>
        这是一个<b>后台模板</b>。
        它集成了<b><a href="https://micro-zoe.github.io/micro-app/docs.html#/" target="_blank">京东micro-app微前端框架</a></b>，
        允许将项目拆分成不同的子应用，独立开发，独立部署，同时子应用<b>不限制框架</b>。也就是说子应用可以用react/vue3/vue2进行开发，点击左侧菜单可以预览
      </p>
    </section>

    <section class="-m-card">
      <span className="-m-title">项目组成</span>
      <p>
        该demo由5个独立的项目仓库组成，其中一个主应用，4个不同技术栈的子应用<br />
        按设计主应用包括Layout布局(包括头部/侧边菜单)、
        基础页面(404/403/登录页)、用户公共信息加载逻辑(用户信息/菜单信息/权限信息)<br />
        子应用不用重复编写Layout布局，子需要关心对应页面的内容区域<br />
        <br />
        <span class="block title">各项目技术栈：</span>
        主应用(基座)：使用vue3 + vite<br />
        子应用1：使用react18 + vite<br />
        子应用2：使用vue3 + vite<br />
        子应用3：使用vue2 + webpack<br />
        子应用4：使用vue2.7 + vite<br />
      </p>
    </section>

    <section class="-m-card">
      <h2 className="-m-title">菜单介绍</h2>
      <p>
        <span class="block title">主应用测试了以下功能：</span>
        <b class="link" @click="() => router.push('/onlinePreview')">在线预览网站</b>：可以通过url直接嵌入预览其他网站（目标网站需配置支持跨域）<br />
        <b class="link" @click="() => router.push('/demo/lowcodeEngine')" >阿里低代码</b>：集成了阿里开源的低代码引擎，支持渲染低代码页面（详情见👇低代码介绍）<br />
        <b class="link" @click="() => router.push('/demo/vueFlow')">vueFlow测试</b>：集成了vue-flow第三方库，后续打算通过派发组件的方式提供给子应用直接调用<br />
        <br />
        <span class="block title">子应用均测试了以下的功能：</span>
        首页：测试了<b>lottie动画</b><br />
        <b>派发组件</b>：测试子应用直接调用主应用下发的组件（Svg/TinyMce）是否能正常使用（可跨框架使用）<br />
        <b>路由组件</b>：测试子应用嵌套子应用的场景（将子应用当作组件来使用）<br />
        404复用：测试子应用通过派发组件的方式直接注册到路由（实现<b>页面/路由复用</b>）<br />
        react组件测试：测试<b>不同框架渲染React组件</b>的能力（vue也可以直接使用React组件）
      </p>
    </section>

    <section class="-m-card">
      <span className="-m-title">低代码介绍</span>
      <p>
        <span class="block title">为什么要集成低代码？</span>
        <span class="inline-block indent">1. 团队之前低代码选型的时候收到技术栈制约，vue3项目一直找不到合适的开源低代码框架，但有了微前端，让vue项目使用react低代码成为了可能，集成低代码可以解锁微前端更多用法</span><br />
        <span class="inline-block indent">2. 我认为低代码开发和源代码开发不应该对立，应该各取所长，才能应对更多的场景，例如简单的页面业务/产品就可以可以通过低代码的方式进行开发，对于复杂的页面，前端开发者可以使用他们最擅长的源代码本地开发，同时我们还在致力支持源代码中使用低代码组件、低代码中使用源代码组件</span><br />
        <span class="block title">为什么选择阿里低代码引擎？</span>
        <span class="inline-block indent">1. 在开源的框架里，我们对比了lowcode-engine、amis、VForm3等低代码框架</span><br />
        <span class="inline-block indent">2. 我觉得目前的低代码如果要应对多变的场景，少不了需要前端开发人员的介入，而很多框架封装得过于复杂，这虽然可以降低非前端开发人员的使用门槛，但却提高了前端开发人员的学习成本，也降低了灵活性，而低代码引擎是我见过比较贴合前端开发逻辑的低代码框架，可以基于这个引擎进行二开，降低一点使用门槛</span>
      </p>
    </section>

    <section class="-m-card">
      <span className="-m-title">相关项目介绍</span>
      <div>
        <b>低代码设计器</b><br />
        <span class="inline-block indent">
          <a href="https://ali-lowcode.lammu.cn/" target="_blank">demo</a>
          <span>&nbsp;&nbsp;待开源...</span>
        </span><br />

        <b>低代码预览器</b><br />
        <span class="inline-block indent">
          <a href="https://ali-lowcode.lammu.cn/preview/?nodeId=3" target="_blank">demo</a>
          <span>&nbsp;&nbsp;待开源...</span>
        </span><br />

        <b>nest后端(目前包括低代码存储 / 菜单管理)</b><br />
        <span class="inline-block indent">
          待开源...
        </span><br />
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<style lang="scss" scoped>
.introduce {
  font-size: 15px;
  .bg-white {
    background-color: white;
  }
  a,
  .link {
    color: #409eff;
    text-decoration: underline;
    cursor: pointer;
  }
  .block {
    display: block;
  }
  .inline-block {
    display: inline-block;
  }
  .indent {
    text-indent: 1em;
  }
  .title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 0.3em;
  }
}
</style>
