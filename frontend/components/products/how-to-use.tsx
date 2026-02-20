'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Droplets, Hand, Sparkles, ShowerHead, type LucideIcon } from 'lucide-react'

type IconName = 'droplets' | 'hand' | 'sparkles' | 'shower-head'

const iconMap: Record<IconName, LucideIcon> = {
  droplets: Droplets,
  hand: Hand,
  sparkles: Sparkles,
  'shower-head': ShowerHead,
}

interface Step {
  id: string
  title: string
  description: string
  icon: IconName
}

interface HowToUseProps {
  steps: Step[]
  className?: string
}

const defaultSteps: Step[] = [
  {
    id: 'wet',
    title: 'Зволожте',
    description: 'Ретельно зволожте волосся теплою водою',
    icon: 'droplets',
  },
  {
    id: 'apply',
    title: 'Нанесіть',
    description: 'Нанесіть невелику кількість засобу на долоні та рівномірно розподіліть по волоссю',
    icon: 'hand',
  },
  {
    id: 'massage',
    title: 'Масажуйте',
    description: 'Злегка помасажуйте шкіру голови протягом 2-3 хвилин',
    icon: 'sparkles',
  },
  {
    id: 'rinse',
    title: 'Змийте',
    description: 'Ретельно змийте теплою водою. За потреби повторіть',
    icon: 'shower-head',
  },
]

function StepIcon({ name, className }: { name: IconName; className?: string }) {
  const Icon = iconMap[name]
  if (!Icon) return null
  return <Icon className={className} />
}

export function HowToUse({ steps = defaultSteps, className }: HowToUseProps) {
  return (
    <section className={className}>
      <h2 className="text-xl font-semibold mb-6">Як використовувати</h2>

      <Tabs defaultValue={steps[0]?.id || 'wet'}>
        <TabsList className="flex-wrap">
          {steps.map((step, index) => (
            <TabsTrigger key={step.id} value={step.id}>
              <StepIcon name={step.icon} className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{index + 1}. </span>
              {step.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {steps.map((step) => (
          <TabsContent key={step.id} value={step.id}>
            <div className="bg-muted/50 rounded-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <StepIcon name={step.icon} className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )
}
