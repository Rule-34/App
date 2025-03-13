export const sidebarNavigation = [
  {
    label: 'Home',
    icon: 'i-heroicons-home',
    to: '/'
  },
  {
    label: 'Other sites',
    icon: 'i-heroicons-user-group',
    to: '/other-sites'
  },

  // Hide "Install App" when in standalone mode
  ...(import.meta.client && window.matchMedia('(display-mode: standalone)').matches
    ? []
    : [
        {
          label: 'Install App',
          icon: 'i-heroicons-arrow-down-tray',
          to: 'https://www.installpwa.com/from/r34.app',
          target: '_blank'
        }
      ]),

  {
    label: 'Feedback',
    icon: 'i-heroicons-pencil-square',
    to: 'https://feedback.r34.app',
    target: '_blank'
  },
  {
    label: 'F.A.Q.',
    icon: 'i-heroicons-question-mark-circle',
    to: 'https://rule34.app/frequently-asked-questions',
    target: '_blank'
  },
  {
    label: 'Blog',
    icon: 'i-heroicons-newspaper',
    to: 'https://r34.app/blog'
  },
  {
    label: 'Legal',
    icon: 'i-heroicons-building-library',
    to: '/legal'
  },
  {
    label: 'Settings',
    icon: 'i-heroicons-cog-6-tooth',
    to: '/settings'
  }
]
