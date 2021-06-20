import Vue from 'vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

export default (context) => {
  Vue.component('DynamicScroller', DynamicScroller)
  Vue.component('DynamicScrollerItem', DynamicScrollerItem)
}
