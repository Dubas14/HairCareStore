'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCustomer, useLogout, useUpdateCustomer } from '@/lib/hooks/use-customer'
import {
  useAddresses,
  useAddAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
  type Address,
  type AddressInput,
} from '@/lib/hooks/use-addresses'
import { AddressCard } from './address-card'
import { AddressForm } from './address-form'
import { OrderCard } from './order-card'
import { LoyaltyTab } from './loyalty-tab'
import { useOrders } from '@/lib/hooks/use-orders'
import { useWishlist, useRemoveFromWishlist } from '@/lib/hooks/use-wishlist'
import { useRequestPasswordReset } from '@/lib/hooks/use-password'
import { useLoyalty } from '@/lib/hooks/use-loyalty'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ProductCard } from '@/components/products/product-card'
import { getImageUrl, type PayloadMedia } from '@/lib/payload/types'
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
  Edit3,
  Check,
  X,
  Loader2,
  ShoppingBag,
  Gift,
  Bell,
  CreditCard,
  Plus,
  Lock,
  CheckCircle,
  Mail,
} from 'lucide-react'

type TabType = 'overview' | 'orders' | 'wishlist' | 'loyalty' | 'addresses' | 'settings'

const tabs = [
  { id: 'overview' as TabType, label: 'Огляд', icon: User },
  { id: 'orders' as TabType, label: 'Замовлення', icon: Package },
  { id: 'wishlist' as TabType, label: 'Обране', icon: Heart },
  { id: 'loyalty' as TabType, label: 'Бонуси', icon: Gift },
  { id: 'addresses' as TabType, label: 'Адреси', icon: MapPin },
  { id: 'settings' as TabType, label: 'Налаштування', icon: Settings },
]

