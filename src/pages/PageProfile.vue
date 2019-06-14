<template>
    <div class="flex-grid">
        <UserProfileCard
            v-if="!edit"
            :user="user"
            :userThreadsCount="userThreadsCount"
            :userPostsCount="userPostsCount "
        />

        <UserProfileCardEditor
            v-else
            :user="user"
            :userThreadsCount="userThreadsCount"
            :userPostsCount="userPostsCount "
        />

          <div class="col-7 push-top">

              <div class="profile-header">
                  <span class="text-lead">
                      Joker's recent activity
                  </span>
                  <a href="#">See only started threads?</a>
              </div>

              <hr>

            <div class="activity-list">
                  <!-- <div class="activity">
                      <div class="activity-header">
                          <img src="https://www.sideshowtoy.com/photo_9030371_thumb.jpg" alt="" class="hide-mobile avatar-small">
                          <p class="title">
                              Where is the sign in button??????!?!?!?!
                              <span>Joker replied to his own topic in Questions & Feedback</span>
                          </p>

                      </div>

                      <div class="post-content">
                        <div>
                          <p><strong><i>Post deleted due to inappropriate language</i></strong></p>
                        </div>
                      </div>

                      <div class="thread-details">
                          <span>7 days ago</span>
                          <span>7 comments</span>
                      </div>
                  </div> -->

              </div>

            <PostList
                :posts="userPosts"
            />
        </div>
    </div>
</template>

<script>
    import PostList from '@/components/PostList'
    import UserProfileCard from '@/components/UserProfileCard'
    import UserProfileCardEditor from '@/components/UserProfileCardEditor'
    import {mapGetters} from 'vuex'
    import {countObjectProperties} from '@/utils'

    export default {
        components: {
            PostList,
            UserProfileCard,
            UserProfileCardEditor
        },

        props: {
            edit: {
                type: Boolean,
                default: false
            }
        },

        computed: {
            ...mapGetters({
                user: 'authUser'
            }),

            userThreadsCount () {
                return countObjectProperties(this.user.threads)
            },

            userPostsCount () {
                return countObjectProperties(this.user.posts)
            },

            userPosts () {
                if (this.user.posts) {
                    return Object.values(this.$store.state.posts)
                        .filter(post => post.userId === this.user['.key'])
                }

                return []
            }
        }
    }
</script>
