import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { PexelsService } from "./services/pexels-service.js";
import fs from "fs/promises";
import path from "path";
import fetch from "node-fetch";

// Create an MCP server
const server = new McpServer({
  name: "PexelsMCP",
  version: "1.0.0",
});

// Initialize Pexels service - API key should be provided via environment variable PEXELS_API_KEY
const pexelsService = new PexelsService();

// --- Photo API Tools ---

// Tool for searching photos
server.tool(
  "searchPhotos",
  {
    query: z.string().describe("The search query (e.g., 'nature', 'people', 'city')"),
    orientation: z.enum(["landscape", "portrait", "square"]).optional().describe("Desired photo orientation"),
    size: z.enum(["large", "medium", "small"]).optional().describe("Minimum photo size"),
    color: z.string().optional().describe("Desired photo color (e.g., 'red', 'blue', '#ff0000')"),
    page: z.number().positive().optional().describe("Page number"),
    perPage: z.number().min(1).max(80).optional().describe("Results per page (max 80)"),
    download: z.boolean().optional().describe("If true, download the top image and return as a file with attribution")
  },
  async ({ query, orientation, size, color, page, perPage, download }) => {
    // Note: The 'download' parameter is kept in the schema for potential future use
    // but the download logic is now handled by the dedicated 'downloadPhoto' tool.
    try {
      const results = await pexelsService.searchPhotos(query, {
        orientation,
        size,
        color,
        page,
        per_page: perPage
      });

      return {
        content: [
          {
            type: "text",
            text: `Found ${results.total_results} photos matching "${query}"`
          },
          {
            type: "text", // Return JSON as stringified text
            text: JSON.stringify(results, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error searching photos: ${(error as Error).message}`
          }
        ]
      };
    }
  }
);

// Tool for downloading a photo by ID
server.tool(
  "downloadPhoto",
  {
    id: z.number().positive().describe("The ID of the photo to download"),
    // Removed directory parameter as saving happens on the AI side
  },
  async ({ id }, _extra) => {
    try {
      const photo = await pexelsService.getPhoto(id);
      if (!photo) {
        return {
          content: [
            { type: "text", text: `Photo with ID ${id} not found.` }
          ]
        };
      }
      const imageUrl = photo.src.original; // Using original size for download
      const ext = path.extname(new URL(imageUrl).pathname) || ".jpg";
      const fileName = `pexels_${photo.id}${ext}`;

      // Download image data
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }
      const buffer = await response.buffer();
      const base64Data = buffer.toString('base64');

      // Determine mime type (basic guess based on extension)
      let mimeType = 'image/jpeg';
      if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.gif') mimeType = 'image/gif';
      // Add more types if needed

      return {
        content: [
          {
            type: "image", // Return as image type with base64 data
            mimeType: mimeType,
            data: base64Data,
            // Add filename and attribution to metadata if needed, or as separate text
          },
          {
            type: "text",
            text: `Filename: ${fileName}\nAttribution: Photo by ${photo.photographer} (${photo.photographer_url}) on Pexels. License: https://www.pexels.com/license/`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error preparing photo data: ${(error as Error).message}`
          }
        ]
      };
    }
  }
);
// Removed duplicated code section

// Tool for downloading a video by ID
server.tool(
  "downloadVideo",
  {
    id: z.number().positive().describe("The ID of the video to download"),
    quality: z.enum(["hd", "sd"]).optional().default("hd").describe("Preferred video quality (hd or sd)")
  },
  async ({ id, quality }, _extra) => {
    try {
      const video = await pexelsService.getVideo(id);
      if (!video) {
        return {
          content: [
            { type: "text", text: `Video with ID ${id} not found.` }
          ]
        };
      }

      // Find the video file URL for the desired quality
      const videoFile = video.video_files.find(vf => vf.quality === quality) || video.video_files[0]; // Fallback to first available
      if (!videoFile) {
        return {
          content: [
            { type: "text", text: `No video file found for ID ${id}.` }
          ]
        };
      }

      const videoUrl = videoFile.link;
      const ext = path.extname(new URL(videoUrl).pathname) || ".mp4"; // Guess extension
      const fileName = `pexels_video_${video.id}_${videoFile.quality}${ext}`;

      // Return the direct download link instead of fetching data
      return {
        content: [
          {
            type: "text",
            text: `Download Link (${videoFile.quality}): ${videoUrl}`
          },
          {
            type: "text",
            text: `Suggested Filename: ${fileName}\nAttribution: Video by ${video.user.name} (${video.user.url}) on Pexels. License: https://www.pexels.com/license/\n\nRecommendation: Use an available local tool (like curl or PowerShell's Invoke-WebRequest) to download the video using the link provided.`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error preparing video data: ${(error as Error).message}`
          }
        ]
      };
    }
  }
);

// Tool for getting curated photos
server.tool(
  "getCuratedPhotos",
  {
    page: z.number().positive().optional().describe("Page number"),
    perPage: z.number().min(1).max(80).optional().describe("Results per page (max 80)")
  },
  async ({ page, perPage }: { page?: number, perPage?: number }) => { // Added explicit types
    try {
      const results = await pexelsService.getCuratedPhotos({
        page,
        per_page: perPage
      });
      
      return {
        content: [
          { 
            type: "text", 
            text: `Retrieved ${results.photos.length} curated photos`
          },
          {
            type: "text",
            text: JSON.stringify(results, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text", 
            text: `Error getting curated photos: ${(error as Error).message}`
          }
        ]
      };
    }
  }
);

// Tool for getting a specific photo by ID
server.tool(
  "getPhoto", 
  { 
    id: z.number().positive().describe("The ID of the photo to retrieve")
  }, 
  async ({ id }) => {
    try {
      const photo = await pexelsService.getPhoto(id);
      
      return {
        content: [
          { 
            type: "text", 
            text: `Retrieved photo: ${photo.alt || photo.url}`
          },
          {
            type: "text",
            text: JSON.stringify(photo, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          { 
            type: "text", 
            text: `Error getting photo: ${(error as Error).message}`
          }
        ]
      };
    }
  }
);

// --- Video API Tools ---

// Tool for searching videos
server.tool(
  "searchVideos", 
  { 
    query: z.string().describe("The search query (e.g., 'nature', 'people', 'city')"),
    orientation: z.enum(["landscape", "portrait", "square"]).optional().describe("Desired video orientation"),
    size: z.enum(["large", "medium", "small"]).optional().describe("Minimum video size"),
    page: z.number().positive().optional().describe("Page number"),
    perPage: z.number().min(1).max(80).optional().describe("Results per page (max 80)") 
  }, 
  async ({ query, orientation, size, page, perPage }) => {
    try {
      const results = await pexelsService.searchVideos(query, {
        orientation,
        size,
        page,
        per_page: perPage
      });
      
      return {
        content: [
          { 
            type: "text", 
            text: `Found ${results.total_results} videos matching "${query}"`
          },
          {
            type: "text",
            text: JSON.stringify(results, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          { 
            type: "text", 
            text: `Error searching videos: ${(error as Error).message}`
          }
        ]
      };
    }
  }
);

// Tool for getting popular videos
server.tool(
  "getPopularVideos", 
  { 
    minWidth: z.number().optional().describe("Minimum video width in pixels"),
    minHeight: z.number().optional().describe("Minimum video height in pixels"),
    minDuration: z.number().optional().describe("Minimum video duration in seconds"),
    maxDuration: z.number().optional().describe("Maximum video duration in seconds"),
    page: z.number().positive().optional().describe("Page number"),
    perPage: z.number().min(1).max(80).optional().describe("Results per page (max 80)") 
  }, 
  async ({ minWidth, minHeight, minDuration, maxDuration, page, perPage }) => {
    try {
      const results = await pexelsService.getPopularVideos({
        min_width: minWidth,
        min_height: minHeight,
        min_duration: minDuration,
        max_duration: maxDuration,
        page,
        per_page: perPage
      });
      
      return {
        content: [
          { 
            type: "text", 
            text: `Retrieved ${results.videos.length} popular videos`
          },
          {
            type: "text",
            text: JSON.stringify(results, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          { 
            type: "text", 
            text: `Error getting popular videos: ${(error as Error).message}`
          }
        ]
      };
    }
  }
);

// Tool for getting a specific video by ID
server.tool(
  "getVideo", 
  { 
    id: z.number().positive().describe("The ID of the video to retrieve")
  }, 
  async ({ id }) => {
    try {
      const video = await pexelsService.getVideo(id);
      
      return {
        content: [
          { 
            type: "text", 
            text: `Retrieved video with ID: ${id}`
          },
          {
            type: "text",
            text: JSON.stringify(video, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          { 
            type: "text", 
            text: `Error getting video: ${(error as Error).message}`
          }
        ]
      };
    }
  }
);

// --- Collections API Tools ---

// Tool for getting featured collections
server.tool(
  "getFeaturedCollections", 
  { 
    page: z.number().positive().optional().describe("Page number"),
    perPage: z.number().min(1).max(80).optional().describe("Results per page (max 80)") 
  }, 
  async ({ page, perPage }) => {
    try {
      const collections = await pexelsService.getFeaturedCollections({
        page,
        per_page: perPage
      });
      
      return {
        content: [
          { 
            type: "text", 
            text: `Retrieved ${collections.collections.length} featured collections`
          },
          {
            type: "text",
            text: JSON.stringify(collections, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          { 
            type: "text", 
            text: `Error getting featured collections: ${(error as Error).message}`
          }
        ]
      };
    }
  }
);

/*
// NOTE: Accessing user-specific collections ('My Collections') typically requires
// OAuth 2.0 authentication with Pexels, which is not implemented here.
// This tool will likely only work if Pexels allows API key access to this endpoint,
// or it might return an error or empty results without proper user authentication.
// Tool for getting user's collections - Commented out due to auth requirements.
server.tool(
  "getMyCollections",
  {
    page: z.number().positive().optional().describe("Page number"),
    perPage: z.number().min(1).max(80).optional().describe("Results per page (max 80)")
  },
  async ({ page, perPage }) => {
    try {
      const collections = await pexelsService.getMyCollections({
        page,
        per_page: perPage
      });

      return {
        content: [
          {
            type: "text",
            text: `Retrieved ${collections.collections.length} of your collections`
          },
          {
            type: "text",
            text: JSON.stringify(collections, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting your collections: ${(error as Error).message}`
          }
        ]
      };
    }
  }
);
*/

// Tool for getting media from a collection
server.tool(
  "getCollectionMedia", 
  { 
    id: z.string().describe("The ID of the collection"),
    type: z.enum(["photos", "videos"]).optional().describe("Filter by media type"),
    sort: z.enum(["asc", "desc"]).optional().describe("Sort order"),
    page: z.number().positive().optional().describe("Page number"),
    perPage: z.number().min(1).max(80).optional().describe("Results per page (max 80)") 
  }, 
  async ({ id, type, sort, page, perPage }) => {
    try {
      const media = await pexelsService.getCollectionMedia(id, {
        type,
        sort,
        page,
        per_page: perPage
      });
      
      return {
        content: [
          { 
            type: "text", 
            text: `Retrieved ${media.media.length} media items from collection ${id}`
          },
          {
            type: "text",
            text: JSON.stringify(media, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          { 
            type: "text", 
            text: `Error getting collection media: ${(error as Error).message}`
          }
        ]
      };
    }
  }
);

// --- Photo Resources ---

// Resource for accessing photos by ID
server.resource(
  "photo",
  new ResourceTemplate("pexels-photo://{id}", { list: undefined }),
  async (uri, { id }) => {
    try {
      const photoId = parseInt((id ?? "").toString(), 10);
      if (isNaN(photoId)) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Invalid photo ID: ${id ?? ""}`,
            },
          ],
        };
      }

      const photo = await pexelsService.getPhoto(photoId);
      
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(photo, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        contents: [
          {
            uri: uri.href,
            text: `Error retrieving photo with ID ${id}: ${(error as Error).message}`,
          },
        ],
      };
    }
  }
);

// --- Video Resources ---

// Resource for accessing videos by ID
server.resource(
  "video",
  new ResourceTemplate("pexels-video://{id}", { list: undefined }),
  async (uri, { id }) => {
    try {
      const videoId = parseInt((id ?? "").toString(), 10);
      if (isNaN(videoId)) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Invalid video ID: ${id ?? ""}`,
            },
          ],
        };
      }

      const video = await pexelsService.getVideo(videoId);
      
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(video, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        contents: [
          {
            uri: uri.href,
            text: `Error retrieving video with ID ${id}: ${(error as Error).message}`,
          },
        ],
      };
    }
  }
);

// --- Collection Resources ---

// Resource for accessing collections by ID
server.resource(
  "collection",
  new ResourceTemplate("pexels-collection://{id}", { list: undefined }),
  async (uri, { id }) => {
    try {
      const media = await pexelsService.getCollectionMedia((id ?? "").toString());
      
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(media, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        contents: [
          {
            uri: uri.href,
            text: `Error retrieving collection with ID ${id}: ${(error as Error).message}`,
          },
        ],
      };
    }
  }
);

// Tool to set API key for clients that need to provide their own key
server.tool(
  "setApiKey", 
  { 
    apiKey: z.string().describe("Your Pexels API key")
  }, 
  async ({ apiKey }) => {
    try {
      pexelsService.setApiKey(apiKey);
      
      return {
        content: [
          { 
            type: "text", 
            text: "API key set successfully"
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          { 
            type: "text", 
            text: `Error setting API key: ${(error as Error).message}`
          }
        ]
      };
    }
  }
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);