function OverviewTab() {
  const { customer } = useCustomer()
  const { summary: loyaltySummary } = useLoyalty()
  const { count: wishlistCount } = useWishlist()
  const { orders } = useOrders()
  const updateCustomer = useUpdateCustomer()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    phone: customer?.phone || '',
  })

  const handleSave = async () => {
    try {
      await updateCustomer.mutateAsync(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Update failed:', error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="bg-gradient-to-br from-[#2A9D8F] to-[#48CAE4] rounded-2xl p-8 text-white relative overflow-hidden animate-fadeInUp">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <h2 className="text-2xl font-semibold mb-2">
            Вітаємо, {customer?.firstName || 'Користувач'}!
          </h2>
          <p className="text-white/80">
            Раді бачити вас знову. Переглядайте замовлення та керуйте своїм акаунтом.
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 relative z-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <ShoppingBag className="w-5 h-5 mb-2" />
            <p className="text-2xl font-bold">{orders?.length ?? 0}</p>
            <p className="text-sm text-white/70">Замовлень</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <Heart className="w-5 h-5 mb-2" />
            <p className="text-2xl font-bold">{wishlistCount}</p>
            <p className="text-sm text-white/70">В обраному</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <Gift className="w-5 h-5 mb-2" />
            <p className="text-2xl font-bold">{loyaltySummary?.pointsBalance ?? 0}</p>
            <p className="text-sm text-white/70">Бонусів</p>
          </div>
        </div>
      </div>

      {/* Profile info */}
      <div className="bg-card rounded-2xl p-6 shadow-soft animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Особиста інформація</h3>
          {!isEditing ? (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              <Edit3 className="w-4 h-4 mr-2" />
              Редагувати
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
                disabled={updateCustomer.isPending}
              >
                <X className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={updateCustomer.isPending}
                className="bg-[#2A9D8F] hover:bg-[#238B7E]"
              >
                {updateCustomer.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Ім&apos;я</label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Прізвище</label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">Телефон</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+380 XX XXX XXXX"
                className="h-11 rounded-xl"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 py-3 border-b border-border">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Ім&apos;я</p>
                <p className="font-medium">
                  {customer?.firstName} {customer?.lastName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 py-3 border-b border-border">
              <svg aria-hidden="true" className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{customer?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 py-3">
              <svg aria-hidden="true" className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <p className="text-sm text-muted-foreground">Телефон</p>
                <p className="font-medium">{customer?.phone || 'Не вказано'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
        <Link
          href="/shop"
          className="flex items-center justify-between p-5 bg-card rounded-2xl shadow-soft hover:shadow-soft-lg transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#2A9D8F]/10 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-[#2A9D8F]" />
            </div>
            <div>
              <p className="font-medium">Продовжити покупки</p>
              <p className="text-sm text-muted-foreground">Переглянути каталог</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/account/orders"
          className="flex items-center justify-between p-5 bg-card rounded-2xl shadow-soft hover:shadow-soft-lg transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#48CAE4]/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-[#48CAE4]" />
            </div>
            <div>
              <p className="font-medium">Мої замовлення</p>
              <p className="text-sm text-muted-foreground">Відстежити статус</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}

function OrdersTab() {
  const { orders, isLoading, hasMore } = useOrders()
  const [page, setPage] = useState(1)

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-8 shadow-soft flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2A9D8F]" />
      </div>
    )
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-8 shadow-soft text-center animate-fadeInUp">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <Package className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Замовлень поки немає</h3>
        <p className="text-muted-foreground mb-6">
          Ваші замовлення з&apos;являться тут після першої покупки
        </p>
        <Link href="/shop">
          <Button className="rounded-full bg-[#2A9D8F] hover:bg-[#238B7E]">
            Перейти до каталогу
          </Button>
        </Link>
      </div>
    )
  }

  // Orders list
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Мої замовлення</h3>

      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      {hasMore && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full"
          >
            Завантажити більше
          </Button>
        </div>
      )}
    </div>
  )
}

function WishlistTab() {
  const { items, isLoading, count } = useWishlist()

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-8 shadow-soft flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2A9D8F]" />
      </div>
    )
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-8 shadow-soft text-center animate-fadeInUp">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Список бажань порожній</h3>
        <p className="text-muted-foreground mb-6">
          Додавайте товари до обраного, щоб не загубити їх
        </p>
        <Link href="/shop">
          <Button className="rounded-full bg-[#2A9D8F] hover:bg-[#238B7E]">
            Переглянути товари
          </Button>
        </Link>
      </div>
    )
  }

  // Wishlist grid
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          Обране ({count})
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((product, index) => {
          // Transform Payload product to ProductCard format
          const variant = product.variants?.[0]
          const price = variant?.price || 0
          const originalPrice = variant?.compareAtPrice || price

          const productCardData = {
            id: typeof product.id === 'string' ? index + 1 : (product.id as number),
            productId: String(product.id),
            name: product.title,
            brand: product.subtitle || 'HAIR LAB',
            slug: product.handle,
            price: Math.round(price),
            oldPrice: originalPrice > price ? Math.round(originalPrice) : undefined,
            discount: originalPrice > price
              ? Math.round(((originalPrice - price) / originalPrice) * 100)
              : undefined,
            imageUrl: getImageUrl(product.thumbnail as PayloadMedia | undefined) || '',
            rating: 0,
            reviewCount: 0,
            variantIndex: 0,
          }

          return (
            <ProductCard key={product.id} product={productCardData} />
          )
        })}
      </div>
    </div>
  )
}

