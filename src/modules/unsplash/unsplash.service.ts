// src/unsplash/unsplash.service.ts
import { Injectable } from '@nestjs/common'
import { createApi } from 'unsplash-js'
import * as nodeFetch from 'node-fetch'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '../http/http.service'
import { ApiInternalServerException } from '@/utils/exception'
import { Random } from 'unsplash-js/dist/methods/photos/types'

const DEFAULT_COUNT = 50
const DEFAULT_COLLECTION_IDS = ['317099']

@Injectable()
export class UnsplashService {
  private unsplash
  constructor(private configService: ConfigService) {
    this.unsplash = createApi({
      accessKey: configService.get('unsplash.accessKey')!,
      fetch: nodeFetch,
    })
  }

  async searchPhotos(query: string): Promise<Random[]> {
    const result = await this.unsplash.search.getPhotos({
      query,
      page: 1,
      perPage: DEFAULT_COUNT,
    })

    if (result.errors) {
      console.log(result.errors)
      throw new ApiInternalServerException('unsplashApiError', {
        errors: result.errors[0],
      })
    }

    return result.response.results
  }

  async getRandomPhoto(): Promise<Random[]> {
    const result = await this.unsplash.photos.getRandom({
      collectionIds: DEFAULT_COLLECTION_IDS,
      count: DEFAULT_COUNT,
    })

    if (result.errors) {
      console.log(result.errors)
      throw new ApiInternalServerException('unsplashApiError', {
        errors: result.errors[0],
      })
    }

    let response = result.response

    if (!Array.isArray(response)) {
      response = [response]
    }

    return response
  }
}
