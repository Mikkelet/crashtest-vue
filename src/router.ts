import { createRouter, createWebHistory } from 'vue-router'
import ProjectList from './views/ProjectList.vue'
import ProjectForm from './views/ProjectForm.vue'
import ApiList from './views/ApiList.vue'
import ApiForm from './views/ApiForm.vue'
import InterceptList from './views/InterceptList.vue'
import InterceptForm from './views/InterceptForm.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'project-list', component: ProjectList },
    { path: '/projects/new', name: 'project-new', component: ProjectForm },
    { path: '/projects/:id/edit', name: 'project-edit', component: ProjectForm, props: true },
    {
      path: '/projects/:projectId/apis',
      name: 'api-list',
      component: ApiList,
      props: true,
    },
    {
      path: '/projects/:projectId/apis/new',
      name: 'api-new',
      component: ApiForm,
      props: true,
    },
    {
      path: '/projects/:projectId/apis/:id/edit',
      name: 'api-edit',
      component: ApiForm,
      props: true,
    },
    {
      path: '/projects/:projectId/apis/:apiId/intercepts',
      name: 'intercept-list',
      component: InterceptList,
      props: true,
    },
    {
      path: '/projects/:projectId/apis/:apiId/intercepts/new',
      name: 'intercept-new',
      component: InterceptForm,
      props: true,
    },
    {
      path: '/projects/:projectId/apis/:apiId/intercepts/:id',
      name: 'intercept-edit',
      component: InterceptForm,
      props: true,
    },
  ],
})
