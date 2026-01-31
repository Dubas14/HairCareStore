'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

interface Step {
  id: string
  title: string
  description: string
  icon: string
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
    icon: '💧',
  },
  {
    id: 'apply',
    title: 'Нанесіть',
    description: 'Нанесіть невелику кількість засобу на долоні та рівномірно розподіліть по волоссю',
    icon: '✋',
  },
  {
    id: 'massage',
    title: 'Масажуйте',
    description: 'Злегка помасажуйте шкіру голови протягом 2-3 хвилин',
    icon: '🧘',
  },
  {
    id: 'rinse',
    title: 'Змийте',
    description: 'Ретельно змийте теплою водою. За потреби повторіть',
    icon: '🚿',
  },
]

export function HowToUse({ steps = defaultSteps, className }: HowToUseProps) {
  return (
    <section className={className}>
      <h2 className="text-xl font-semibold mb-6">Як використовувати</h2>

      <Tabs defaultValue={steps[0]?.id || 'wet'}>
        <TabsList className="flex-wrap">
          {steps.map((step, index) => (
            <TabsTrigger key={step.id} value={step.id}>
              <span className="mr-2">{step.icon}</span>
              <span className="hidden sm:inline">{index + 1}. </span>
              {step.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {steps.map((step) => (
          <TabsContent key={step.id} value={step.id}>
            <div className="bg-muted/50 rounded-card p-6">
              <div className="flex items-start gap-4">
                <span className="text-4xl">{step.icon}</span>
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
