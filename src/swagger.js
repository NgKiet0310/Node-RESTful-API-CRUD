// src/swagger.js
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Product API",
      version: "1.0.0",
      description: "API for managing products and user authentication",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            username: { type: "string", example: "testuser" },
            password: { type: "string", example: "testpass" },
          },
          required: ["username", "password"],
        },
        LoginResponse: {
          type: "object",
          properties: {
            accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
            refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
          },
        },
        Product: {
          type: "object",
          properties: {
            _id: { type: "string", example: "60d5f4832f8fb814b56fa123" },
            name: { type: "string", example: "Laptop" },
            price: { type: "number", example: 1000 },
            description: { type: "string", example: "A high-end laptop" },
            category: { type: "string", example: "Electronics" },
            createdAt: { type: "string", format: "date-time", example: "2023-06-16T12:00:00Z" },
          },
          required: ["name", "price"],
        },
        ProductUpdate: {
          type: "object",
          properties: {
            name: { type: "string", example: "Updated Laptop" },
            price: { type: "number", example: 1200 },
            description: { type: "string", example: "Updated description" },
            category: { type: "string", example: "Electronics" },
          },
          required: ["name", "price"],
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "Something went wrong" },
          },
        },
      },
    },
    security: [], // Mặc định không áp dụng bảo mật toàn cục
  },
  apis: [], // Không quét file, dùng định nghĩa thủ công
};

const swaggerDefinition = {
  ...options.definition,
  paths: {
    "/api/auth/register": {
      post: {
        summary: "Register a new user",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/User" },
            },
          },
        },
        responses: {
          201: {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "User registered" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid input or username exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Login user and get tokens",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/User" },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginResponse" },
              },
            },
          },
          401: {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/auth/refresh": {
      post: {
        summary: "Refresh access token",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  refreshToken: { type: "string", example: "eyJhbGciOi..." },
                },
                required: ["refreshToken"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "New access token issued",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    accessToken: { type: "string", example: "eyJhbGciOi..." },
                  },
                },
              },
            },
          },
          401: {
            description: "Invalid refresh token",
            content: {
              "application/json": {
                schema: { $ref: "#components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/products": {
      post: {
        summary: "Create a new product",
        tags: ["Products"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#components/schemas/Product" },
            },
          },
        },
        responses: {
          201: {
            description: "Product created successfully",
            content: {
              "application/json": {
                schema: { $ref: "#components/schemas/Product" },
              },
            },
          },
          400: {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: { $ref: "#components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#components/schemas/Error" },
              },
            },
          },
        },
      },
      get: {
        summary: "Get all products",
        tags: ["Products"],
        responses: {
          200: {
            description: "List of products",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#components/schemas/Product" },
                },
              },
            },
          },
        },
      },
    },
    "/api/products/{id}": {
      get: {
        summary: "Get product by ID",
        tags: ["Products"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Product ID",
          },
        ],
        responses: {
          200: {
            description: "Product details",
            content: {
              "application/json": {
                schema: { $ref: "#components/schemas/Product" },
              },
            },
          },
          404: {
            description: "Product not found",
            content: {
              "application/json": {
                schema: { $ref: "#components/schemas/Error" },
              },
            },
          },
        },
      },
      put: {
        summary: "Update a product",
        tags: ["Products"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Product ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#components/schemas/ProductUpdate" },
            },
          },
        },
        responses: {
          200: {
            description: "Product updated successfully",
            content: {
              "application/json": {
                schema: { $ref: "#components/schemas/Product" },
              },
            },
          },
          400: {
            description: "Invalid input or product not found",
            content: {
              "application/json": {
                schema: { $ref: "#components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        summary: "Delete a product",
        tags: ["Products"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Product ID",
          },
        ],
        responses: {
          204: {
            description: "Product deleted successfully",
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#components/schemas/Error" },
              },
            },
          },
          403: {
            description: "Forbidden (admin role required)",
            content: {
              "application/json": {
                schema: { $ref: "#components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Product not found",
            content: {
              "application/json": {
                schema: { $ref: "#components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/products/stats": {
      get: {
        summary: "Get product statistics by category",
        tags: ["Products"],
        responses: {
          200: {
            description: "Product statistics",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      _id: { type: "string", example: "Electronics" },
                      count: { type: "number", example: 10 },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/products/filter": {
      get: {
        summary: "Filter products by price range",
        tags: ["Products"],
        parameters: [
          {
            name: "minPrice",
            in: "query",
            schema: { type: "number" },
            description: "Minimum price",
          },
          {
            name: "maxPrice",
            in: "query",
            schema: { type: "number" },
            description: "Maximum price",
          },
        ],
        responses: {
          200: {
            description: "Filtered products",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    count: { type: "number", example: 5 },
                    products: {
                      type: "array",
                      items: { $ref: "#components/schemas/Product" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/products/import": {
      get: {
        summary: "Import products from external API",
        tags: ["Products"],
        responses: {
          200: {
            description: "Imported products",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#components/schemas/Product" },
                },
              },
            },
          },
        },
      },
    },
    "/api/products/search": {
      get: {
        summary: "Search products by name",
        tags: ["Products"],
        parameters: [
          {
            name: "name",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Product name to search",
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
            description: "Page number",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
            description: "Items per page",
          },
        ],
        responses: {
          200: {
            description: "Search results",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    products: {
                      type: "array",
                      items: { $ref: "#components/schemas/Product" },
                    },
                    total: { type: "number", example: 20 },
                    page: { type: "number", example: 1 },
                    limit: { type: "number", example: 10 },
                  },
                },
              },
            },
          },
          400: {
            description: "Name query required",
            content: {
              "application/json": {
                schema: { $ref: "#components/schemas/Error" },
              },
            },
          },
        },
      },
    },
  },
};

const specs = swaggerJSDoc({ ...options, definition: swaggerDefinition });
export default (app) => {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(specs));
};