import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import type { Route, RouterOptions } from '@dvcol/svelte-simple-router/models';

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
