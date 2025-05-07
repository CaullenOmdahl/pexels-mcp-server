# Pexels MCP Server

This project implements an MCP (Model Context Protocol) server for interacting with the [Pexels API](https://www.pexels.com/api/). It exposes tools and resources for searching and retrieving photos, videos, and collections from Pexels.

## Features

- Search and retrieve photos and videos
- Access curated and popular media
- Work with collections and collection media
- Resource URIs for direct access to photos, videos, and collections
- API key can be set via environment variable or at runtime

## Requirements

- Node.js 18+
- A valid [Pexels API key](https://www.pexels.com/api/new/)

## Setup

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Set your Pexels API key:**
   - Option 1: Set the `PEXELS_API_KEY` environment variable.
   - Option 2: Use the `setApiKey` tool at runtime.

## Usage

Start the MCP server:
```sh
node src/main.ts
```

### Tools

- `searchPhotos`: Search for photos by query, orientation, size, color, etc.
- `getCuratedPhotos`: Get curated photo collections.
- `getPhoto`: Retrieve a photo by ID.
- `searchVideos`: Search for videos by query, orientation, size, etc.
- `getPopularVideos`: Get popular videos.
- `getVideo`: Retrieve a video by ID.
- `getFeaturedCollections`: Get featured collections.
- `getMyCollections`: Get your collections (requires user authentication, not implemented).
- `getCollectionMedia`: Get media from a collection.
- `setApiKey`: Set the Pexels API key at runtime.

### Resources

- `pexels-photo://{id}`: Access a photo by ID.
- `pexels-video://{id}`: Access a video by ID.
- `pexels-collection://{id}`: Access a collection by ID.

## Notes

- Some endpoints (like `getMyCollections`) may require user authentication, which is not implemented in this server.
- All requests require a valid Pexels API key.
- Error messages are returned for invalid input or failed API requests.

## License

MIT