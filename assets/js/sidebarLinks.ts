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

export const sidebarLinks = [
  {
    id: 'home',
    nameKey: 'nav.home',
    href: '/',
    isExternal: false,
    icon: HomeIcon
  },
  {
    id: 'other-sites',
    nameKey: 'nav.otherSites',
    href: '/other-sites',
    isExternal: false,
    icon: UserGroupIcon
  },
  {
    id: 'install-app',
    nameKey: 'nav.installApp',
    href: `https://www.installpwa.com/from/${project.urls.production.hostname}`,
    isExternal: true,
    icon: ArrowDownTrayIcon
  },
  {
    id: 'faq',
    nameKey: 'nav.faq',
    href: 'https://rule34.app/frequently-asked-questions',
    isExternal: true,
    icon: QuestionMarkCircleIcon
  },
  {
    id: 'blog',
    nameKey: 'nav.blog',
    href: `${project.urls.production.toString()}blog`,
    isExternal: true,
    icon: NewspaperIcon
  },
  {
    id: 'legal',
    nameKey: 'nav.legal',
    href: '/legal',
    isExternal: false,
    icon: BuildingLibraryIcon
  },
  {
    id: 'settings',
    nameKey: 'nav.settings',
    href: '/settings',
    isExternal: false,
    icon: Cog6ToothIcon
  }
]
