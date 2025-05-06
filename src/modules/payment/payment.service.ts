import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { Stripe } from 'stripe'
import { ConfigService } from '@nestjs/config'
import { UserService } from '@/modules/user/user.service'
import { ApiBadRequestException, ApiNotFoundException } from '@/utils/exception'
import { PrismaService } from '../prisma'
import { checkIsActive } from '@/utils/check-is-active'
import { SubscriptionResponseDto } from './dto/subscription-response.dto'

@Injectable()
export class PaymentService {
  private stripe: Stripe

  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private db: PrismaService,
  ) {
    this.stripe = new Stripe(configService.get('payment.stripeApiKey')!)
  }

  async createCheckoutSession(
    userId: string,
  ): Promise<Stripe.Checkout.Session> {
    const user = await this.userService.findById(userId)

    if (!user) {
      throw new ApiNotFoundException('userNotFound')
    }

    const session = await this.stripe.checkout.sessions.create({
      success_url: `${this.configService.get('app.frontendDomain')}?success=1`,
      cancel_url: `${this.configService.get('app.frontendDomain')}?cancel=1`,
      payment_method_types: ['card'],
      mode: 'subscription',
      billing_address_collection: 'auto',
      customer_email: user.email || '',
      line_items: [
        {
          price: this.configService.get('payment.stripePriceId')!,
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
      },
    })

    return session
  }

  async createBilling(userId: string): Promise<Stripe.BillingPortal.Session> {
    const user = await this.userService.findById(userId)

    if (!user) {
      throw new ApiNotFoundException('userNotFound')
    }

    const subscription = await this.db.subscription.findFirst({
      where: { userId },
    })

    if (!subscription) {
      throw new ApiNotFoundException('subscriptionNotFound')
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: subscription.customerId,
      return_url: `${this.configService.get('app.frontendDomain')}`,
    })

    if (!session || session.url) {
      throw new InternalServerErrorException('failedToCreateBillingSession')
    }

    return session
  }

  async currentSubscription(userId: string): Promise<SubscriptionResponseDto> {
    const subscription = await this.db.subscription.findFirst({
      where: { userId },
    })

    if (!subscription) {
      throw new ApiNotFoundException('subscriptionNotFound')
    }

    const active = checkIsActive(subscription)

    return { ...subscription, active }
  }

  async handleWebhook(event: Stripe.Event) {
    const session = event.data.object as Stripe.Checkout.Session

    if (event.type === 'checkout.session.completed') {
      const subscription = await this.stripe.subscriptions.retrieve(
        session.subscription as string,
      )

      if (!session?.metadata?.userId) {
        throw new ApiBadRequestException('invalidSession')
      }

      let currentPeriodEnd = new Date()

      if (subscription.items?.data && subscription.items.data.length > 0) {
        const item = subscription.items.data[0]
        if (item.current_period_end) {
          currentPeriodEnd = new Date(item.current_period_end * 1000)
        }
      }

      const existingSubscription = await this.db.subscription.findFirst({
        where: { userId: session.metadata.userId },
      })

      if (existingSubscription) {
        await this.db.subscription.delete({
          where: { id: existingSubscription.id },
        })
      }

      await this.db.subscription.create({
        data: {
          status: subscription.status,
          userId: session.metadata.userId,
          subscriptionId: subscription.id,
          customerId: subscription.customer as string,
          priceId: subscription.items.data[0].price.product as string,
          currentPeriodEnd,
        },
      })
    }

    if (event.type === 'invoice.payment_succeeded') {
      const session = event.data.object as Stripe.Invoice

      const subscriptionId = session.parent?.subscription_details
        ?.subscription as string

      const subscription =
        await this.stripe.subscriptions.retrieve(subscriptionId)

      // if (!session?.metadata?.userId) {
      //   throw new ApiBadRequestException('invalidSession')
      // }

      let currentPeriodEnd = new Date()

      if (subscription.items?.data && subscription.items.data.length > 0) {
        const item = subscription.items.data[0]
        if (item.current_period_end) {
          currentPeriodEnd = new Date(item.current_period_end * 1000)
        }
      }

      const existingSubscription = await this.db.subscription.findFirst({
        where: { subscriptionId: subscription.id },
      })

      if (!existingSubscription) {
        throw new ApiBadRequestException('subscriptionNotFound')
      }

      await this.db.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          status: subscription.status,
          currentPeriodEnd,
          updatedAt: new Date(),
        },
      })
    }
  }
}
