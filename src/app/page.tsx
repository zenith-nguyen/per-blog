import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { FileText, Github, Linkedin, Mail, Sparkles, Box } from 'lucide-react';

interface PostMetadata {
  slug: string;
  title: string;
  date: string;
  tags?: string[];
  excerpt?: string;
  type?: string;
}

function extractFrontmatter(content: string) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);
  
  if (!match) return null;
  
  const frontmatter: Record<string, string | string[]> = {};
  const lines = match[1].split('\n');
  
  lines.forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      let value: string | string[] = valueParts.join(':').trim();
      // Remove quotes
      value = value.replace(/^['"]|['"]$/g, '');
      // Handle arrays
      if (value.startsWith('[') && value.endsWith(']')) {
        const arrayValue = value.slice(1, -1).split(',').map(v => v.trim().replace(/^['"]|['"]$/g, ''));
        frontmatter[key.trim()] = arrayValue;
      } else {
        frontmatter[key.trim()] = value;
      }
    }
  });
  
  return frontmatter;
}

function getPosts(): PostMetadata[] {
  const contentDir = path.join(process.cwd(), 'src/content');
  
  if (!fs.existsSync(contentDir)) {
    return [];
  }
  
  const files = fs.readdirSync(contentDir);
  const posts: PostMetadata[] = [];
  
  files.forEach(file => {
    if (file.endsWith('.mdx') || file.endsWith('.md')) {
      const filePath = path.join(contentDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const frontmatter = extractFrontmatter(content);
      
      if (frontmatter) {
        posts.push({
          slug: file.replace(/\.mdx?$/, ''),
          title: (frontmatter.title as string) || file.replace(/\.mdx?$/, ''),
          date: (frontmatter.date as string) || 'No date',
          tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
          excerpt: (frontmatter.excerpt as string) || 'Read more...',
          type: (frontmatter.type as string) || 'post'
        });
      }
    }
  });
  
  // Sort by date descending
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export default function Home() {
  const posts = getPosts();
  const projects = posts.filter(p => p.type === 'project');
  const snippets = posts.filter(p => p.type === 'snippet');
  const regularPosts = posts.filter(p => p.type === 'post' || p.type === 'page');
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 text-center">
        <div className="mb-8">
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center border-4 border-white shadow-lg">
            <span className="text-4xl sm:text-5xl font-bold text-slate-700">HN</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Huy Nhat
          </h1>
          
          <p className="text-xl sm:text-2xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Building Digital Products & Systems
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 border-2 border-slate-200 hover:border-slate-900 transition-all duration-200 bg-white hover:bg-slate-50"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5 text-slate-700" />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 border-2 border-slate-200 hover:border-slate-900 transition-all duration-200 bg-white hover:bg-slate-50"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5 text-slate-700" />
            </a>
            <a 
              href="mailto:hi@huynhat.com"
              className="p-3 border-2 border-slate-200 hover:border-slate-900 transition-all duration-200 bg-white hover:bg-slate-50"
              aria-label="Email"
            >
              <Mail className="w-5 h-5 text-slate-700" />
            </a>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      {projects.length > 0 && (
        <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
            <Box className="w-8 h-8" />
            Projects
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((post) => (
              <Link 
                key={post.slug} 
                href={`/blog/${post.slug}`}
                className="group border-2 border-slate-200 bg-white hover:border-slate-900 hover:shadow-xl transition-all duration-300"
              >
                <article className="p-8">
                  <div className="mb-4">
                    <time className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                      {post.date}
                    </time>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-slate-700 transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, idx) => (
                        <span 
                          key={idx}
                          className="text-xs px-3 py-1 bg-slate-900 text-white font-mono uppercase tracking-wide"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Snippets/FAV Section */}
      {snippets.length > 0 && (
        <section id="fav" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
            <Sparkles className="w-8 h-8" />
            Favorites
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {snippets.map((post) => (
              <Link 
                key={post.slug} 
                href={`/blog/${post.slug}`}
                className="group border border-slate-200 bg-white hover:border-slate-900 transition-all duration-200 p-6"
              >
                <article>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-slate-700 transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                    {post.excerpt}
                  </p>
                  
                  <time className="text-xs font-mono text-slate-400">
                    {post.date}
                  </time>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Regular Posts */}
      {regularPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
            <FileText className="w-8 h-8" />
            Recent Posts
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post) => (
              <Link 
                key={post.slug} 
                href={`/blog/${post.slug}`}
                className="group border border-slate-200 bg-white hover:border-slate-900 transition-all duration-200"
              >
                <article className="p-6">
                  <div className="mb-3">
                    <time className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                      {post.date}
                    </time>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-slate-700 transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, idx) => (
                        <span 
                          key={idx}
                          className="text-xs px-2 py-1 bg-slate-100 text-slate-700 font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {posts.length === 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="border border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-600">No posts found. Start writing in <code className="bg-slate-100 px-2 py-1 rounded text-sm">src/content</code></p>
          </div>
        </section>
      )}
    </div>
  );
}
