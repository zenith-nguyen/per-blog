import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Personal Tech Blog API',
        version: '1.0.0',
        description: 'API documentation for the Personal Tech Blog - A hybrid MDX + MongoDB blog system with Navy Blueprint theme.',
      },
      servers: [
        {
          url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          description: 'Development server',
        },
      ],
      tags: [
        {
          name: 'Comments',
          description: 'Comment management endpoints',
        },
        {
          name: 'Posts',
          description: 'Post synchronization endpoints',
        },
      ],
    },
  });
  return spec;
};
