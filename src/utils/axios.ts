import { AxiosError, AxiosInstance } from 'axios'
import axiosRetry from 'axios-retry'

type AdditionalAxiosErrorInput = {
  description: string
  error: {
    message: string
    code: number | string
  }
  code: number | string
}

export class AxiosUtils {
  static interceptAxiosResponseError = (
    error: AxiosError<AdditionalAxiosErrorInput>,
  ) => {
    error.stack = error?.stack?.replace(
      /AxiosError.*node:internal\/process\/task_queues:[0-9]+:[0-9]+\).*axiosBetterStacktrace.ts:[0-9]+:[0-9]+\)/g,
      '',
    )

    const status = [
      error?.response?.data?.code,
      error?.response?.data?.error?.code,
      error?.response?.status,
      500,
    ].find(Boolean)

    const message = [
      error?.response?.data?.description,
      error?.response?.data?.error?.message,
      error?.response?.statusText,
      'Internal Server Error',
    ].find(Boolean)

    Object.assign(error, { message })
    Object.assign(error, { status })
    // Object.assign(error, { curl: AxiosConverter.getCurl(error, ['password', 'cpf']) });
  }

  static requestRetry = ({
    axios,
    status: statusRetry = [503, 422, 408],
  }: RequestRetry) => {
    axiosRetry(axios, {
      shouldResetTimeout: true,

      retryDelay: (retryCount, axiosError: any) => {
        return Math.pow(2, retryCount) * 1000 //Exponential Backoff
      },
      retryCondition: error => {
        if (error?.code === 'ECONNABORTED' || error?.code === 'ECONNRESET') {
          error.status = 408
        }

        const status = [error?.response?.status, error?.status, 500].find(
          Boolean,
        ) as number
        return statusRetry.includes(status)
      },
    })
  }
}

type RequestRetry = {
  status?: number[]
  axios: AxiosInstance
}
