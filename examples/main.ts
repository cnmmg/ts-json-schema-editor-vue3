import { createApp, App as IApp } from 'vue'
import App from './App.vue'

import { Modal } from 'ant-design-vue'

const app: IApp = createApp(App)
app.use(Modal)
app.mount('#app')