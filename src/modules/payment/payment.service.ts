import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { Stripe } from 'stripe'
import { ConfigService } from '@nestjs/config'
import { UserService } from '@/modules/user/user.service'
import { ApiBadRequestException, ApiNotFoundException } from '@/utils/exception'
import { PrismaService } from '../prisma'

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

    try {
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
    } catch (error) {
      console.error('Error creating session:', error)
      throw new InternalServerErrorException(
        'Failed to create checkout session',
      )
    }
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
