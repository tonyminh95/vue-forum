// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import firebase from 'firebase'
import App from './App'
import router from './router'
import store from '@/store'
import AppDate from '@/components/AppDate'

Vue.component('AppDate', AppDate)

Vue.config.productionTip = false

var firebaseConfig = {
    apiKey: 'AIzaSyDT8l9p23hCjq0L8sjRSRYTbU3AWdC-0II',
    authDomain: 'vue-forum-2807b.firebaseapp.com',
    databaseURL: 'https://vue-forum-2807b.firebaseio.com',
    projectId: 'vue-forum-2807b',
    storageBucket: '',
    messagingSenderId: '395057764340',
	appId: '1:395057764340:web:3194fc4f24eb1053'
}

firebase.initializeApp(firebaseConfig)

/* eslint-disable no-new */
new Vue({
	el: '#app',
	router,
	store,
	template: '<App/>',
	components: { App }
})
