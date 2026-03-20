import type { Access } from 'payload'

export const isAdmin: Access = ({ req }) => {
  return req?.user?.collection === 'users'
}

export const isAdminOrSelf: Access = ({ req }) => {
  if (!req.user) return false
  if (req.user.collection === 'users') return true
  return { id: { equals: req.user.id } }
}

type CrudAction = 'read' | 'create' | 'update' | 'delete'

interface UserPermissions {
  [slug: string]: {
    read?: boolean
    create?: boolean
    update?: boolean
    delete?: boolean
  }
}

/**
 * Access control for collections.
 * Admins always have full access. Editors use permissions from their user record.
 */
export function collectionAccess(slug: string, action: CrudAction): Access {
  return ({ req: { user } }) => {
    if (!user) return false
    if (user.role === 'admin') return true

    const permissions = user.permissions as UserPermissions | undefined
    if (!permissions || !permissions[slug]) return false

    return permissions[slug][action] === true
  }
}

/**
 * Access control for globals.
 */
export function globalAccess(slug: string, action: 'read' | 'update'): Access {
  return ({ req: { user } }) => {
    if (!user) return false
    if (user.role === 'admin') return true

    const permissions = user.permissions as UserPermissions | undefined
    if (!permissions || !permissions[slug]) return false

    return permissions[slug][action] === true
  }
}
