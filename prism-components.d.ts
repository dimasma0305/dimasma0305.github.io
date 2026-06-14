// Prism.js language grammar files ship no type declarations. They are imported
// (dynamically, in components/mdx.tsx) only for their side effect of registering
// a grammar on the Prism singleton, so declaring them as `any` is sufficient.
declare module "prismjs/components/*";
