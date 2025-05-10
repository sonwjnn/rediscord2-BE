import {
  Controller,
  Get,
  Headers,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common'
import { PaymentService } from './payment.service'
import { Stripe } from 'stripe'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'
import { ApiInternalServerException } from '@/utils/exception'
import { SubscriptionResponseDto } from './dto/subscription-response.dto'

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

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('billing')
  async createBilling(
    @Request() request,
  ): Promise<Stripe.BillingPortal.Session> {
    return this.paymentService.createBilling(request.user.id)
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('subscription')
  async currentSubscription(
    @Request() request,
  ): Promise<SubscriptionResponseDto> {
    return this.paymentService.currentSubscription(request.user.id)
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
