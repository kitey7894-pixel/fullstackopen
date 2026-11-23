import { test, expect } from '@playwright/test'

const { beforeEach, describe } = test

const loginWith = async (page, username, password) => {
  await page.getByTestId('username').fill(username)
  await page.getByTestId('password').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

const createBlog = async (page, title, author, url) => {
  await page.getByRole('button', { name: 'create new blog' }).click()
  await page.getByTestId('title').fill(title)
  await page.getByTestId('author').fill(author)
  await page.getByTestId('url').fill(url)
  await page.getByRole('button', { name: 'create' }).click()
  await page.getByText(`${title} ${author}`).waitFor()
}

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: { username: 'root', name: 'Root User', password: 'sekret' }
    })
    await request.post('/api/users', {
      data: { username: 'other', name: 'Other User', password: 'sekret' }
    })
    await page.goto('/')
  })

  test('login form is shown', async ({ page }) => {
    await expect(page.getByText('log in to application')).toBeVisible()
    await expect(page.getByTestId('username')).toBeVisible()
    await expect(page.getByTestId('password')).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'root', 'sekret')
      await expect(page.getByText('Root User logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'root', 'wrong')
      const notification = page.locator('.notification')
      await expect(notification).toContainText('wrong username or password')
      await expect(notification).toHaveCSS('color', 'rgb(255, 0, 0)')
      await expect(page.getByText('Root User logged in')).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'root', 'sekret')
    })

    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, 'E2E testing with Playwright', 'Tester', 'http://example.com/e2e')
      await expect(
        page.getByText('E2E testing with Playwright Tester')
      ).toBeVisible()
    })

    test('a blog can be liked', async ({ page }) => {
      await createBlog(page, 'Likeable blog', 'Tester', 'http://example.com/like')
      await page.getByRole('button', { name: 'view' }).click()
      await page.getByRole('button', { name: 'like' }).click()
      await expect(page.getByText('likes 1')).toBeVisible()
    })

    test('the creator can delete their blog', async ({ page }) => {
      await createBlog(page, 'Deletable blog', 'Tester', 'http://example.com/delete')
      await page.getByRole('button', { name: 'view' }).click()
      page.on('dialog', dialog => dialog.accept())
      await page.getByRole('button', { name: 'remove' }).click()
      await expect(page.getByText('Deletable blog Tester')).not.toBeVisible()
    })

    test('only the creator sees the remove button', async ({ page }) => {
      await createBlog(page, 'Private blog', 'Tester', 'http://example.com/private')
      await page.getByRole('button', { name: 'logout' }).click()

      await loginWith(page, 'other', 'sekret')
      await page.getByRole('button', { name: 'view' }).click()
      await expect(page.getByText('http://example.com/private')).toBeVisible()
      await expect(page.getByRole('button', { name: 'remove' })).not.toBeVisible()
    })

    test('blogs are ordered by likes, most liked first', async ({ page }) => {
      await createBlog(page, 'Least liked', 'Tester', 'http://example.com/least')
      await createBlog(page, 'Most liked', 'Tester', 'http://example.com/most')

      const mostLiked = page.locator('.blog', { hasText: 'Most liked' })
      await mostLiked.getByRole('button', { name: 'view' }).click()
      await mostLiked.getByRole('button', { name: 'like' }).click()
      await mostLiked.getByText('likes 1').waitFor()
      await mostLiked.getByRole('button', { name: 'like' }).click()
      await mostLiked.getByText('likes 2').waitFor()

      const blogs = page.locator('.blog')
      await expect(blogs.first()).toContainText('Most liked')
      await expect(blogs.last()).toContainText('Least liked')
    })
  })
})
