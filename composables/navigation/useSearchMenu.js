import { useToggle } from '@vueuse/core'

const [value, toggle] = useToggle(false)

const router = useRouter()

// Close menu on route change
router.afterEach(() => {
	value.value = false
})

export const useSearchMenu = () => {
	return reactive({
		value,
		toggle
	})
}
