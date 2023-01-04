import { useCallback, useMemo } from 'react'
import useToggle from 'react-use/lib/useToggle'
const useCustomToggle = (initialValue: boolean): [boolean, (nextValue?: any) => void, () => void, () => void] => {
  const [state, toggle] = useToggle(initialValue)
  const setTrue = useCallback(() => {
    toggle(true)
  }, [toggle])
  const setFalse = useCallback(() => {
    toggle(false)
  }, [toggle])
  return useMemo(() => [state, toggle, setTrue, setFalse], [state, toggle])
}

export default useCustomToggle
