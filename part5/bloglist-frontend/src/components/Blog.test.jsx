import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import Blog from './Blog'
import BlogForm from './BlogForm'

const blog = {
  id: 'abc123',
  title: 'Component testing is done with react-testing-library',
  author: 'Test Author',
  url: 'http://example.com/testing',
  likes: 7,
  user: { username: 'root', name: 'Root User' }
}

const creator = { username: 'root', name: 'Root User' }
const otherUser = { username: 'other', name: 'Other User' }

describe('<Blog /> single blog view', () => {
  test('shows blog info and likes to unauthenticated users, without buttons', () => {
    render(<Blog blog={blog} user={null} onLike={vi.fn()} onRemove={vi.fn()} />)

    expect(screen.getByText(blog.title)).toBeDefined()
    expect(screen.getByText('by Test Author')).toBeDefined()
    expect(screen.getByText('likes 7')).toBeDefined()
    expect(screen.queryByRole('button')).toBeNull()
  })

  test('shows only the like button to a logged-in user who is not the creator', () => {
    render(<Blog blog={blog} user={otherUser} onLike={vi.fn()} onRemove={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'like' })).toBeDefined()
    expect(screen.queryByRole('button', { name: 'delete' })).toBeNull()
  })

  test('shows like and delete buttons to the creator', () => {
    render(<Blog blog={blog} user={creator} onLike={vi.fn()} onRemove={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'like' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'delete' })).toBeDefined()
  })

  test('clicking the like button twice calls the handler twice', async () => {
    const mockHandler = vi.fn()
    render(<Blog blog={blog} user={otherUser} onLike={mockHandler} onRemove={vi.fn()} />)

    const clicker = userEvent.setup()
    const likeButton = screen.getByRole('button', { name: 'like' })
    await clicker.click(likeButton)
    await clicker.click(likeButton)

    expect(mockHandler.mock.calls).toHaveLength(2)
  })
})

describe('<BlogForm />', () => {
  test('calls createBlog with the right details when a new blog is created', async () => {
    const createBlog = vi.fn()
    render(<BlogForm createBlog={createBlog} />)

    const clicker = userEvent.setup()
    await clicker.type(screen.getByPlaceholderText('title'), 'My new blog')
    await clicker.type(screen.getByPlaceholderText('author'), 'An Author')
    await clicker.type(screen.getByPlaceholderText('url'), 'http://example.com/new')
    await clicker.click(screen.getByRole('button', { name: 'create' }))

    expect(createBlog.mock.calls).toHaveLength(1)
    expect(createBlog.mock.calls[0][0]).toEqual({
      title: 'My new blog',
      author: 'An Author',
      url: 'http://example.com/new'
    })
  })
})
