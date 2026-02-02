'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Edit3, Trash2, Star, Loader2, MapPin, Phone, User } from 'lucide-react'
import type { Address } from '@/lib/medusa/hooks/use-addresses'

interface AddressCardProps {
  address: Address
  onEdit: (address: Address) => void
  onDelete: (addressId: string) => Promise<void>
  onSetDefault: (addressId: string) => Promise<void>
  isDeleting?: boolean
  isSettingDefault?: boolean
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isDeleting,
  isSettingDefault,
}: AddressCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDelete = async () => {
    await onDelete(address.id)
    setShowDeleteDialog(false)
  }

  const fullName = [address.first_name, address.last_name].filter(Boolean).join(' ')
  const isDefault = address.is_default_shipping

  return (
    <>
      <div className="bg-card rounded-2xl p-5 border border-border shadow-soft hover:shadow-soft-lg transition-shadow animate-fadeInUp">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0 space-y-3">
            {/* Name */}
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <p className="font-medium truncate">{fullName || 'Без імені'}</p>
            </div>

            {/* Phone */}
            {address.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{address.phone}</p>
              </div>
            )}

            {/* Address */}
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-sm">
                {address.city}
                {address.address_1 && `, ${address.address_1}`}
              </p>
            </div>
          </div>

          {/* Default badge */}
          {isDefault && (
            <Badge className="bg-[#2A9D8F]/10 text-[#2A9D8F] border-0 flex-shrink-0">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Основна
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(address)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Редагувати
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Видалити
          </Button>

          {!isDefault && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSetDefault(address.id)}
              disabled={isSettingDefault}
              className="text-[#2A9D8F] hover:text-[#2A9D8F] hover:bg-[#2A9D8F]/10 ml-auto"
            >
              {isSettingDefault ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Star className="w-4 h-4 mr-2" />
              )}
              Зробити основною
            </Button>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Видалити адресу?</AlertDialogTitle>
            <AlertDialogDescription>
              Ви впевнені, що хочете видалити цю адресу? Цю дію неможливо скасувати.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Видалити
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
