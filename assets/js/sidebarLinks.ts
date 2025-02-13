import {
  ArrowDownTrayIcon,
  BuildingLibraryIcon,
  Cog6ToothIcon,
  HomeIcon,
  NewspaperIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon
} from '@heroicons/vue/24/outline'

export const sidebarNavigation = [
  {
    name: 'Home',
    icon: HomeIcon,

    href: '/',
    isExternal: false
  },
  {
    name: 'Other sites',
    icon: UserGroupIcon,

    href: '/other-sites',
    isExternal: false
  },

  // Hide "Install App" when in standalone mode
  ...(import.meta.client && window.matchMedia('(display-mode: standalone)').matches
    ? []
    : [
        {
          name: 'Install App',
          icon: ArrowDownTrayIcon,
          href: 'https://www.installpwa.com/from/r34.app',
          isExternal: true
        }
      ]),

  {
    name: 'F.A.Q.',
    icon: QuestionMarkCircleIcon,

    href: 'https://rule34.app/frequently-asked-questions',
    isExternal: true
  },
  {
    name: 'Blog',
    icon: NewspaperIcon,

    href: 'https://r34.app/blog',
    isExternal: false
  },
  {
    name: 'Legal',
    icon: BuildingLibraryIcon,

    href: '/legal',
    isExternal: false
  },
  {
    name: 'Settings',
    icon: Cog6ToothIcon,

    href: '/settings',
    isExternal: false
  }
]
