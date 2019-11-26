<template>
  <!-- Actual Navigation Bar -->
  <v-navigation-drawer :value="isActive" fixed temporary app>
    <v-img src="/icon.png">
      <v-row align="end" class="lightbox pl-2 fill-height">
        <v-col>
          <div class="subheading">Rule 34 PWA</div>
        </v-col>
      </v-row>
    </v-img>

    <v-list dense>
      <!-- Loop of links -->
      <v-list-item
        v-for="item in items"
        :key="item.title"
        :to="item.link ? item.link : item.title.toLowerCase()"
        nuxt
        link
        color="primary"
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
</template>

<script>
import { mapState } from 'vuex'
import {
  mdiViewDashboard,
  mdiHelpCircle,
  mdiSettings,
  mdiInformationVariant,
  mdiBookOpenOutline
} from '@mdi/js'

export default {
  name: 'SideNav',

  props: { isActive: { type: Boolean, required: true, default: false } },

  data() {
    return {
      items: [
        { title: 'Home', icon: mdiViewDashboard, link: '/' },
        { title: 'Faq', icon: mdiInformationVariant },
        { title: 'Usage', icon: mdiBookOpenOutline },
        { title: 'About', icon: mdiHelpCircle },
        { title: 'Settings', icon: mdiSettings }
      ]
    }
  },

  computed: {
    ...mapState(['searchData'])
  }
}
</script>
