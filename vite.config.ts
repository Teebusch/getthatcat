import { defineConfig } from 'vite';
import copy from 'rollup-plugin-copy';
import { resolve, join } from 'path';

export default defineConfig({
  plugins: [
    copy({
        hook: 'writeBundle',
        verbose: true,
        targets: [
            { src: ['dist/assets', 'dist/images', 'dist/favicon.ico'], dest: 'RServer/www/' },
            { src: 
                'dist/index.html', 
                dest: 'RServer/', 
                rename: 'game.html', 
                transform: (contents) => {
                    // Inject headContent into the <head> section of the HTML
                    // headContent() is a function that returns the content to be injected when the page is loaded
                    // with `htmlTemplate` in Shiny
                    const headContent = '{{ headContent() }}';
                    const headRegex = /<head>([\s\S]*?)<\/head>/;
                    const match = contents.toString().match(headRegex);
                    if (match) {    
                        const head = match[1];
                        return contents.toString().replace(headRegex, `<head>${head}${headContent}</head>`);
                    }
                 }
             }
        ]
    })
  ]
});
