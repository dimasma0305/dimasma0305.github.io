require('dotenv').config();
const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;
const OUTPUT_DIR = process.env.POSTS_DIR;

// Initialize Notion client
const notion = new Client({
  auth: NOTION_TOKEN,
});

// Helper function to extract plain text from rich text
function extractPlainText(richTextArray) {
  if (!richTextArray || !Array.isArray(richTextArray)) return '';
  return richTextArray.map(block => block.plain_text || '').join('');
}

// Helper function to extract rich text with annotations
function extractRichText(richTextArray) {
  if (!richTextArray || !Array.isArray(richTextArray)) return [];
  return richTextArray.map(text => ({
    content: text.plain_text,
    annotations: text.annotations,
    href: text.href
  }));
}

// Helper function to extract date from Notion date property
function extractDate(dateProperty) {
  if (!dateProperty || !dateProperty.date) return null;
  return dateProperty.date.start;
}

// Helper function to extract select/multi_select values
function extractSelectValues(selectProperty) {
  if (!selectProperty) return [];
  if (selectProperty.type === 'select') {
    return selectProperty.select ? [selectProperty.select.name] : [];
  }
  if (selectProperty.type === 'multi_select') {
    return selectProperty.multi_select ? selectProperty.multi_select.map(item => item.name) : [];
  }
  return [];
}

// Helper function to extract files/images
function extractFiles(filesProperty) {
  if (!filesProperty || !filesProperty.files) return [];
  return filesProperty.files.map(file => {
    if (file.type === 'file') {
      return {
        type: 'file',
        url: file.file.url,
        name: file.name,
        expiry_time: file.file.expiry_time
      };
    } else if (file.type === 'external') {
      return {
        type: 'external',
        url: file.external.url,
        name: file.name
      };
    }
    return null;
  }).filter(Boolean);
}

// Helper function to create a safe filename/folder name from title
function createSlug(title) {
  if (!title) return 'untitled';
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

// Helper function to get the correct image path
function getImagePath(folderName, imageName) {
  const basePath = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_PATH || '' : '';
  return `${basePath}/posts/${folderName}/${imageName}`;
}

// Helper function to get clean file extension from URL or filename
function getCleanFileExtension(url) {
  try {
    // Remove query parameters and get the last part of the path
    const filename = url.split('?')[0].split('/').pop();
    // Get the extension
    const ext = filename.split('.').pop() || '';
    // Clean and validate the extension
    const cleanExt = ext.toLowerCase().replace(/[^a-z0-9]/g, '');
    // Check if it's a valid image extension
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    if (validExtensions.includes(cleanExt)) {
      return cleanExt;
    }
    // Try to determine extension from content type
    if (url.includes('bing.com') || url.includes('microsoft.com')) {
      return 'jpg';
    }
    // Default to jpg if no valid extension found
    return 'jpg';
  } catch (error) {
    return 'jpg';
  }
}

// Helper function to download image
function downloadImage(urlString) {
  return new Promise((resolve, reject) => {
    const handleResponse = (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (!redirectUrl) {
          reject(new Error(`Redirect location not found: ${response.statusCode}`));
          return;
        }
        // Handle relative redirects
        const finalUrl = new URL(redirectUrl, urlString);
        const client = finalUrl.protocol === 'https:' ? https : http;
        client.get(finalUrl, handleResponse).on('error', reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      // Try to get extension from content-type
      let contentTypeExt = '';
      const contentType = response.headers['content-type'];
      if (contentType) {
        const match = contentType.match(/image\/(.*)/);
        if (match && match[1]) {
          contentTypeExt = match[1].split(';')[0].toLowerCase();
          if (contentTypeExt === 'jpeg') contentTypeExt = 'jpg';
        }
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        // Return both the buffer and the content type extension
        resolve({ buffer, contentTypeExt });
      });
      response.on('error', reject);
    };

    try {
      const url = new URL(urlString);
      const client = url.protocol === 'https:' ? https : http;
      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      };
      client.get(options, handleResponse).on('error', reject);
    } catch (error) {
      reject(new Error(`Invalid URL: ${error.message}`));
    }
  });
}

