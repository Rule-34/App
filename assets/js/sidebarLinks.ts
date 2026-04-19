import {
  ArrowDownTrayIcon,
  BuildingLibraryIcon,
  Cog6ToothIcon,
  HomeIcon,
  NewspaperIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon
} from '@heroicons/vue/24/outline'
import { project } from '@/config/project'

export const sidebarNavigation = [
  {
    nameKey: 'nav.home',
    icon: HomeIcon,
    href: '/',
    isExternal: false
  },
  {
    nameKey: 'nav.otherSites',
    icon: UserGroupIcon,
    href: '/other-sites',
    isExternal: false
  },

  // Hide "Install App" when in standalone mode
  ...(import.meta.client && window.matchMedia('(display-mode: standalone)').matches
    ? []
    : [
        {
          nameKey: 'nav.installApp',
          icon: ArrowDownTrayIcon,
          href: `https://www.installpwa.com/from/${project.urls.production.hostname}`,
          isExternal: true
        }
      ]),

  {
    nameKey: 'nav.faq',
    icon: QuestionMarkCircleIcon,
    href: 'https://rule34.app/frequently-asked-questions',
    isExternal: true
  },
  {
    nameKey: 'nav.blog',
    icon: NewspaperIcon,
    href: `${project.urls.production.toString()}blog`,
    isExternal: true
  },
  {
    nameKey: 'nav.legal',
    icon: BuildingLibraryIcon,
    href: '/legal',
    isExternal: false
  },
  {
    nameKey: 'nav.settings',
    icon: Cog6ToothIcon,
    href: '/settings',
    isExternal: false
  }
]
