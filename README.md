# Pexels MCP Server

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

- `searchPhotos`: Search for photos by query, with optional filters for orientation, size, color, page, and results per page.
- `getCuratedPhotos`: Retrieve a curated set of photos from Pexels, optionally paginated.
- `getPhoto`: Retrieve detailed information about a specific photo by its ID.

### Video Tools

- `searchVideos`: Search for videos by query, with optional filters for orientation, size, page, and results per page.
- `getPopularVideos`: Retrieve a list of popular videos from Pexels, with optional filters for dimensions, duration, page, and results per page.
- `getVideo`: Retrieve detailed information about a specific video by its ID.

### Collection Tools

- `getFeaturedCollections`: Retrieve a list of featured collections from Pexels, optionally paginated.
- `getMyCollections`: Retrieve collections associated with the authenticated user, optionally paginated.
- `getCollectionMedia`: Retrieve media items (photos or videos) from a specific collection by collection ID, with optional filters for type, sort order, page, and results per page.

### Resources

The server provides the following URI-addressable resources:

- `pexels-photo://{id}`: Access a specific photo by ID
- `pexels-video://{id}`: Access a specific video by ID
- `pexels-collection://{id}`: Access a specific collection by ID

## Attribution Requirements

When using the Pexels API, you must follow their attribution requirements:

- Always show a prominent link to Pexels (e.g., "Photos provided by Pexels")
- Always credit photographers (e.g., "Photo by John Doe on Pexels")

## License

ISC