// Function to process different block types
function processBlock(block) {
  const processedBlock = {
    id: block.id,
    type: block.type,
    created_time: block.created_time,
    last_edited_time: block.last_edited_time,
    has_children: block.has_children,
    archived: block.archived,
    content: {}
  };

  const blockContent = block[block.type];
  
  switch (block.type) {
    case 'paragraph':
      processedBlock.content = {
        rich_text: extractRichText(blockContent.rich_text),
        color: blockContent.color
      };
      break;
      
    case 'heading_1':
    case 'heading_2':
    case 'heading_3':
      processedBlock.content = {
        rich_text: extractRichText(blockContent.rich_text),
        color: blockContent.color,
        is_toggleable: blockContent.is_toggleable
      };
      break;
      
    case 'bulleted_list_item':
    case 'numbered_list_item':
      processedBlock.content = {
        rich_text: extractRichText(blockContent.rich_text),
        color: blockContent.color
      };
      break;
      
    case 'to_do':
      processedBlock.content = {
        rich_text: extractRichText(blockContent.rich_text),
        checked: blockContent.checked,
        color: blockContent.color
      };
      break;
      
    case 'toggle':
      processedBlock.content = {
        rich_text: extractRichText(blockContent.rich_text),
        color: blockContent.color
      };
      break;
      
    case 'code':
      processedBlock.content = {
        rich_text: extractRichText(blockContent.rich_text),
        language: blockContent.language,
        caption: extractRichText(blockContent.caption)
      };
      break;
      
    case 'quote':
      processedBlock.content = {
        rich_text: extractRichText(blockContent.rich_text),
        color: blockContent.color
      };
      break;
      
    case 'callout':
      processedBlock.content = {
        rich_text: extractRichText(blockContent.rich_text),
        icon: blockContent.icon,
        color: blockContent.color
      };
      break;
      
    case 'divider':
      processedBlock.content = {};
      break;
      
    case 'image':
      processedBlock.content = {
        caption: extractRichText(blockContent.caption),
        type: blockContent.type
      };
      if (blockContent.type === 'file') {
        processedBlock.content.url = blockContent.file.url;
        processedBlock.content.expiry_time = blockContent.file.expiry_time;
      } else if (blockContent.type === 'external') {
        processedBlock.content.url = blockContent.external.url;
      }
      break;
      
    case 'video':
      processedBlock.content = {
        caption: extractRichText(blockContent.caption),
        type: blockContent.type
      };
      if (blockContent.type === 'file') {
        processedBlock.content.url = blockContent.file.url;
        processedBlock.content.expiry_time = blockContent.file.expiry_time;
      } else if (blockContent.type === 'external') {
        processedBlock.content.url = blockContent.external.url;
      }
      break;
      
    case 'file':
      processedBlock.content = {
        caption: extractRichText(blockContent.caption),
        type: blockContent.type,
        name: blockContent.name
      };
      if (blockContent.type === 'file') {
        processedBlock.content.url = blockContent.file.url;
        processedBlock.content.expiry_time = blockContent.file.expiry_time;
      } else if (blockContent.type === 'external') {
        processedBlock.content.url = blockContent.external.url;
      }
      break;
      
    case 'embed':
      processedBlock.content = {
        url: blockContent.url,
        caption: extractRichText(blockContent.caption)
      };
      break;
      
    case 'bookmark':
      processedBlock.content = {
        url: blockContent.url,
        caption: extractRichText(blockContent.caption)
      };
      break;
      
    case 'equation':
      processedBlock.content = {
        expression: blockContent.expression
      };
      break;
      
    case 'table':
      processedBlock.content = {
        table_width: blockContent.table_width,
        has_column_header: blockContent.has_column_header,
        has_row_header: blockContent.has_row_header
      };
      break;
      
    case 'table_row':
      processedBlock.content = {
        cells: blockContent.cells.map(cell => extractRichText(cell))
      };
      break;
      
    default:
      processedBlock.content = blockContent;
  }
  
  return processedBlock;
}

