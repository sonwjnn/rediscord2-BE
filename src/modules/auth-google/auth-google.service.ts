import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OAuth2Client } from 'google-auth-library'
import { SocialInterface } from '@/modules/social/interfaces/social.interface'
import { AuthGoogleLoginDto } from './dto/auth-google-login.dto'
import { AllConfigType } from '@/config/config.type'
import { ApiUnprocessableEntityException } from '@/utils/exception'
import axios from 'axios'

@Injectable()
export class AuthGoogleService {
  private google: OAuth2Client

  constructor(private configService: ConfigService<AllConfigType>) {
    this.google = new OAuth2Client(
      configService.get('google.clientId', { infer: true }),
      configService.get('google.clientSecret', { infer: true }),
    )
  }

  // async getProfileByIdToken(
  //   loginDto: AuthGoogleLoginDto,
  // ): Promise<SocialInterface> {
  //   const ticket = await this.google.verifyIdToken({
  //     idToken: loginDto.idToken,
  //     audience: [
  //       this.configService.getOrThrow('google.clientId', { infer: true }),
  //     ],
  //   })

  //   const data = ticket.getPayload()

  //   if (!data) {
  //     throw new ApiUnprocessableEntityException('wrongToken')
  //   }

  //   return {
  //     id: data.sub,
  //     email: data.email,
  //     type: 'oauth',
  //     firstName: data.given_name,
  //     lastName: data.family_name,
  //   }
  // }

  async getProfileByAccessToken(
    loginDto: AuthGoogleLoginDto,
  ): Promise<SocialInterface> {
    const response = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: {
          Authorization: `Bearer ${loginDto.token}`,
        },
      },
    )

    const googleUser = response.data

    return {
      id: googleUser.sub,
      email: googleUser.email,
      type: 'oauth',
      firstName: googleUser.given_name,
      lastName: googleUser.family_name,
    }
  }
}
