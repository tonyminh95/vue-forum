<template>
    <form @submit.prevent="addPost">
        <div class="form-group">
            <textarea
                name=""
                id=""
                cols="30"
                rows="10"
                class="form-input"
                v-model="newPostText"
            ></textarea>
        </div>
        <div class="form-actions">
            <button class="btn-blue">Submit post</button>
        </div>
    </form>
</template>

<script>
    export default {
        data () {
            return {
                newPostText: ''
            }
        },

        methods: {
            addPost () {
				const postId = 'greatPost' + Math.random()
				const post = {
					text: this.newPostText,
					publishedAt: Math.floor(Date.now() / 1000),
					threadId: this.id,
					userId: 'ALXhxjwgY9PinwNGHpfai6OWyDu2',
					'.key': postId
				}

				// this.$set(sourceData.posts, postId, post)
				// this.$set(this.thread.posts, postId, postId)
				// this.$set(sourceData.users[post.userId].posts, postId, postId)

                this.newPostText = ''

                this.$emit('save-post', {post})
			}
        }
    }
</script>
