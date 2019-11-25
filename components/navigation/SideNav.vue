<template>
  <div>
    <!-- Actual Navigation Bar -->
    <v-navigation-drawer v-model="drawer" absolute temporary>
      <v-list-item>
        <v-list-item-avatar>
          <v-img src="/icon.png"></v-img>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title>Rule 34 PWA</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense>
        <!-- Loop of links -->
        <v-list-item
          v-for="item in items"
          :key="item.title"
          :to="item.link ? item.link : item.title.toLowerCase()"
          nuxt
          link
        >
          <!-- Icon -->
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <!-- Text -->
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import { mdiViewDashboard, mdiHelpCircle, mdiSettings } from '@mdi/js'

export default {
  name: 'SideNav',

  data() {
    return {
      drawer: true,
      items: [
        { title: 'Home', icon: mdiViewDashboard, link: '/' },
        { title: 'Faq', icon: mdiHelpCircle },
        { title: 'Usage', icon: mdiViewDashboard },
        { title: 'About', icon: mdiViewDashboard },
        { title: 'Settings', icon: mdiSettings }
      ]
    }
  },

  computed: {
    ...mapState(['searchData'])
  },
  methods: {
    ...mapMutations(['newSearchData', 'sideNavManager'])
  }
}
</script>
