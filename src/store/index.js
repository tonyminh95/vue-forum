import Vue from 'vue'
import Vuex from 'vuex'
import firebase from 'firebase'
import {countObjectProperties} from '@/utils'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        categories: {},
        forums: {},
        threads: {},
        posts: {},
        users: {},
        authId: 'VXjpr2WHa8Ux4Bnggym8QFLdv5C3'
    },

    getters: {
        authUser (state) {
            // return state.users[state.authId]
            return {}
        },

        userThreadsCount: state => id => countObjectProperties(state.users[id].threads),

        userPostsCount: state => id => countObjectProperties(state.users[id].posts),

        threadRepliesCount: state => id => countObjectProperties(state.threads[id].posts) - 1
    },

    actions: {
        createPost ({commit, state}, post) {
            const postId = 'greatPost' + Math.random()
            post['.key'] = postId
            post.userId = state.authId
            post.publishedAt = Math.floor(Date.now() / 1000)

            commit('setPost', {post, postId})
            commit('appendPostToThread', {postId, threadId: post.threadId})
            commit('appendPostToUser', {postId, userId: post.userId})

            return Promise.resolve(state.posts[postId])
        },

        createThread ({commit, state, dispatch}, {text, title, forumId}) {
            return new Promise((resolve, reject) => {
                const threadId = 'greatThread' + Math.random()
                const userId = state.authId
                const publishedAt = Math.floor(Date.now() / 1000)

                const thread = {'.key': threadId, title, forumId, publishedAt, userId}

                commit('setThread', {thread, threadId})
                commit('appendThreadToForum', {forumId, threadId})
                commit('appendThreadToUser', {userId, threadId})

                dispatch('createPost', {text, threadId})
                    .then(post => {
                        commit('setThread', {threadId, thread: {...thread, firstPostId: post['.key']}})
                    })

                resolve(state.threads[threadId])
            })
        },

        updateThread ({commit, state, dispatch}, {title, text, id}) {
            return new Promise((resolve, reject) => {
                const thread = state.threads[id]
                const newThread = {...thread, title}

                commit('setThread', {thread: newThread, threadId: id})

                dispatch('updatePost', {id: thread.firstPostId, text})
                    .then(() => {
                        resolve(newThread)
                    })
            })
        },

        updatePost ({state, commit}, {id, text}) {
            return new Promise((resolve, reject) => {
                const post = state.posts[id]

                commit('setPost', {
                    postId: id,
                    post: {
                        ...post,
                        text,
                        edited: {
                            at: Math.floor(Date.now() / 1000),
                            by: state.authId
                        }
                    }
                })
                resolve(post)
            })
        },

        updateUser ({commit}, user) {
            commit('setUser', {userId: user['.key'], user})
        },

        fetchThread ({dispatch}, {id}) {
            return dispatch('fetchItem', {resource: 'threads', id})
        },

        fetchUser ({dispatch}, {id}) {
            return dispatch('fetchItem', {resource: 'users', id})
        },

        fetchPost ({dispatch}, {id}) {
            return dispatch('fetchItem', {resource: 'posts', id})
        },

        fetchCategory ({dispatch}, {id}) {
            return dispatch('fetchItem', {resource: 'categories', id})
        },

        fetchForum ({dispatch}, {id}) {
            return dispatch('fetchItem', {resource: 'forums', id})
        },

        fetchForums ({dispatch}, {ids}) {
            return dispatch('fetchItems', {resource: 'forums', ids})
        },

        fetchPosts ({dispatch}, {ids}) {
            return dispatch('fetchItems', {resource: 'posts', ids})
        },

        fetchThreads ({dispatch}, {ids}) {
            return dispatch('fetchItems', {resource: 'threads', ids})
        },

        fetchAllCategories ({state, commit}) {
            return new Promise((resolve, reject) => {
                firebase.database().ref('categories').once('value', snapshot => {
                    const categoriesObject = snapshot.val()

                    Object.keys(categoriesObject).forEach(categoryId => {
                        const category = categoriesObject[categoryId]

                        commit('setItem', {resource: 'categories', id: categoryId, item: category})
                    })

                    resolve(Object.values(state.categories))
                })
            })
        },

        fetchItem ({state, commit}, {id, resource}) {
            // fetch item
            return new Promise((resolve, reject) => {
                firebase.database().ref(resource).child(id).once('value', snapshot => {
                    commit('setItem', {resource, id: snapshot.key, item: snapshot.val()})

                    resolve(state[resource][id])
                })
            })
        },

        fetchItems ({dispatch}, {ids, resource}) {
            ids = Array.isArray(ids) ? ids : Object.keys(ids)

            return Promise.all(ids.map(id => dispatch('fetchItem', {id, resource})))
        }
    },

    mutations: {
        setPost (state, {post, postId}) {
            Vue.set(state.posts, postId, post)
        },

        setThread (state, {thread, threadId}) {
            Vue.set(state.threads, threadId, thread)
        },

        setUser (state, {user, userId}) {
            Vue.set(state.users, userId, user)
        },

        setItem (state, {resource, item, id}) {
            item['.key'] = id
            Vue.set(state[resource], id, item)
        },

        appendPostToThread (state, {postId, threadId}) {
            const thread = state.threads[threadId]

            if (!thread.posts) {
                Vue.set(thread, 'posts', {})
            }

            Vue.set(thread.posts, postId, postId)
        },

        appendPostToUser (state, {postId, userId}) {
            const user = state.users[userId]

            if (!user.posts) {
                Vue.set(user, 'posts', {})
            }

            Vue.set(user.posts, postId, postId)
        },

        appendThreadToForum (state, {forumId, threadId}) {
            const forum = state.forums[forumId]

            if (!forum.threads) {
                Vue.set(forum, 'threads', {})
            }

            Vue.set(forum.threads, threadId, threadId)
        },

        appendThreadToUser (state, {userId, threadId}) {
            const user = state.users[userId]

            if (!user.threads) {
                Vue.set(user, 'threads', {})
            }

            Vue.set(user.threads, threadId, threadId)
        }
    }
})
