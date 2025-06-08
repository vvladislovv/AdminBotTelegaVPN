import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionPlan } from '@prisma/client';

export interface FeatureDto {
  name: string;
  value: string;
  description: string;
}

type SubscriptionPlanDetails = Omit<SubscriptionPlanDto, 'id'>;

export class SubscriptionPlanDto {
  @ApiProperty({ enum: SubscriptionPlan, example: SubscriptionPlan.BASIC })
  id!: SubscriptionPlan;

  @ApiProperty({ example: 'Basic Plan' })
  name!: string;

  @ApiProperty({ example: 'Basic subscription plan' })
  description!: string;

  @ApiProperty({ example: 1000 })
  price!: number;

  @ApiProperty({ example: 'RUB' })
  currency!: string;

  @ApiProperty({ example: 30 })
  durationDays!: number;

  @ApiProperty({ 
    type: 'array',
    items: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        value: { type: 'string' },
        description: { type: 'string' }
      }
    },
    example: [
      { name: 'Feature 1', value: 'value1', description: 'Description 1' },
      { name: 'Feature 2', value: 'value2', description: 'Description 2' }
    ]
  })
  features!: FeatureDto[];
}

const BASE_FEATURES: FeatureDto[] = [
  { name: 'Basic feature 1', value: 'true', description: 'Basic feature 1 description' },
  { name: 'Basic feature 2', value: 'true', description: 'Basic feature 2 description' },
  { name: 'Basic support', value: 'true', description: 'Basic support description' },
];

const PREMIUM_FEATURES: FeatureDto[] = [
  ...BASE_FEATURES,
  { name: 'Premium feature 1', value: 'true', description: 'Premium feature 1 description' },
  { name: 'Premium feature 2', value: 'true', description: 'Premium feature 2 description' },
  { name: 'Premium support', value: 'true', description: 'Priority support' },
  { name: 'Priority access', value: 'true', description: 'Get priority access to new features' },
  { name: 'Advanced analytics', value: 'true', description: 'Access to advanced analytics' },
];

const ENTERPRISE_FEATURES: FeatureDto[] = [
  ...PREMIUM_FEATURES,
  { name: 'Custom integrations', value: 'true', description: 'Custom integrations description' },
  { name: 'Dedicated account manager', value: 'true', description: 'Dedicated account manager description' },
  { name: 'SLA 99.9%', value: 'true', description: 'SLA 99.9% description' },
  { name: 'Custom development', value: 'true', description: 'Custom development description' },
];

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, Omit<SubscriptionPlanDto, 'id'>> = {
  [SubscriptionPlan.BASIC]: {
    name: 'Basic',
    description: 'Basic subscription plan with essential features',
    price: 1000, // 1000 RUB = 1000 kopeks
    currency: 'RUB',
    durationDays: 30,
    features: BASE_FEATURES,
  },
  [SubscriptionPlan.PREMIUM]: {
    name: 'Premium',
    description: 'Premium subscription with all features',
    price: 3000, // 3000 RUB = 3000 kopeks
    currency: 'RUB',
    durationDays: 30,
    features: PREMIUM_FEATURES,
  },
  [SubscriptionPlan.ENTERPRISE]: {
    name: 'Enterprise',
    description: 'Enterprise subscription with custom features',
    price: 5000, // 5000 RUB = 5000 kopeks
    currency: 'RUB',
    durationDays: 30,
    features: [
      ...ENTERPRISE_FEATURES,
      { name: 'Custom integrations', value: 'true', description: 'Custom integrations description' },
      { name: 'Dedicated account manager', value: 'true', description: 'Dedicated account manager description' },
      { name: 'SLA 99.9%', value: 'true', description: 'SLA 99.9% description' },
      { name: 'Custom development', value: 'true', description: 'Custom development description' },
    ],
  },
};

export const getSubscriptionPlan = (plan: SubscriptionPlan): SubscriptionPlanDto => ({
  id: plan,
  ...SUBSCRIPTION_PLANS[plan],
});

export const getAvailableSubscriptionPlans = (): SubscriptionPlanDto[] =>
  (Object.keys(SUBSCRIPTION_PLANS) as SubscriptionPlan[]).map(getSubscriptionPlan);
