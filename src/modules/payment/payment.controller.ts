import { Controller, Headers, Post, Request, UseGuards } from '@nestjs/common'
import { PaymentService } from './payment.service'
import { Stripe } from 'stripe'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'
import { ApiInternalServerException } from '@/utils/exception'

@ApiTags('Payment')
@Controller({
  path: 'payment',
  version: '1',
})
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly configService: ConfigService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('create-checkout-session')
  async createCheckoutSession(
    @Request() request,
  ): Promise<Stripe.Checkout.Session> {
    return this.paymentService.createCheckoutSession(request.user.id)
  }

  @Post('webhook')
  async handleWebhook(
    @Request() request,
    @Headers('stripe-signature') sig: string,
  ): Promise<void> {
    const endpointSecret = this.configService.get(
      'payment.stripeWebhookSecret',
    )!
    let event: Stripe.Event

    try {
      event = this.paymentService['stripe'].webhooks.constructEvent(
        request.rawBody,
        sig,
        endpointSecret,
      )
    } catch (err) {
      throw new ApiInternalServerException('failedToParseWebhook')
    }

    await this.paymentService.handleWebhook(event)
  }
}
