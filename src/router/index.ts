import Vue from "vue";
import Router from "vue-router";
import IndexPage from "@/views/index.vue";
import StockPage from "@/views/stock.vue";

Vue.use(Router);

export default new Router({
  mode: "hash",
  routes: [
    {
      path: "/",
      name: "index",
      component: IndexPage,
    },
    {
      path: "/stock/:code",
      name: "stock",
      component: StockPage,
    },
  ],
});
