<template>
    <div class="bg-background text-white min-h-screen">
        <a
            href="#main-content"
            class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-md"
        >
            Skip to main content
        </a>
        <header class="container mx-auto pt-4">
            <div class="flex justify-between">
                <UiLogo stacked size="sm" />
                <LayoutNavDesktop />
            </div>
        </header>
        <main id="main-content" tabindex="-1">
            <slot />
        </main>
        <LayoutFooter />
    </div>
</template>