function AddressesTab() {
  const { addresses, isLoading } = useAddresses()
  const addAddress = useAddAddress()
  const updateAddress = useUpdateAddress()
  const deleteAddress = useDeleteAddress()
  const setDefaultAddress = useSetDefaultAddress()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [editingIndex, setEditingIndex] = useState<number>(-1)

  const handleAddAddress = async (data: AddressInput) => {
    await addAddress.mutateAsync(data)
  }

  const handleUpdateAddress = async (data: AddressInput) => {
    if (!editingAddress || editingIndex < 0) return
    await updateAddress.mutateAsync({ index: editingIndex, data })
    setEditingAddress(null)
    setEditingIndex(-1)
  }

  const handleDeleteAddress = async (addressId: string) => {
    const index = addresses.findIndex((a: Address) => a.id === addressId)
    if (index < 0) return
    await deleteAddress.mutateAsync(index)
  }

  const handleSetDefault = async (addressId: string) => {
    const index = addresses.findIndex((a: Address) => a.id === addressId)
    if (index < 0) return
    await setDefaultAddress.mutateAsync(index)
  }

  const handleEdit = (address: Address) => {
    const index = addresses.findIndex((a: Address) => a.id === address.id)
    setEditingAddress(address)
    setEditingIndex(index)
    setIsFormOpen(true)
  }

  const handleOpenForm = () => {
    setEditingAddress(null)
    setIsFormOpen(true)
  }

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-8 shadow-soft flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2A9D8F]" />
      </div>
    )
  }

  // Empty state
  if (addresses.length === 0) {
    return (
      <>
        <div className="bg-card rounded-2xl p-8 shadow-soft text-center animate-fadeInUp">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Адрес поки немає</h3>
          <p className="text-muted-foreground mb-6">
            Додайте адресу доставки для швидшого оформлення замовлень
          </p>
          <Button
            onClick={handleOpenForm}
            className="rounded-full bg-[#2A9D8F] hover:bg-[#238B7E]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Додати адресу
          </Button>
        </div>

        <AddressForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={handleAddAddress}
          isLoading={addAddress.isPending}
        />
      </>
    )
  }

  // Addresses list
  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Мої адреси</h3>
          {addresses.length < 5 && (
            <Button
              onClick={handleOpenForm}
              variant="outline"
              size="sm"
              className="rounded-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Додати адресу
            </Button>
          )}
        </div>

        {/* Address cards */}
        <div className="grid gap-4">
          {addresses.map((address: Address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleEdit}
              onDelete={handleDeleteAddress}
              onSetDefault={handleSetDefault}
              isDeleting={deleteAddress.isPending}
              isSettingDefault={setDefaultAddress.isPending}
            />
          ))}
        </div>

        {/* Max addresses hint */}
        {addresses.length >= 5 && (
          <p className="text-sm text-muted-foreground text-center mt-4">
            Максимум 5 адрес. Видаліть існуючу, щоб додати нову.
          </p>
        )}
      </div>

      <AddressForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        address={editingAddress}
        onSubmit={editingAddress ? handleUpdateAddress : handleAddAddress}
        isLoading={addAddress.isPending || updateAddress.isPending}
      />
    </>
  )
}

