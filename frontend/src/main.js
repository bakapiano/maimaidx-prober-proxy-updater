import 'vfonts/Lato.css'

import {createRouter, createWebHashHistory} from "vue-router"

import App from './App.vue'
import Home from "./pages/HomePage.vue"
import Result from "./pages/ResultPage.vue"
import { createApp } from 'vue'

const routes = [
    { path: '/', component: Home },
    { path: "/trace/:uuid/", component: Result},
  ]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

createApp(App).use(router).mount('#app')
