import { Injectable } from '@nestjs/common'
import axios, { Axios, AxiosInstance } from 'axios'
import https from 'https'

import { AxiosUtils } from '@/utils/axios'

@Injectable()
export class HttpService {
  private axios: AxiosInstance

  constructor() {
    const httpsAgent = new https.Agent({
      keepAlive: true,
      rejectUnauthorized: false,
    })

    this.axios = axios.create({ proxy: false, httpsAgent })
    AxiosUtils.requestRetry({ axios: this.axios })

    this.axios.interceptors.response.use(
      response => response,
      error => {
        AxiosUtils.interceptAxiosResponseError(error)
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        return Promise.reject(error)
      },
    )
  }

  instance(): AxiosInstance | Axios {
    return this.axios
  }
}
