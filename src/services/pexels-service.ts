import fetch from 'node-fetch';

/**
 * Interfaces for Pexels API responses
 */
interface PhotoSource {
  original: string;
  large2x: string;
  large: string;
  medium: string;
  small: string;
  portrait: string;
  landscape: string;
  tiny: string;
}

interface Photo {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: PhotoSource;
  liked: boolean;
  alt: string;
}

interface PhotoSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: Photo[];
  next_page?: string;
  prev_page?: string;
}

interface VideoFile {
  id: number;
  quality: string;
  file_type: string;
  width: number;
  height: number;
  fps?: number;
  link: string;
}

interface VideoPicture {
  id: number;
  nr: number;
  picture: string;
}

interface VideoUser {
  id: number;
  name: string;
  url: string;
}

interface Video {
  id: number;
  width: number;
  height: number;
  url: string;
  image: string;
  duration: number;
  user: VideoUser;
  video_files: VideoFile[];
  video_pictures: VideoPicture[];
}

interface VideoSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  videos: Video[];
  next_page?: string;
  prev_page?: string;
}

interface Collection {
  id: string;
  title: string;
  description: string | null;
  private: boolean;
  media_count: number;
  photos_count: number;
  videos_count: number;
}

interface CollectionsResponse {
  collections: Collection[];
  page: number;
  per_page: number;
  total_results: number;
  next_page?: string;
  prev_page?: string;
}

interface CollectionMedia {
  id: string;
  media: (Photo | Video)[];
  page: number;
  per_page: number;
  total_results: number;
  next_page?: string;
  prev_page?: string;
}

/**
 * Service for interacting with the Pexels API
 */
export class PexelsService {
  private readonly baseUrl = 'https://api.pexels.com';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.PEXELS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('No Pexels API key provided. Service will not function without an API key.');
    }
  }

  /**
   * Sets the API key for the service
   * @param apiKey The Pexels API key
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Makes a request to the Pexels API
   * @param endpoint The API endpoint to call
   * @param params Query parameters to include in the request
   * @returns The API response
   */
  private async request<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
    if (!this.apiKey) {
      throw new Error('Pexels API key is required. Please set an API key before making requests.');
    }

    // Construct the query string
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value.toString());
    });

    // Determine the base URL based on the endpoint
    const isVideoEndpoint = endpoint.startsWith('/videos');
    const url = `${this.baseUrl}${isVideoEndpoint ? '/videos' : '/v1'}${endpoint}${
      queryParams.toString() ? '?' + queryParams.toString() : ''
    }`;

    const response = await fetch(url, {
      headers: {
        Authorization: this.apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Pexels API error: ${response.status} ${error}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Search for photos
   * @param query The search query
   * @param options Additional options for the search
   * @returns Search results
   */
  async searchPhotos(
    query: string,
    options: {
      orientation?: 'landscape' | 'portrait' | 'square';
      size?: 'large' | 'medium' | 'small';
      color?: string;
      locale?: string;
      page?: number;
      per_page?: number;
    } = {}
  ): Promise<PhotoSearchResponse> {
    return this.request<PhotoSearchResponse>('/search', {
      query,
      ...options,
    });
  }

  /**
   * Get curated photos
   * @param options Options for pagination
   * @returns Curated photos
   */
  async getCuratedPhotos(
    options: {
      page?: number;
      per_page?: number;
    } = {}
  ): Promise<PhotoSearchResponse> {
    return this.request<PhotoSearchResponse>('/curated', options);
  }

  /**
   * Get a specific photo by ID
   * @param id The photo ID
   * @returns The photo data
   */
  async getPhoto(id: number): Promise<Photo> {
    return this.request<Photo>(`/photos/${id}`);
  }

  /**
   * Search for videos
   * @param query The search query
   * @param options Additional options for the search
   * @returns Search results
   */
  async searchVideos(
    query: string,
    options: {
      orientation?: 'landscape' | 'portrait' | 'square';
      size?: 'large' | 'medium' | 'small';
      locale?: string;
      page?: number;
      per_page?: number;
    } = {}
  ): Promise<VideoSearchResponse> {
    return this.request<VideoSearchResponse>('/search', {
      query,
      ...options,
    });
  }

  /**
   * Get popular videos
   * @param options Options for filtering and pagination
   * @returns Popular videos
   */
  async getPopularVideos(
    options: {
      min_width?: number;
      min_height?: number;
      min_duration?: number;
      max_duration?: number;
      page?: number;
      per_page?: number;
    } = {}
  ): Promise<VideoSearchResponse> {
    return this.request<VideoSearchResponse>('/popular', options);
  }

  /**
   * Get a specific video by ID
   * @param id The video ID
   * @returns The video data
   */
  async getVideo(id: number): Promise<Video> {
    return this.request<Video>(`/videos/${id}`);
  }

  /**
   * Get featured collections
   * @param options Options for pagination
   * @returns Featured collections
   */
  async getFeaturedCollections(
    options: {
      page?: number;
      per_page?: number;
    } = {}
  ): Promise<CollectionsResponse> {
    return this.request<CollectionsResponse>('/collections/featured', options);
  }

  /**
   * Get my collections
   * @param options Options for pagination
   * @returns User's collections
   */
  async getMyCollections(
    options: {
      page?: number;
      per_page?: number;
    } = {}
  ): Promise<CollectionsResponse> {
    return this.request<CollectionsResponse>('/collections', options);
  }

  /**
   * Get media from a collection
   * @param id The collection ID
   * @param options Options for filtering and pagination
   * @returns Collection media
   */
  async getCollectionMedia(
    id: string,
    options: {
      type?: 'photos' | 'videos';
      sort?: 'asc' | 'desc';
      page?: number;
      per_page?: number;
    } = {}
  ): Promise<CollectionMedia> {
    return this.request<CollectionMedia>(`/collections/${id}`, options);
  }
}