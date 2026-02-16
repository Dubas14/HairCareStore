import type { Access } from 'payload'

export const isAdmin: Access = ({ req }) => {
  return req?.user?.collection === 'users'
}

export const isAdminOrSelf: Access = ({ req }) => {
  if (!req.user) return false
  if (req.user.collection === 'users') return true
  return { id: { equals: req.user.id } }
}
