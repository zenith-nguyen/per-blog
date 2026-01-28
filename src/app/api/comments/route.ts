import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Comment from '@/models/Comment';

/**
 * @swagger
 * /api/comments:
 *   post:
 *     tags:
 *       - Comments
 *     summary: Create a new comment
 *     description: Submit a new comment for a blog post (requires approval)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slug
 *               - content
 *               - guest_name
 *             properties:
 *               slug:
 *                 type: string
 *                 description: Post slug
 *               content:
 *                 type: string
 *                 description: Comment content
 *               guest_name:
 *                 type: string
 *                 description: Commenter name
 *               guest_email:
 *                 type: string
 *                 description: Commenter email (optional)
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get approved comments
 *     description: Fetch all approved comments for a specific post
 *     parameters:
 *       - in: query
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Post slug
 *     responses:
 *       200:
 *         description: Successfully retrieved comments
 *       400:
 *         description: Slug is required
 *       500:
 *         description: Internal server error
 */
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { slug, content, guest_name, guest_email } = body;

    // Basic validation
    if (!slug || !content || !guest_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const comment = await Comment.create({
      post_slug: slug,
      content,
      guest_name,
      guest_email,
      is_approved: false // explicit default
    });

    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const comments = await Comment.find({ post_slug: slug, is_approved: true }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: comments }, { status: 200 });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