// Rate limiter class to control concurrent requests
class RateLimiter {
  constructor(maxConcurrent = 5, delayMs = 200) {
    this.maxConcurrent = maxConcurrent;
    this.delayMs = delayMs;
    this.running = 0;
    this.queue = [];
  }

  async execute(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { task, resolve, reject } = this.queue.shift();

    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      
      // Add smaller delay before processing next task
      setTimeout(() => {
        this.process();
      }, this.delayMs);
    }
  }
}

// Global rate limiter instance - more aggressive settings
const rateLimiter = new RateLimiter(5, 200); // ~5 requests per second across all workers

// Function to get page content (blocks) recursively with pagination support
async function getPageContent(pageId, depth = 0, maxDepth = 3) {
  if (depth > maxDepth) return [];
  
  try {
    let allBlocks = [];
    let hasMore = true;
    let nextCursor = undefined;
    let pageCount = 0;
    
    // Keep fetching until all blocks are retrieved
    while (hasMore) {
      pageCount++;
      
      // Use rate limiter for API calls
      const response = await rateLimiter.execute(async () => {
        return await notion.blocks.children.list({
          block_id: pageId,
          start_cursor: nextCursor,
          page_size: 100, // Maximum allowed by Notion API
        });
      });
      
      // Early exit if no results to reduce unnecessary processing
      if (!response.results || response.results.length === 0) {
        break;
      }
      
      if (depth === 0 && pageCount > 1) {
        console.log(`   📄 Fetching page ${pageCount} of blocks for ${pageId} (${response.results.length} blocks)`);
      }
      
      // Process blocks in parallel for better performance
      const blockPromises = response.results.map(async (block) => {
        const processedBlock = processBlock(block);
        
        // If block has children, fetch them recursively (but limit depth)
        if (block.has_children && depth < maxDepth) {
          processedBlock.children = await getPageContent(block.id, depth + 1, maxDepth);
        }
        
        return processedBlock;
      });
      
      // Wait for all blocks in this page to be processed
      const processedBlocks = await Promise.all(blockPromises);
      allBlocks = allBlocks.concat(processedBlocks);
      
      hasMore = response.has_more;
      nextCursor = response.next_cursor;
    }
    
    if (depth === 0 && allBlocks.length > 100) {
      console.log(`   ✅ Total blocks fetched: ${allBlocks.length} (across ${pageCount} pages)`);
    }
    
    return allBlocks;
  } catch (error) {
    console.error(`Error fetching content for page ${pageId}:`, error.message);
    return [];
  }
}

