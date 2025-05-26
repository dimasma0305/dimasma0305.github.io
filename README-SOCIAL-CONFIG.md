# Social Media Configuration

This file contains instructions for updating your social media profile information for sharing captions.

## Configuration File

The social media configuration is located in `lib/site-config.ts`. You need to update the following information with your actual details:

```typescript
export const siteConfig = {
  name: "Your Blog Name",
  description: "Your blog description",
  url: "https://your-actual-domain.com", // Update this
  author: {
    name: "Your Name",
    twitter: "@yourtwitterhandle", // Update this
    linkedin: "yourlinkedinusername", // Update this
    github: "yourgithubusername", // Update this
    email: "your@email.com", // Update this
  },
  social: {
    twitter: "https://twitter.com/yourtwitterhandle", // Update this
    linkedin: "https://linkedin.com/in/yourlinkedinusername", // Update this
    github: "https://github.com/yourgithubusername", // Update this
  }
}
```

## What This Enables

When users share your blog posts, they will automatically include:

### Twitter Shares
- Post title in quotes
- Your Twitter handle mention
- Post excerpt (if it fits)
- Relevant hashtags (#blog #tech #programming)
- Post URL

### LinkedIn Shares
- Post title in quotes
- Full excerpt
- Author attribution
- Link to your LinkedIn profile
- Professional hashtags

### Facebook Shares
- Post title with emoji
- Post excerpt
- Author name
- Relevant hashtags

### Copy Link
- Post title with author attribution
- Direct link to the post

## Example Output

When someone shares your post "Getting Started with React Hooks", the Twitter share would look like:

```
"Getting Started with React Hooks" by @yourtwitterhandle

Learn how to use React Hooks to manage state and side effects in your React applications...

#blog #tech #programming

https://yourdomain.com/posts/getting-started-with-react-hooks
```

## How to Update

1. Open `lib/site-config.ts`
2. Replace all placeholder values with your actual information
3. Save the file
4. The changes will take effect immediately

## Important Notes

- Make sure your Twitter handle includes the @ symbol
- LinkedIn username should be just the username part (not the full URL)
- GitHub username should be just the username part (not the full URL)
- Update the domain URL to your actual website domain
- All social media links should be complete URLs

This configuration ensures that when people share your content, they automatically mention your profiles, helping to drive traffic and followers to your social media accounts. 