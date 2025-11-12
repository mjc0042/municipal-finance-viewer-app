<script setup lang="ts">
import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarPortal,
  MenubarRoot,
  MenubarSeparator,
  MenubarTrigger,
} from 'reka-ui'
import { useAuthStore } from '@/stores/auth'

const currentMenu = ref('')

const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isAuthenticated)

function logout() {
    authStore.logout()
}

</script>

<template>

<nav class="bg-white border-gray-200 dark:bg-zinc-950">
  <div class="max-w-7xl flex flex-wrap items-center justify-between mx-auto p-2">
  <a href="https://flowbite.com/" class="flex items-center space-x-3 rtl:space-x-reverse text-white">
      <Icon name="streamline:city-hall-remix" size="24" />
      <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Axon</span>
  </a>
  <div class="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
    <MenubarRoot
    v-model="currentMenu"
    class="flex p-[3px]"
  >
    <MenubarMenu value="file">
      <MenubarTrigger
        class="outline-none select-none font-semibold leading-none rounded text-white text-xs flex items-center justify-between gap-0.5 data-[state=open]:bg-green4"
      >
        <button class="rounded-full p-1 hover:bg-zinc-800 cursor-pointer" aria-label="Profile">
          <Icon name="ic:outline-person" size="24" class="w-8 h-8" />
        </button>
      </MenubarTrigger>
      <MenubarPortal>
        <MenubarContent
          class="min-w-[220px] outline-none bg-white rounded-lg p-[5px] border shadow-sm [animation-duration:400ms] [animation-timing-function:cubic-bezier(0.16,1,0.3,1)] will-change-[transform,opacity]"
          align="start"
          :side-offset="5"
          :align-offset="-3"
        >
          <MenubarItem
            class="group text-sm font-light leading-none text-black rounded flex items-center h-[25px] px-2.5 relative select-none outline-none data-[state=open]:bg-slate-500 data-[state=open]:text-black data-highlighted:bg-slate-200 data-highlighted:cursor-pointer data-highlighted:text-black data-highlighted:data-[state=open]:text-black data-disabled:text-gray-400 data-disabled:pointer-events-none"
          >
            Dashboard
          </MenubarItem>
          <MenubarItem
            class="group text-sm font-light leading-none text-black rounded flex items-center h-[25px] px-2.5 relative select-none outline-none data-[state=open]:bg-slate-500 data-[state=open]:text-black data-highlighted:bg-slate-200 data-highlighted:cursor-pointer data-highlighted:text-black data-highlighted:data-[state=open]:text-black data-disabled:text-gray-400 data-disabled:pointer-events-none"
          >
            Settings
          </MenubarItem>
          <MenubarSeparator class="h-px bg-neutral-300 m-[5px]" />
          <MenubarItem
            class="group text-sm font-light leading-none text-black rounded flex items-center h-[25px] px-2.5 relative select-none outline-none data-[state=open]:bg-slate-500 data-[state=open]:text-black data-highlighted:bg-slate-200 data-highlighted:cursor-pointer data-highlighted:text-black data-highlighted:data-[state=open]:text-black data-disabled:text-gray-400 data-disabled:pointer-events-none"
            @click="logout"
          >
            <NuxtLink to="/login">Logout</NuxtLink>
          </MenubarItem>
        </MenubarContent>
      </MenubarPortal>
    </MenubarMenu>
  </MenubarRoot>
  </div>
  <div class="items-center justify-between hidden w-full md:flex md:w-auto md:order-1">
    <ul class="flex flex-col font-medium p-4 md:p-0 mt-4 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white md:dark:bg-zinc-950">
      <li v-if="isLoggedIn">
        <a href="#" class="block py-2 px-3 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-slate-500 md:p-0 dark:text-white md:dark:hover:text-slate-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">MuniciData</a>
      </li>
      <li v-if="isLoggedIn">
        <a href="#" class="block py-2 px-3 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-slate-500 md:p-0 dark:text-white md:dark:hover:text-slate-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Designer</a>
      </li>
      <li v-if="!isLoggedIn">
        <a href="#" class="block py-2 px-3 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-slate-500 md:p-0 dark:text-white md:dark:hover:text-slate-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Pricing</a>
      </li>
      <li v-if="!isLoggedIn">
        <NuxtLink to="/login"
        class="block py-2 px-3 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-slate-500 md:p-0 dark:text-white md:dark:hover:text-slate-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
        >
          Login
        </NuxtLink>
      </li>
    </ul>
  </div>
  </div>
</nav>


</template>