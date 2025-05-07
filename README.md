# Pexels MCP Server

[![smithery badge](https://smithery.ai/badge/@CaullenOmdahl/pexels-mcp-server)](https://smithery.ai/server/@CaullenOmdahl/pexels-mcp-server)

A Model Context Protocol (MCP) server that provides access to the Pexels API, allowing AI models to search for and retrieve photos, videos, and collections from Pexels.

## Features

- Search for photos and videos by query, orientation, size, and color
- Access curated and popular content from Pexels
- Browse Pexels collections
- Get detailed information about specific photos and videos
- Access content via tools or direct URI resources

## Requirements

- Node.js 18 or higher
- A Pexels API key (get one at [https://www.pexels.com/api/](https://www.pexels.com/api/))

## Local Development

1. Clone the repository
2. Install dependencies
   ```bash
   pnpm install
   ```
3. Build the project
   ```bash
   pnpm build
   ```
4. Run in development mode
   ```bash
   PEXELS_API_KEY=your_api_key pnpm dev
   ```

## Deploying to Smithery

This MCP server is ready to be deployed to Smithery. Follow these steps:

1. Add the server to Smithery or claim an existing server
2. Go to the Deployments tab (only visible to authenticated owners)
3. Deploy the server
4. When configuring the deployment, provide your Pexels API key in the configuration settings

## API Usage

The server provides the following tools:

### Photo Tools

- `searchPhotos`: Search for photos by query (use descriptive keywords for relevant results, e.g., 'Thai hotel reception', 'red sports car driving', not just 'hotel' or 'car'; combine with parameters like `orientation`, `size`, `color`, and `locale` for refined results), with optional filters for orientation, size, color, locale (e.g., 'en-US', 'es-ES'), page, and results per page. Returns metadata including photo IDs and URLs, plus current API rate limit status.
- `downloadPhoto`: Fetches a specific photo by its ID and desired size (optional, defaults to 'original'). Available sizes: 'original', 'large2x', 'large', 'medium', 'small', 'portrait', 'landscape', 'tiny'. Returns a direct download link for the requested image size, suggested filename (including size), and attribution information. The AI client should use its available local tools (like `curl` or PowerShell's `Invoke-WebRequest`) to download the photo using the provided link.
- `getCuratedPhotos`: Retrieve a curated set of photos from Pexels, optionally paginated.
- `getPhoto`: Retrieve detailed information about a specific photo by its ID.

### Video Tools

- `searchVideos`: Search for videos by query (use descriptive keywords for relevant results, e.g., 'drone footage beach sunset', 'time lapse city traffic', not just 'beach' or 'city'; combine with parameters like `orientation` and `size` for refined results), with optional filters for orientation, size, locale (e.g., 'en-US', 'es-ES'), page, and results per page. Returns metadata including video IDs and URLs, plus current API rate limit status.
- `getPopularVideos`: Retrieve a list of popular videos from Pexels, with optional filters for dimensions, duration, page, and results per page.
- `getVideo`: Retrieve detailed information about a specific video by its ID.
- `downloadVideo`: Fetches a specific video by its ID and preferred quality (hd/sd). Returns a direct download link, suggested filename, and attribution information. The AI client should use its available local tools (like `curl` or PowerShell's `Invoke-WebRequest`) to download the video using the provided link.

### Collection Tools

- `getFeaturedCollections`: Retrieve a list of featured collections from Pexels, optionally paginated.
- ~~`getMyCollections`~~: (Commented out in code) Requires OAuth 2.0 authentication, not supported by this server.
- `getCollectionMedia`: Retrieve media items (photos or videos) from a specific collection by collection ID, with optional filters for type, sort order, page, and results per page.

### Resources

The server provides the following URI-addressable resources:

- `pexels-photo://{id}`: Access a specific photo by ID
- `pexels-video://{id}`: Access a specific video by ID
- `pexels-collection://{id}`: Access a specific collection by ID

## Error Handling

The server attempts to provide informative error messages for common issues like invalid API keys, rate limits, or missing resources. Successful responses also include the current Pexels API rate limit status (remaining requests, reset time) in the output.

## Attribution Requirements

When using the Pexels API, you must follow their attribution requirements:

- Always show a prominent link to Pexels (e.g., "Photos provided by Pexels")
- Always credit photographers (e.g., "Photo by John Doe on Pexels")

## License

ISC