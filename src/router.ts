import { createRouter, createWebHistory } from 'vue-router'
import ApiList from './views/ApiList.vue'
import ApiForm from './views/ApiForm.vue'
import InterceptList from './views/InterceptList.vue'
import InterceptForm from './views/InterceptForm.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'list', component: ApiList },
    { path: '/new', name: 'new', component: ApiForm },
    { path: '/edit/:id', name: 'edit', component: ApiForm, props: true },
    {
      path: '/intercepts/:apiId',
      name: 'intercept-list',
      component: InterceptList,
      props: true,
    },
    {
      path: '/intercepts/:apiId/new',
      name: 'intercept-new',
      component: InterceptForm,
      props: true,
    },
    {
      path: '/intercepts/:apiId/:id',
      name: 'intercept-edit',
      component: InterceptForm,
      props: true,
    },
  ],
})
