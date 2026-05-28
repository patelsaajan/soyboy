<template>
    <div class="bg-neutral text-white min-h-screen text-justify">
        <div class="container mx-auto pt-4">
            <div class="flex justify-between">
                <UiLogo stacked size="sm" />
                <LayoutNavDesktop />
            </div>
        </div>
        <slot />
        <LayoutFooter />
    </div>
</template>
