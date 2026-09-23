<template>
  <div class="flex min-h-screen bg-[#f7f3ee] text-slate-900">
    <AppSidebar />
    <main class="min-w-0 flex-1 overflow-auto p-6 md:p-10">
      <slot />
    </main>
  </div>
</template>
