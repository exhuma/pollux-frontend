import Vue from "vue";
import VueRouter from "vue-router";
import HelloWorld from "@/components/HelloWorld";
import Pollen from "@/views/Pollen";
import Spores from "@/views/Spores";

Vue.use(VueRouter);

export const router = new VueRouter({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "home",
      component: HelloWorld,
    },
    {
      path: "/pollen",
      name: "pollen",
      component: Pollen,
    },
    {
      path: "/spores",
      name: "spores",
      component: Spores,
    },
  ],
});
