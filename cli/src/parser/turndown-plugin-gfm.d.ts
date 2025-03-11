declare module "turndown-plugin-gfm" {
    const gfm: any;
    export { gfm };
}


declare module 'turndown-plugin-gfm' {
    import { Plugin } from 'turndown';
    export const gfm: Plugin;
  }