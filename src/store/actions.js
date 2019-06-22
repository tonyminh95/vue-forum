import firebase from 'firebase'

export default {
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

    fetchThread: ({dispatch}, {id}) => dispatch('fetchItem', {resource: 'threads', id}),
    fetchUser: ({dispatch}, {id}) => dispatch('fetchItem', {resource: 'users', id}),
    fetchPost: ({dispatch}, {id}) => dispatch('fetchItem', {resource: 'posts', id}),
    fetchCategory: ({dispatch}, {id}) => dispatch('fetchItem', {resource: 'categories', id}),
    fetchForum: ({dispatch}, {id}) => dispatch('fetchItem', {resource: 'forums', id}),

    fetchForums: ({dispatch}, {ids}) => dispatch('fetchItems', {resource: 'forums', ids}),
    fetchPosts: ({dispatch}, {ids}) => dispatch('fetchItems', {resource: 'posts', ids}),
    fetchThreads: ({dispatch}, {ids}) => dispatch('fetchItems', {resource: 'threads', ids}),

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
}
