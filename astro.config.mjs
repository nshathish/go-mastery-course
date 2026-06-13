// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [mdx()],
  markdown: {
    shikiConfig: {
      theme: 'github-light',
      wrap: false,
      transformers: [
        {
          pre(node) {
            node.properties.style =
              'background-color:#dde3ea;overflow-x:auto;padding:1.25rem 1.5rem';
          },
        },
      ],
    },
  },
});
