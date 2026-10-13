// Wrangler bundles *.html imports as text modules for the Pages Function.
declare module "*.html" {
  const html: string;
  export default html;
}
