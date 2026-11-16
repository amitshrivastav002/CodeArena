import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, it, vi } from 'vitest'
import ProblemsPage from './ProblemsPage'

const problem = { slug: 'two-sum', title: 'Two Sum', difficulty: 'Easy', tags: ['Array'] }

function mockFetch(items: unknown[]) {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ total: items.length, items }) })))
}

const setup = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter><ProblemsPage /></MemoryRouter>
    </QueryClientProvider>,
  )

afterEach(() => vi.unstubAllGlobals())

it('lists problems from the API', async () => {
  mockFetch([problem])
  setup()
  expect(await screen.findByText('Two Sum')).toBeTruthy()
})

it('shows empty state when nothing matches', async () => {
  mockFetch([])
  setup()
  fireEvent.change(screen.getByLabelText('Search problems'), { target: { value: 'zzzz' } })
  expect(await screen.findByText('No problems match your filters.')).toBeTruthy()
})