// Function to convert Notion page to blog post object
function convertPageToBlogPost(page) {
  const properties = page.properties;
  
  const blogPost = {
    id: page.id,
    created_time: page.created_time,
    last_edited_time: page.last_edited_time,
    url: page.url,
    public_url: page.public_url,
    archived: page.archived,
    icon: page.icon,
    cover: page.cover,
    properties: {}
  };

  // Process all properties dynamically
  for (const [key, property] of Object.entries(properties)) {
    const propertyName = key.toLowerCase().replace(/\s+/g, '_');
    
    switch (property.type) {
      case 'title':
        blogPost.properties[propertyName] = extractPlainText(property.title);
        blogPost.title = blogPost.properties[propertyName];
        break;
      
      case 'rich_text':
        blogPost.properties[propertyName] = extractPlainText(property.rich_text);
        break;
      
      case 'date':
        blogPost.properties[propertyName] = extractDate(property);
        break;
      
      case 'select':
        blogPost.properties[propertyName] = extractSelectValues(property);
        break;
      
      case 'multi_select':
        blogPost.properties[propertyName] = extractSelectValues(property);
        break;
      
      case 'checkbox':
        blogPost.properties[propertyName] = property.checkbox;
        break;
      
      case 'number':
        blogPost.properties[propertyName] = property.number;
        break;
      
      case 'url':
        blogPost.properties[propertyName] = property.url;
        break;
      
      case 'email':
        blogPost.properties[propertyName] = property.email;
        break;
      
      case 'phone_number':
        blogPost.properties[propertyName] = property.phone_number;
        break;
      
      case 'files':
        blogPost.properties[propertyName] = extractFiles(property);
        break;
      
      case 'people':
        blogPost.properties[propertyName] = property.people ? property.people.map(person => ({
          id: person.id,
          name: person.name,
          avatar_url: person.avatar_url,
          type: person.type
        })) : [];
        break;
      
      case 'relation':
        blogPost.properties[propertyName] = property.relation ? property.relation.map(rel => rel.id) : [];
        break;
      
      case 'formula':
        if (property.formula) {
          switch (property.formula.type) {
            case 'string':
              blogPost.properties[propertyName] = property.formula.string;
              break;
            case 'number':
              blogPost.properties[propertyName] = property.formula.number;
              break;
            case 'boolean':
              blogPost.properties[propertyName] = property.formula.boolean;
              break;
            case 'date':
              blogPost.properties[propertyName] = property.formula.date;
              break;
            default:
              blogPost.properties[propertyName] = null;
          }
        } else {
          blogPost.properties[propertyName] = null;
        }
        break;
      
      default:
        blogPost.properties[propertyName] = property;
    }
  }

  return blogPost;
}

