import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import Blog from './Blog'
import BlogForm from './BlogForm'

const blog = {
  title: 'Component testing is done with react-testing-library',
  author: 'Test Author',
  url: 'http://example.com/testing',
  likes: 7,
  user: { username: 'root', name: 'Root User' }
}

const user = { username: 'root', name: 'Root User' }

describe('<Blog />', () => {
  test('renders title and author but not url or likes by default', () => {
    const { container } = render(
      <Blog blog={blog} user={user} onLike={() => {}} onRemove={() => {}} />
    )

    const div = container.querySelector('.blog')
    expect(div).toHaveTextContent('Component testing is done with react-testing-library')
    expect(div).toHaveTextContent('Test Author')
    expect(container.querySelector('.blog-details')).toBeNull()
  })

  test('shows url and likes after the view button is clicked', async () => {
    const { container } = render(
      <Blog blog={blog} user={user} onLike={() => {}} onRemove={() => {}} />
    )

    const clicker = userEvent.setup()
    await clicker.click(screen.getByText('view'))

    const details = container.querySelector('.blog-details')
    expect(details).toHaveTextContent('http://example.com/testing')
    expect(details).toHaveTextContent('likes 7')
  })

  test('clicking the like button twice calls the handler twice', async () => {
    const mockHandler = vi.fn()
    render(<Blog blog={blog} user={user} onLike={mockHandler} onRemove={() => {}} />)

    const clicker = userEvent.setup()
    await clicker.click(screen.getByText('view'))
    const likeButton = screen.getByText('like')
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
    await clicker.click(screen.getByText('create'))

    expect(createBlog.mock.calls).toHaveLength(1)
    expect(createBlog.mock.calls[0][0]).toEqual({
      title: 'My new blog',
      author: 'An Author',
      url: 'http://example.com/new'
    })
  })
})
