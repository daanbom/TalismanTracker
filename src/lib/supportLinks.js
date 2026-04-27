const configuredSupportUrl = (
  import.meta.env.VITE_SUPPORT_URL ??
  import.meta.env.VITE_KOFI_URL ??
  import.meta.env.VITE_BUY_ME_A_COFFEE_URL ??
  ''
).trim()

export const BUY_ME_A_COFFEE_URL = configuredSupportUrl || null

export const BUY_ME_A_COFFEE_COPY = {
  footerLabel: 'Support me',
  homeTitle: 'Support Talisman Tracker',
  homeBody: 'If you are enjoying the site, you can support me at Ko-fi. Any tips are appreciated!',
  buttonLabel: 'Support on Ko-fi',
}