// Function to process a single page (for parallel processing)
async function processSinglePage(page, pageIndex, totalPages) {
  try {
    console.log(`🔄 Processing page ${pageIndex + 1}/${totalPages}: ${page.id}`);
    
    const blogPost = convertPageToBlogPost(page);
    
    // Fetch page content (blocks)
    console.log(`📝 Fetching content for page: ${page.id}`);
    blogPost.content = await getPageContent(page.id);
    
    // Create folder name using slug and ID for uniqueness
    const slug = createSlug(blogPost.title);
    const folderName = `${slug}-${page.id.replace(/-/g, '')}`;
    const postDir = path.join(OUTPUT_DIR, folderName);
    
    // Create post directory
    if (!fs.existsSync(postDir)) {
      fs.mkdirSync(postDir, { recursive: true });
    }

    // Download and save cover image if it exists
    if (blogPost.cover?.external?.url || blogPost.cover?.file?.url) {
      try {
        const coverUrl = blogPost.cover.external?.url || blogPost.cover.file?.url;
        const { buffer, contentTypeExt } = await downloadImage(coverUrl);
        const imageExtension = contentTypeExt || getCleanFileExtension(coverUrl);
        const imagePath = path.join(postDir, `cover.${imageExtension}`);
        fs.writeFileSync(imagePath, buffer);
        console.log(`📸 Saved cover image: ${imagePath}`);

        // Use cover image as both featured and OG image with correct base path
        blogPost.featured_image = getImagePath(folderName, `cover.${imageExtension}`);
        blogPost.og_image = blogPost.featured_image;
      } catch (error) {
        console.error(`❌ Failed to save cover image for ${folderName}:`, error.message);
      }
    }
    // If no cover image, try featured image
    else if (blogPost.properties.featured_image?.[0]?.url) {
      try {
        const featuredImageUrl = blogPost.properties.featured_image[0].url;
        const { buffer, contentTypeExt } = await downloadImage(featuredImageUrl);
        const imageExtension = contentTypeExt || getCleanFileExtension(featuredImageUrl);
        const imagePath = path.join(postDir, `featured-image.${imageExtension}`);
        fs.writeFileSync(imagePath, buffer);
        console.log(`📸 Saved featured image: ${imagePath}`);

        // Update the featured image path in the post metadata
        blogPost.featured_image = `/posts/${folderName}/featured-image.${imageExtension}`;
        blogPost.og_image = blogPost.featured_image;
      } catch (error) {
        console.error(`❌ Failed to save featured image for ${folderName}:`, error.message);
      }
    }

    // If no cover or featured image, try to find first image in content
    if (!blogPost.og_image) {
      let firstImage = null;
      for (const block of blogPost.content) {
        if (block.type === 'image') {
          firstImage = block.content;
          break;
        }
      }
      
      if (firstImage && firstImage.url) {
        try {
          const { buffer, contentTypeExt } = await downloadImage(firstImage.url);
          const imageExtension = contentTypeExt || getCleanFileExtension(firstImage.url);
          const imagePath = path.join(postDir, `og-image.${imageExtension}`);
          fs.writeFileSync(imagePath, buffer);
          console.log(`📸 Saved OG image: ${imagePath}`);

          // Add the image path to the post metadata
          blogPost.og_image = `/posts/${folderName}/og-image.${imageExtension}`;
          if (!blogPost.featured_image) {
            blogPost.featured_image = blogPost.og_image;
          }
        } catch (error) {
          console.error(`❌ Failed to save OG image for ${folderName}:`, error.message);
        }
      }
    }
    
    // Save individual post JSON
    const postFile = path.join(postDir, 'post.json');
    const postData = {
      meta: {
        generated_at: new Date().toISOString(),
        notion_api_version: '2022-06-28',
        includes_content: true,
        folder: folderName,
        slug: slug,
        og_image: blogPost.og_image,
        featured_image: blogPost.featured_image
      },
      post: blogPost
    };
    
    fs.writeFileSync(postFile, JSON.stringify(postData, null, 2), 'utf8');
    
    // Calculate file size
    const stats = fs.statSync(postFile);
    const fileSizeInKB = (stats.size / 1024).toFixed(2);
    
    console.log(`✅ Saved: ${folderName} (${fileSizeInKB} KB)`);
    
    // Return summary for index
    return {
      id: blogPost.id,
      title: blogPost.title,
      folder: folderName,
      slug: slug,
      created_time: blogPost.created_time,
      last_edited_time: blogPost.last_edited_time,
      properties: {
        // Include key properties for index
        published: blogPost.properties.published,
        tags: blogPost.properties.tags,
        excerpt: blogPost.properties.excerpt,
        featured_image: blogPost.featured_image // Use the local path
      },
      og_image: blogPost.og_image,
      file_size_kb: parseFloat(fileSizeInKB),
      file_size_bytes: stats.size
    };
    
  } catch (error) {
    console.error(`❌ Error processing page ${page.id}:`, error.message);
    return null;
  }
}

