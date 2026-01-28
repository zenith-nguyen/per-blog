import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import matter from 'gray-matter';
import { Calendar, Tag } from 'lucide-react';
import CommentSection from '@/components/CommentSection';

interface PostPageProps {
  params: {
    slug: string;
  };
}

function getPostBySlug(slug: string) {
  const contentDir = path.join(process.cwd(), 'src/content');
  const filePath = path.join(contentDir, `${slug}.mdx`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  
  return {
    frontmatter: data,
    content,
    slug,
  };
}

export async function generateStaticParams() {
  const contentDir = path.join(process.cwd(), 'src/content');
  
  if (!fs.existsSync(contentDir)) {
    return [];
  }
  
  const files = fs.readdirSync(contentDir);
  
  return files
    .filter(file => file.endsWith('.mdx') || file.endsWith('.md'))
    .map(file => ({
      slug: file.replace(/\.mdx?$/, ''),
    }));
}

export default function PostPage({ params }: PostPageProps) {
  const post = getPostBySlug(params.slug);
  
  if (!post) {
    notFound();
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Post Header */}
      <header className="mb-12 border-l-4 border-slate-900 pl-6">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          {post.frontmatter.title || post.slug}
        </h1>
        
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          {post.frontmatter.date && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <time className="font-mono">{post.frontmatter.date}</time>
            </div>
          )}
          
          {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <div className="flex gap-2">
                {post.frontmatter.tags.map((tag: string, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-700 font-mono text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>
      
      {/* Post Content */}
      <article className="prose prose-slate max-w-none
        prose-headings:font-bold prose-headings:text-slate-900
        prose-h1:text-3xl prose-h1:mb-4 prose-h1:border-b-2 prose-h1:border-slate-200 prose-h1:pb-2
        prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
        prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
        prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4
        prose-a:text-slate-900 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
        prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-slate-800 prose-code:before:content-[''] prose-code:after:content-['']
        prose-pre:bg-slate-900 prose-pre:text-slate-100
        prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
        prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
        prose-li:text-slate-700
        prose-blockquote:border-l-4 prose-blockquote:border-slate-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-600
        prose-strong:text-slate-900 prose-strong:font-bold
        prose-img:rounded-sm prose-img:border prose-img:border-slate-200
      ">
        <MDXRemote source={post.content} />
      </article>

      {/* Comment Section */}
      <CommentSection slug={params.slug} />
    </div>
  );
}
