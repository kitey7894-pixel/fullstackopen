import { test, expect } from '@playwright/test'

const { beforeEach, describe } = test

const loginWith = async (page, username, password) => {
  await page.getByRole('link', { name: 'login' }).click()
  await page.getByTestId('username').fill(username)
  await page.getByTestId('password').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

const createBlog = async (page, title, author, url) => {
  await page.getByRole('link', { name: 'create new' }).click()
  await page.getByTestId('title').fill(title)
  await page.getByTestId('author').fill(author)
  await page.getByTestId('url').fill(url)
  await page.getByRole('button', { name: 'create' }).click()
  await page.getByRole('link', { name: title }).waitFor()
}

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: { username: 'root', name: 'Root User', password: 'sekret' }
    })
    await page.goto('/')
  })

  test('login succeeds with the correct username and password', async ({ page }) => {
    await loginWith(page, 'root', 'sekret')
    await expect(page.getByText('Root User logged in')).toBeVisible()
  })

  test('login fails if the username or password is incorrect', async ({ page }) => {
    await loginWith(page, 'root', 'wrong')
    await expect(page.locator('.notification')).toContainText('wrong username or password')
    await expect(page.getByText('Root User logged in')).not.toBeVisible()
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'root', 'sekret')
      await page.getByText('Root User logged in').waitFor()
    })

    test('a logged-in user can create a blog', async ({ page }) => {
      await createBlog(page, 'E2E testing with Playwright', 'Tester', 'http://example.com/e2e')
      await expect(page.getByRole('link', { name: 'E2E testing with Playwright' })).toBeVisible()
    })

    test('a logged-in user can like a blog', async ({ page }) => {
      await createBlog(page, 'Likeable blog', 'Tester', 'http://example.com/like')
      await page.getByRole('link', { name: 'Likeable blog' }).click()
      await page.getByRole('button', { name: 'like' }).click()
      await expect(page.getByText('likes 1')).toBeVisible()
    })

    test('a logged-in user can delete a blog', async ({ page }) => {
      await createBlog(page, 'Deletable blog', 'Tester', 'http://example.com/delete')
      await page.getByRole('link', { name: 'Deletable blog' }).click()
      page.on('dialog', dialog => dialog.accept())
      await page.getByRole('button', { name: 'delete' }).click()
      await expect(page.getByRole('link', { name: 'Deletable blog' })).not.toBeVisible()
    })
  })
})
