<script setup>
import { computed } from 'vue'
import { cva } from 'class-variance-authority'

const props = defineProps({
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  defaultText: { type: String, default: 'Submit' },
  loadingText: { type: String, default: 'Processing...' },
  intent: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  classes: { type: String, default: '' },
})

const emit = defineEmits(['click', 'submit'])

const buttonBase = cva(
  //"cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  'inline-flex items-center justify-center font-medium rounded transition-colors duration-200 focus:outline-none cursor-pointer',
  {
    variants: {
      intent: {
        primary: 'bg-slate-950 text-white hover:bg-slate-800',
        secondary: 'bg-secondary-900 text-secondary-contrast hover:bg-secondary-800',
        dark: 'bg-neutral-900 hover:bg-neutral-950 text-white',
        ghost: "bg-white hover:bg-neutral-200/75 drop-shadow-xs",
        outline: "border border-input bg-background",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: 'text-sm px-3 py-1.5',
        md: 'text-base px-4 py-2',
        lg: 'text-lg px-5 py-3',
        icon: "h-10 w-10",
      },
      disabled: {
        true: 'disabled:opacity-20 disabled:cursor-not-allowed',
        false: '',
      },
    },
    defaultVariants: {
      intent: 'primary',
      size: 'md',
      disabled: false,
    },
  }
)

const handleClick = (event) => {
  if (props.disabled) {
    event.preventDefault()
    return
  }
  if (props.type === 'submit') emit('submit', event)
  else emit('click', event)
}

const buttonText = computed(() =>
  props.loading ? props.loadingText : props.defaultText
)
</script>

<template>
  <button
    :type="props.type"
    :disabled="props.disabled"
    :class="[buttonBase({ intent: props.intent, size: props.size, disabled: props.disabled }), props.classes]"
    @click.prevent="handleClick"
  >
    <slot />
  </button>
</template>
