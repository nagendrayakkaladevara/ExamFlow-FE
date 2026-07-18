export const CSRF_HEADER = 'X-Requested-With'
export const CSRF_HEADER_VALUE = 'XMLHttpRequest'

export function getCsrfHeaders(): Record<string, string> {
  return {
    [CSRF_HEADER]: CSRF_HEADER_VALUE,
  }
}
