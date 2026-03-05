import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App'
import * as searchService from '../../src/services/github/search-github-user'
import { mockSearchResponse, mockEmptySearchResponse, mockRateLimitError } from '../mocks/github-users.mock'

vi.mock('../../src/services/github/search-github-user')

describe('GitHub Search Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Search Flow', () => {
    it('should display search input', () => {
      vi.mocked(searchService.searchGithubUser).mockResolvedValue({
        data: mockEmptySearchResponse,
        error: null,
      })

      render(<App />)

      expect(screen.getByPlaceholderText(/search github users/i)).toBeInTheDocument()
    })

    it('should show loading state during search', async () => {
      vi.mocked(searchService.searchGithubUser).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ data: mockSearchResponse, error: null }), 1000))
      )

      render(<App />)

      const input = screen.getByPlaceholderText(/search github users/i)
      await userEvent.type(input, 'test')

      vi.advanceTimersByTime(400)

      await waitFor(() => {
        expect(screen.getByText(/searching/i)).toBeInTheDocument()
      })
    })

    it('should display search results after successful search', async () => {
      vi.mocked(searchService.searchGithubUser).mockResolvedValue({
        data: mockSearchResponse,
        error: null,
      })

      render(<App />)

      const input = screen.getByPlaceholderText(/search github users/i)
      await userEvent.type(input, 'test')

      vi.advanceTimersByTime(400)

      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument()
        expect(screen.getByText('anotheruser')).toBeInTheDocument()
      })
    })

    it('should display no results message when no users found', async () => {
      vi.mocked(searchService.searchGithubUser).mockResolvedValue({
        data: mockEmptySearchResponse,
        error: null,
      })

      render(<App />)

      const input = screen.getByPlaceholderText(/search github users/i)
      await userEvent.type(input, 'nonexistent')

      vi.advanceTimersByTime(400)

      await waitFor(() => {
        expect(screen.getByText(/no users found/i)).toBeInTheDocument()
      })
    })

    it('should display error message on API error', async () => {
      vi.mocked(searchService.searchGithubUser).mockResolvedValue({
        data: null,
        error: mockRateLimitError,
      })

      render(<App />)

      const input = screen.getByPlaceholderText(/search github users/i)
      await userEvent.type(input, 'test')

      vi.advanceTimersByTime(400)

      await waitFor(() => {
        expect(screen.getByText(mockRateLimitError.message)).toBeInTheDocument()
      })
    })

    it('should debounce search requests', async () => {
      vi.mocked(searchService.searchGithubUser).mockResolvedValue({
        data: mockSearchResponse,
        error: null,
      })

      render(<App />)

      const input = screen.getByPlaceholderText(/search github users/i)

      await userEvent.type(input, 't')
      await userEvent.type(input, 'e')
      await userEvent.type(input, 's')
      await userEvent.type(input, 't')

      vi.advanceTimersByTime(300)

      expect(searchService.searchGithubUser).not.toHaveBeenCalled()

      vi.advanceTimersByTime(150)

      await waitFor(() => {
        expect(searchService.searchGithubUser).toHaveBeenCalledTimes(1)
        expect(searchService.searchGithubUser).toHaveBeenCalledWith(
          'test',
          expect.any(Object)
        )
      })
    })
  })

  describe('Edit Mode', () => {
    beforeEach(async () => {
      vi.mocked(searchService.searchGithubUser).mockResolvedValue({
        data: mockSearchResponse,
        error: null,
      })
    })

    it('should toggle edit mode when clicking edit button', async () => {
      render(<App />)

      const input = screen.getByPlaceholderText(/search github users/i)
      await userEvent.type(input, 'test')
      vi.advanceTimersByTime(400)

      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument()
      })

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()

      const editButton = screen.getByTitle(/enter edit mode/i)
      await userEvent.click(editButton)

      // 3 checkboxes: 1 select-all + 2 user cards
      expect(screen.getAllByRole('checkbox')).toHaveLength(3)
    })

    it('should show selection count when items are selected', async () => {
      render(<App />)

      const input = screen.getByPlaceholderText(/search github users/i)
      await userEvent.type(input, 'test')
      vi.advanceTimersByTime(400)

      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument()
      })

      const editButton = screen.getByTitle(/enter edit mode/i)
      await userEvent.click(editButton)

      const checkbox = screen.getByRole('checkbox', { name: /select testuser/i })
      await userEvent.click(checkbox)

      expect(screen.getByText(/1 element selected/i)).toBeInTheDocument()
    })

    it('should show "elements" (plural) when multiple items selected', async () => {
      render(<App />)

      const input = screen.getByPlaceholderText(/search github users/i)
      await userEvent.type(input, 'test')
      vi.advanceTimersByTime(400)

      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument()
      })

      const editButton = screen.getByTitle(/enter edit mode/i)
      await userEvent.click(editButton)

      // Select both user checkboxes (skip select-all at index 0)
      const userCheckbox1 = screen.getByRole('checkbox', { name: /select testuser/i })
      const userCheckbox2 = screen.getByRole('checkbox', { name: /select anotheruser/i })
      await userEvent.click(userCheckbox1)
      await userEvent.click(userCheckbox2)

      // Check that 2 elements are selected by looking at the label
      const selectAllLabel = screen.getByText((content, element) => {
        return !!(element?.classList.contains('select-all_label') && content.includes('2'))
      })
      expect(selectAllLabel).toBeInTheDocument()
    })
  })

  describe('Duplicate Action', () => {
    beforeEach(async () => {
      vi.mocked(searchService.searchGithubUser).mockResolvedValue({
        data: mockSearchResponse,
        error: null,
      })
    })

    it('should duplicate selected users', async () => {
      render(<App />)

      const input = screen.getByPlaceholderText(/search github users/i)
      await userEvent.type(input, 'test')
      vi.advanceTimersByTime(400)

      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument()
      })

      const editButton = screen.getByTitle(/enter edit mode/i)
      await userEvent.click(editButton)

      const checkbox = screen.getByRole('checkbox', { name: /select testuser/i })
      await userEvent.click(checkbox)

      const duplicateButton = screen.getByTitle(/duplicate selected/i)
      await userEvent.click(duplicateButton)

      const cards = screen.getAllByRole('article')
      expect(cards).toHaveLength(3)

      const testuserCards = screen.getAllByText('testuser')
      expect(testuserCards).toHaveLength(2)
    })

    it('should clear selection after duplicate', async () => {
      render(<App />)

      const input = screen.getByPlaceholderText(/search github users/i)
      await userEvent.type(input, 'test')
      vi.advanceTimersByTime(400)

      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument()
      })

      const editButton = screen.getByTitle(/enter edit mode/i)
      await userEvent.click(editButton)

      const checkbox = screen.getByRole('checkbox', { name: /select testuser/i })
      await userEvent.click(checkbox)

      expect(screen.getByText(/1 element selected/i)).toBeInTheDocument()

      const duplicateButton = screen.getByTitle(/duplicate selected/i)
      await userEvent.click(duplicateButton)

      expect(screen.getByText(/0 elements selected/i)).toBeInTheDocument()
    })
  })

  describe('Delete Action', () => {
    beforeEach(async () => {
      vi.mocked(searchService.searchGithubUser).mockResolvedValue({
        data: mockSearchResponse,
        error: null,
      })
    })

    it('should delete selected users', async () => {
      render(<App />)

      const input = screen.getByPlaceholderText(/search github users/i)
      await userEvent.type(input, 'test')
      vi.advanceTimersByTime(400)

      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument()
      })

      const editButton = screen.getByTitle(/enter edit mode/i)
      await userEvent.click(editButton)

      const checkbox = screen.getByRole('checkbox', { name: /select testuser/i })
      await userEvent.click(checkbox)

      const deleteButton = screen.getByTitle(/delete selected/i)
      await userEvent.click(deleteButton)

      expect(screen.queryByText('testuser')).not.toBeInTheDocument()
      expect(screen.getByText('anotheruser')).toBeInTheDocument()
    })

    it('should show no results after deleting all users', async () => {
      render(<App />)

      const input = screen.getByPlaceholderText(/search github users/i)
      await userEvent.type(input, 'test')
      vi.advanceTimersByTime(400)

      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument()
      })

      const editButton = screen.getByTitle(/enter edit mode/i)
      await userEvent.click(editButton)

      const selectAllCheckbox = screen.getByRole('checkbox', { name: /select testuser/i })
      await userEvent.click(selectAllCheckbox)

      const selectSecondCheckbox = screen.getByRole('checkbox', { name: /select anotheruser/i })
      await userEvent.click(selectSecondCheckbox)

      const deleteButton = screen.getByTitle(/delete selected/i)
      await userEvent.click(deleteButton)

      expect(screen.getByText(/no users found/i)).toBeInTheDocument()
    })
  })

  describe('Select All', () => {
    beforeEach(async () => {
      vi.mocked(searchService.searchGithubUser).mockResolvedValue({
        data: mockSearchResponse,
        error: null,
      })
    })

    it('should select all users with select all checkbox', async () => {
      render(<App />)

      const input = screen.getByPlaceholderText(/search github users/i)
      await userEvent.type(input, 'test')
      vi.advanceTimersByTime(400)

      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument()
      })

      const editButton = screen.getByTitle(/enter edit mode/i)
      await userEvent.click(editButton)

      const selectAllLabel = screen.getByText(/0 elements selected/i)
      const selectAllCheckbox = selectAllLabel.closest('label')?.querySelector('input')

      if (selectAllCheckbox) {
        await userEvent.click(selectAllCheckbox)
      }

      expect(screen.getByText(/2 elements selected/i)).toBeInTheDocument()
    })

    it('should deselect all when all are selected', async () => {
      render(<App />)

      const input = screen.getByPlaceholderText(/search github users/i)
      await userEvent.type(input, 'test')
      vi.advanceTimersByTime(400)

      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument()
      })

      const editButton = screen.getByTitle(/enter edit mode/i)
      await userEvent.click(editButton)

      // Select both users
      const userCheckbox1 = screen.getByRole('checkbox', { name: /select testuser/i })
      const userCheckbox2 = screen.getByRole('checkbox', { name: /select anotheruser/i })
      await userEvent.click(userCheckbox1)
      await userEvent.click(userCheckbox2)

      // Verify 2 selected
      let selectAllLabel = screen.getByText((content, element) => {
        return !!(element?.classList.contains('select-all_label') && content.includes('2'))
      })
      expect(selectAllLabel).toBeInTheDocument()

      // Click select-all checkbox to deselect all
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0]
      await userEvent.click(selectAllCheckbox)

      // Verify 0 selected
      selectAllLabel = screen.getByText((content, element) => {
        return !!(element?.classList.contains('select-all_label') && content.includes('0'))
      })
      expect(selectAllLabel).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible search input', () => {
      render(<App />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-label', 'Search Github users')
    })

    it('should have accessible edit toggle button', async () => {
      vi.mocked(searchService.searchGithubUser).mockResolvedValue({
        data: mockSearchResponse,
        error: null,
      })

      render(<App />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      expect(editButton).toHaveAttribute('aria-pressed', 'false')

      await userEvent.click(editButton)

      expect(editButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('should have accessible action buttons', async () => {
      vi.mocked(searchService.searchGithubUser).mockResolvedValue({
        data: mockSearchResponse,
        error: null,
      })

      render(<App />)

      const input = screen.getByPlaceholderText(/search github users/i)
      await userEvent.type(input, 'test')
      vi.advanceTimersByTime(400)

      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument()
      })

      const editButton = screen.getByTitle(/enter edit mode/i)
      await userEvent.click(editButton)

      const checkbox = screen.getByRole('checkbox', { name: /select testuser/i })
      await userEvent.click(checkbox)

      expect(screen.getByRole('button', { name: /duplicate selected items/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /delete selected items/i })).toBeInTheDocument()
    })
  })
})
