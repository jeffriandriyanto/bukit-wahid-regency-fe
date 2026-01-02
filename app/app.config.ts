export default defineAppConfig({
  ui: {
    colors: {
      primary: 'primary',
      secondary: 'secondary',
      neutral: 'neutral'
    },
    input: {
      slots: {
        root: '!w-full',
        base: 'rounded-xl'
      },
      defaultVariants: {
        size: 'lg'
      }
    },
    select: {
      slots: {
        root: '!w-full',
        base: 'rounded-xl'
      },
      defaultVariants: {
        size: 'lg'
      }
    },
    button: {
      slots: {
        base: 'rounded-xl'
      },
      defaultVariants: {
        size: 'lg'
      }
    }
  }
})