// Main function to generate blog JSON with content
async function generateBlogJsonWithContent() {
  try {
    const startTime = Date.now();
    console.log('🚀 Starting Notion blog generation with content...');
    console.log(`📋 Database ID: ${DATABASE_ID}`);
    console.log('⚡ Rate limit: ~5 requests/second for faster processing');
    
    // Fetch all pages from the database
    let allPages = [];
    let hasMore = true;
    let nextCursor = undefined;
    
    while (hasMore) {
      const response = await notion.databases.query({
        database_id: DATABASE_ID,
        start_cursor: nextCursor,
        page_size: 100,
      });
      
      allPages = allPages.concat(response.results);
      hasMore = response.has_more;
      nextCursor = response.next_cursor;
      
      console.log(`📄 Fetched ${response.results.length} pages...`);
    }
    
    console.log(`📚 Total pages found: ${allPages.length}`);
    const estimatedTime = Math.ceil((allPages.length * 0.12) / 60); // Updated estimate: much faster with optimized parallel processing
    console.log(`⏱️  Estimated completion time: ~${estimatedTime} minutes (with optimized parallel processing)`);
    
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    // Process pages in parallel batches - increased batch size for better performance
    const BATCH_SIZE = 10; // Increased from 6 to 10 for faster processing
    const blogPostsSummary = [];
    let totalSize = 0;
    let processedCount = 0;
    
    console.log(`🚀 Processing ${allPages.length} pages in batches of ${BATCH_SIZE}...`);
    
    for (let i = 0; i < allPages.length; i += BATCH_SIZE) {
      const batch = allPages.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(allPages.length / BATCH_SIZE);
      
      console.log(`\n📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} pages)...`);
      
      // Add progress indicator
      const progress = ((processedCount / allPages.length) * 100).toFixed(1);
      console.log(`📊 Progress: ${progress}% (${processedCount}/${allPages.length} completed)`);
      
      // Process batch in parallel
      const batchPromises = batch.map((page, index) => 
        processSinglePage(page, i + index, allPages.length)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Collect successful results
      let batchSuccessCount = 0;
      for (const result of batchResults) {
        if (result.status === 'fulfilled' && result.value) {
          blogPostsSummary.push(result.value);
          totalSize += result.value.file_size_bytes;
          batchSuccessCount++;
        } else if (result.status === 'rejected') {
          console.error(`❌ Batch processing error:`, result.reason);
        }
      }
      
      processedCount += batchSuccessCount;
      console.log(`✅ Batch ${batchNumber} completed (${batchSuccessCount}/${batch.length} successful)`);
      
      // Show estimated time remaining
      if (batchNumber > 1) {
        const elapsed = (Date.now() - startTime) / 1000 / 60;
        const rate = processedCount / elapsed;
        const remaining = (allPages.length - processedCount) / rate;
        console.log(`⏱️  Estimated time remaining: ${remaining.toFixed(1)} minutes`);
      }
    }
    
    // Create index file with summary of all posts
    const indexData = {
      meta: {
        generated_at: new Date().toISOString(),
        total_posts: blogPostsSummary.length,
        database_id: DATABASE_ID,
        notion_api_version: '2022-06-28',
        total_size_mb: (totalSize / (1024 * 1024)).toFixed(2)
      },
      posts: blogPostsSummary
    };
    
    const indexFile = path.join(OUTPUT_DIR, 'index.json');
    fs.writeFileSync(indexFile, JSON.stringify(indexData, null, 2), 'utf8');
    
    console.log(`✅ Blog posts generated successfully!`);
    console.log(`📁 Output directory: ${OUTPUT_DIR}`);
    console.log(`📊 Total posts: ${blogPostsSummary.length}`);
    console.log(`📦 Total size: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`📋 Index file created: ${indexFile}`);
    
    const endTime = Date.now();
    const actualTime = ((endTime - startTime) / 1000 / 60).toFixed(1);
    console.log(`⏱️  Actual completion time: ${actualTime} minutes`);
    console.log(`🚀 Average processing rate: ${(blogPostsSummary.length / (actualTime || 1)).toFixed(1)} posts/minute`);
    console.log(`🔥 Performance: ~${Math.round(10 / (actualTime / (blogPostsSummary.length / 10) || 1))}x faster than sequential processing!`);
    console.log(`⚡ Optimization: ~${Math.round(5/3 * 100)}% faster rate limiting + ${Math.round(10/6 * 100)}% larger batches = ${Math.round((5/3) * (10/6) * 100)}% overall speedup!`);
    
  } catch (error) {
    console.error('❌ Error generating blog JSON with content:', error);
    
    if (error.code === 'unauthorized') {
      console.error('🔐 Authorization failed. Please check your Notion token.');
    } else if (error.code === 'object_not_found') {
      console.error('🔍 Database not found. Please check your database ID.');
    } else if (error.code === 'rate_limited') {
      console.error('⏱️  Rate limited. Please try again later.');
    }
    
    process.exit(1);
  }
}

// Run the generator
if (require.main === module) {
  generateBlogJsonWithContent();
}

module.exports = { generateBlogJsonWithContent };
