import { act, fireEvent, render } from '@testing-library/react'
import React from 'react'
import { SWRConfig } from 'swr'

export function sleep(time: number) {
  return new Promise<void>(resolve => setTimeout(resolve, time))
}

export const createResponse = <T,>(
  response: T,
  { delay } = { delay: 10 }
): Promise<T> =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      if (response instanceof Error) {
        reject(response)
      } else {
        resolve(response)
      }
    }, delay)
  )

export const nextTick = () => act(() => sleep(1))

export const focusOn = (element: any) =>
  act(async () => {
    fireEvent.focus(element)
  })

export const createKey = () => 'swr-key-' + ~~(Math.random() * 1e7)

const _renderWithConfig = (
  element: React.ReactElement,
  config: Parameters<typeof SWRConfig>[0]['value']
): ReturnType<typeof render> => {
  const TestSWRConfig = ({ children }: { children: React.ReactNode }) => (
    <SWRConfig value={config}>{children}</SWRConfig>
  )
  return render(element, { wrapper: TestSWRConfig })
}

export const renderWithConfig = (
  element: React.ReactElement,
  config?: Parameters<typeof _renderWithConfig>[1]
): ReturnType<typeof _renderWithConfig> => {
  const provider = () => new Map()
  return _renderWithConfig(element, { provider, ...config })
}

export const renderWithGlobalCache = (
  element: React.ReactElement,
  config?: Parameters<typeof _renderWithConfig>[1]
): ReturnType<typeof _renderWithConfig> => {
  return _renderWithConfig(element, { ...config })
}

export const mockVisibilityHidden = () => {
  const mockVisibilityState = jest.spyOn(document, 'visibilityState', 'get')
  mockVisibilityState.mockImplementation(() => 'hidden')
  return () => mockVisibilityState.mockRestore()
}

// Using `act()` will cause React 18 to batch updates.
// https://github.com/reactwg/react-18/discussions/102
export async function executeWithoutAct(fn: () => any) {
  const prev = global.IS_REACT_ACT_ENVIRONMENT
  global.IS_REACT_ACT_ENVIRONMENT = false
  await fn()
  global.IS_REACT_ACT_ENVIRONMENT = prev
}
