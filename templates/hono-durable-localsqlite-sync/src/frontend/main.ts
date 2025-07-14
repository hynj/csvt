import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import type { Route, RouterOptions } from '@dvcol/svelte-simple-router/models';
import { registerSW } from './lib/sw-registration';

const app = mount(App, {
  target: document.getElementById('app')!,
})

// Register service worker for offline support
registerSW().then((updateInfo) => {
  console.log('Service worker setup complete');
  // You can use updateInfo here if needed for custom update UI
});

export default app
