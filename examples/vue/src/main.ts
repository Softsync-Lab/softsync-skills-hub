import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';

import App from './App.vue';
import './index.css';
import Blog from './pages/Blog.vue';
import Faq from './pages/Faq.vue';
import Home from './pages/Home.vue';
import Post from './pages/Post.vue';
import { Book, Contact, Help } from './pages/embeds';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/blog', component: Blog },
    { path: '/tag/:tag', component: Blog },
    { path: '/search', component: Blog },
    { path: '/blog/:slug', component: Post },
    { path: '/faq', component: Faq },
    { path: '/help', component: Help },
    { path: '/contact', component: Contact },
    { path: '/book', component: Book },
    { path: '/:rest(.*)*', component: { template: '<main class="mx-auto max-w-3xl px-6 py-20 text-xl">We could not find that page.</main>' } },
  ],
  scrollBehavior: () => ({ top: 0 }),
});

createApp(App).use(router).mount('#app');
