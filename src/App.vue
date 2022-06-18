<template>
  <v-app>
    <!--
          <q-dialog v-model="loginDialog" persistent>
        <q-card style="min-width: 350px">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Login</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-input label="Username" v-model="username" autofocus />
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-input
              label="Password"
              v-model="password"
              :type="isPwd ? 'password' : 'text'"
              @keyup.enter="acceptLogin">
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                  />
              </template>
            </q-input>
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="Cancel" @click="cancelLogin" />
            <q-btn flat label="Login" @click="acceptLogin" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    -->

    <v-navigation-drawer app v-model="drawer">
      <v-list dense nav>
        <v-list-item to="/pollen">
          <v-list-item-icon><v-icon>mdi-gps-fixed</v-icon></v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Pollen</v-list-item-title>
            <v-list-item-subtitle>Pollen concentration</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-list-item to="/spores">
          <v-list-item-icon><v-icon>mdi-bug</v-icon></v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Spores</v-list-item-title>
            <v-list-item-subtitle>Spore concentration</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-list-item to="/information">
          <v-list-item-icon><v-icon>mdi-school</v-icon></v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Information</v-list-item-title>
            <v-list-item-subtitle
              >Information about spores &amp; pollen</v-list-item-subtitle
            >
          </v-list-item-content>
        </v-list-item>

        <v-list-item to="/data">
          <v-list-item-icon><v-icon>mdi-archive</v-icon></v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Data Management</v-list-item-title>
            <v-list-item-subtitle
              >Add new data to the backend</v-list-item-subtitle
            >
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Title</v-toolbar-title>
      <v-spacer></v-spacer>
        <v-combobox
          v-model="lang"
          :items="langOptions"
          label="Language"
          solo
          dense
          class="mt-5"
        ></v-combobox>
        <v-btn v-if="token === ''" text @click="startLogin"> Login </v-btn>
        <v-btn v-if="token !== ''" text @click="logout"> Logout </v-btn>
    </v-app-bar>

    <v-main>
      <router-view
        @tokenChanged="onTokenChanged"
        :proxy="proxy"
        :locale="lang"
      />
    </v-main>
  </v-app>
</template>

<script>
import { Proxy } from "@/proxy.js";

function getLanguage(proxy) {
  return proxy.getSupportedLanguages().then((supportedLanguages) => {
    let browserSetting = navigator.languages || [navigator.language];
    let bestMatch = "";
    browserSetting.forEach((item) => {
      let langCode = item.split("-")[0];
      if (supportedLanguages.indexOf(langCode) > -1 && bestMatch === "") {
        bestMatch = langCode;
      }
    });
    return bestMatch;
  });
}

export default {
  name: "App",

  components: {},

  watch: {
    lang(lang) {
      this.$i18n.locale = lang.value;
    },
  },

  data: () => ({
    drawer: null,
    proxy: null,
    token: "",
    lang: { value: "en", text: "English" },
    langOptions: [
      { value: "en", text: "English" },
      { value: "de", text: "Deutsch" },
      { value: "fr", text: "Français" },
      { value: "lb", text: "Lëtzebuergesch" },
    ],
    loginDialog: false,
    username: "",
    password: "",
    isPwd: true
  }),
  methods: {
    startLogin() {
      this.loginDialog = true;
    },
    logout() {
      this.login = "";
      this.password = "";
      this.onTokenChanged("");
    },
    acceptLogin() {
      if (this.username && this.password) {
        this.proxy.login(this.username, this.password).then((token) => {
          this.onTokenChanged(token);
        });
      }
      this.password = "";
      this.loginDialog = false;
    },
    cancelLogin() {
      this.login = "";
      this.password = "";
      this.loginDialog = false;
    },
    onTokenChanged(token) {
      if (!token) {
        localStorage.removeItem("token");
        this.token = "";
        this.proxy.setToken("");
        return;
      }
      localStorage.setItem("token", token);
      this.token = token;
      this.proxy.setToken(token);
    },
  },
  created() {
    this.token = localStorage.getItem("token") || "";
    this.proxy = new Proxy(process.env.VUE_APP_POLLUX_API, this.token);
    getLanguage(this.proxy).then((value) => {
      this.lang = value;
    });
  },
};
</script>