function SettingsTab() {
  const { customer } = useCustomer()
  const requestPasswordReset = useRequestPasswordReset()
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordResetSent, setPasswordResetSent] = useState(false)
  const [passwordResetError, setPasswordResetError] = useState<string | null>(null)

  const handleRequestPasswordReset = async () => {
    if (!customer?.email) return

    setPasswordResetError(null)
    try {
      await requestPasswordReset.mutateAsync(customer.email)
      setPasswordResetSent(true)
    } catch (error) {
      setPasswordResetError(
        error instanceof Error ? error.message : 'Помилка надсилання. Спробуйте пізніше.'
      )
    }
  }

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false)
    setPasswordResetSent(false)
    setPasswordResetError(null)
  }

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Notifications */}
      <div className="bg-card rounded-2xl p-6 shadow-soft">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Сповіщення
        </h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium">Email-розсилка</p>
              <p className="text-sm text-muted-foreground">Новинки та акції</p>
            </div>
            <div className="relative">
              <input type="checkbox" className="peer sr-only" defaultChecked />
              <div className="w-11 h-6 rounded-full bg-muted peer-checked:bg-[#2A9D8F] transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
            </div>
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium">SMS-сповіщення</p>
              <p className="text-sm text-muted-foreground">Статус замовлення</p>
            </div>
            <div className="relative">
              <input type="checkbox" className="peer sr-only" />
              <div className="w-11 h-6 rounded-full bg-muted peer-checked:bg-[#2A9D8F] transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
            </div>
          </label>
        </div>
      </div>

      {/* Security */}
      <div className="bg-card rounded-2xl p-6 shadow-soft">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Безпека
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="font-medium">Змінити пароль</p>
              <p className="text-sm text-muted-foreground">Оновіть пароль для безпеки</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setShowPasswordModal(true)}
            >
              Змінити
            </Button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Акаунт створено</p>
              <p className="text-sm text-muted-foreground">
                {customer?.createdAt
                  ? new Date(customer.createdAt).toLocaleDateString('uk-UA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Невідомо'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-card rounded-2xl p-6 shadow-soft border border-destructive/20">
        <h3 className="text-lg font-semibold mb-4 text-destructive">Небезпечна зона</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Видалення акаунту є незворотним. Всі ваші дані буде втрачено.
        </p>
        <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-white rounded-full">
          Видалити акаунт
        </Button>
      </div>

      {/* Password Change Modal */}
      <Dialog open={showPasswordModal} onOpenChange={handleClosePasswordModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Зміна пароля
            </DialogTitle>
            <DialogDescription>
              {passwordResetSent
                ? 'Перевірте вашу пошту для подальших інструкцій.'
                : 'Ми надішлемо посилання для зміни пароля на вашу електронну пошту.'}
            </DialogDescription>
          </DialogHeader>

          {passwordResetSent ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-[#2A9D8F]/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#2A9D8F]" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Лист надіслано на</p>
              <p className="font-medium">{customer?.email}</p>
              <Button
                onClick={handleClosePasswordModal}
                className="mt-6 rounded-full bg-[#2A9D8F] hover:bg-[#238B7E]"
              >
                Зрозуміло
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-xl">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Лист буде надіслано на</p>
                  <p className="font-medium">{customer?.email}</p>
                </div>
              </div>

              {passwordResetError && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{passwordResetError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-full"
                  onClick={handleClosePasswordModal}
                >
                  Скасувати
                </Button>
                <Button
                  className="flex-1 rounded-full bg-[#2A9D8F] hover:bg-[#238B7E]"
                  onClick={handleRequestPasswordReset}
                  disabled={requestPasswordReset.isPending}
                >
                  {requestPasswordReset.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Надсилаємо...
                    </>
                  ) : (
                    'Надіслати лист'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function AccountDashboard() {
  const router = useRouter()
  const { customer, isLoading } = useCustomer()
  const logout = useLogout()
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  useEffect(() => {
    if (!isLoading && !customer) {
      router.push('/account/login')
    }
  }, [customer, isLoading, router])

  const handleLogout = async () => {
    await logout.mutateAsync()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2A9D8F]" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2A9D8F]" />
      </div>
    )
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />
      case 'orders':
        return <OrdersTab />
      case 'wishlist':
        return <WishlistTab />
      case 'loyalty':
        return <LoyaltyTab />
      case 'addresses':
        return <AddressesTab />
      case 'settings':
        return <SettingsTab />
      default:
        return <OverviewTab />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2A9D8F] to-[#48CAE4] py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-display font-semibold text-white animate-fadeInUp">
            Особистий кабінет
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0 animate-fadeInUp">
            <nav className="bg-card rounded-2xl p-4 shadow-soft sticky top-24">
              <ul className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-[#2A9D8F]/10 text-[#2A9D8F] font-medium'
                            : 'text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {tab.label}
                      </button>
                    </li>
                  )
                })}
              </ul>

              <div className="border-t border-border mt-4 pt-4">
                <button
                  onClick={handleLogout}
                  disabled={logout.isPending}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-destructive hover:bg-destructive/10 transition-colors"
                >
                  {logout.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <LogOut className="w-5 h-5" />
                  )}
                  Вийти
                </button>
              </div>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">{renderTab()}</main>
        </div>
      </div>
    </div>
  )
}
