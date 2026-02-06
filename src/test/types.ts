import type { Assertion } from 'vitest'

interface CustomMatchers {
  toBeInTheDocument(): Assertion
  toHaveAttribute(attr: string, value?: string): Assertion
  toHaveTextContent(text: string | RegExp): Assertion
  toBeVisible(): Assertion
  toBeDisabled(): Assertion
  toBeEnabled(): Assertion
  toHaveClass(...classes: string[]): Assertion
  toHaveStyle(css: Record<string, string>): Assertion
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers {}
}
