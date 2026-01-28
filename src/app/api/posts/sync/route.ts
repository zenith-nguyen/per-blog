import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';

// Extract title from frontmatter
function extractTitle(content: string): string | null {
  const match = content.match(/title:\s*(.+)/);
  return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : null;
}

/**
 * @swagger
 * /api/posts/sync:
 *   post:
 *     tags:
 *       - Posts
 *     summary: Sync MDX posts to database
 *     description: Reads all MDX files from src/content directory and syncs them to MongoDB Post collection
 *     responses:
 *       200:
 *         description: Successfully synced posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 count:
 *                   type: number
 *                 synced:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal server error
 */
export async function POST() {
  try {
    // Connect to MongoDB first
    await dbConnect();
    
    // Directory where MDX files are stored
    const contentDir = path.join(process.cwd(), 'src/content');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
      return NextResponse.json({ 
        message: 'Content directory created. No posts to sync yet.',
        count: 0
      }, { status: 200 });
    }

    // Read directory contents
    let files: string[] = [];
    try {
      files = fs.readdirSync(contentDir);
    } catch (readError) {
      console.error('Error reading content directory:', readError);
      return NextResponse.json({ 
        error: 'Failed to read content directory',
        details: readError instanceof Error ? readError.message : 'Unknown error'
      }, { status: 500 });
    }

    const syncedPosts = [];
    const errors = [];

    for (const file of files) {
      if (file.endsWith('.mdx') || file.endsWith('.md')) {
        try {
          const filePath = path.join(contentDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          const slug = file.replace(/\.mdx?$/, '');
          const title = extractTitle(content) || slug;

          // Upsert post to MongoDB
          const post = await Post.findOneAndUpdate(
            { slug },
            { title },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
          
          syncedPosts.push({
            slug: post.slug,
            title: post.title,
            views: post.views,
            likes: post.likes
          });
        } catch (fileError) {
          console.error(`Error processing file ${file}:`, fileError);
          errors.push({
            file,
            error: fileError instanceof Error ? fileError.message : 'Unknown error'
          });
        }
      }
    }

    return NextResponse.json({ 
      success: true,
      message: `Successfully synced ${syncedPosts.length} posts`,
      count: syncedPosts.length,
      synced: syncedPosts,
      errors: errors.length > 0 ? errors : undefined
    }, { status: 200 });

  } catch (error) {
    console.error('Error syncing posts:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to sync posts from MDX files to database',
    endpoint: '/api/posts/sync',
    method: 'POST'
  }, { status: 200 });
}
