import { createRouter, createWebHistory } from 'vue-router';
import HomePage from "../pages/HomePage.vue";
import CreatorPage from "../pages/CreatorPage.vue";
import PostPage from "../pages/PostPage.vue";
import MessagesPage from "../pages/MessagesPage.vue";

const routes = [
    {
        path: '/home',
        name: 'Home',
        component: HomePage,
    },
    {
        path: '/creator/:userId',
        name: 'Creator',
        component: CreatorPage
    },
    {
        path: '/post/:id',
        name: 'Post',
        component: PostPage,
    },
    {
        path: '/messages/:id',
        name: 'Message',
        component: MessagesPage
    }
]


const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;