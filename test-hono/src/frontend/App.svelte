<script lang="ts">
  import type { Route, RouterOptions } from '@dvcol/svelte-simple-router/models';

  import { RouterView } from '@dvcol/svelte-simple-router/components';
  import HelloComponent from './routes/home.svelte';

  const RouteName = {
    Hello: 'hello',
    Goodbye: 'goodbye',
    Home: 'home',
    Any: 'any',
  } as const;

  type RouteNames = (typeof RouteName)[keyof typeof RouteName];

  const routes: Readonly<Route<RouteNames>[]> = [
    {
      name: RouteName.Home,
      path: '/',
      redirect: {
        name: RouteName.Hello,
      },
    },
    {
      name: RouteName.Hello,
      path: `/${RouteName.Hello}`,
      component: HelloComponent,
    },
    {
      name: RouteName.Any,
      path: '*',
      redirect: {
        name: RouteName.Hello,
      },
    },
  ] as const;

  const options: RouterOptions<RouteNames> = {
    routes,
  } as const;

</script>

<RouterView {options} />
