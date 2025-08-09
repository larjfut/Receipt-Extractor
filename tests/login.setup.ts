import { test as setup } from '@playwright/test'
import { loginM365 } from './helpers/login-m365'

setup('login', async ({ page }) => {
  await loginM365(page)
})
