# UpLite - Empowering Young Readers

A website dedicated to promoting literacy and reading skills for young children.

## Security and Environment Variables

This project uses Firebase for analytics, visitor counting, and contact form submissions. To protect sensitive Firebase configuration information, we use environment variables.

### Setting Up Environment Variables

1. Copy the `js/env.template.js` file to a new file named `js/env.js`:
   ```
   cp js/env.template.js js/env.js
   ```

2. Edit the `js/env.js` file and replace the placeholder values with your actual Firebase configuration values:
   ```javascript
   window.env = {
     FIREBASE_API_KEY: "YOUR_ACTUAL_API_KEY",
     FIREBASE_AUTH_DOMAIN: "YOUR_ACTUAL_AUTH_DOMAIN",
     // ... other Firebase configuration values
   };
   ```

3. Make sure `js/env.js` is in your `.gitignore` file to prevent it from being committed to your repository.

### Why This Approach?

- The `js/env.js` file contains sensitive information and should never be committed to version control.
- The `js/env.template.js` file provides a template for setting up the environment variables without exposing sensitive information.
- This approach allows the website to work locally with the Firebase configuration while keeping it secure when deployed.

## Local Development

To run the website locally:

1. Set up the environment variables as described above.
2. Open the `index.html` file in your browser or use a local development server.

## Deployment

### Deploying to Netlify

This project is configured for easy deployment to Netlify:

1. Push your code to GitHub (without the sensitive `js/env.js` file)
2. Connect your GitHub repository to Netlify
3. In the Netlify dashboard, go to Site settings > Build & deploy > Environment variables
4. Add the following environment variables with your Firebase configuration values:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_DATABASE_URL`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`
   - `FIREBASE_MEASUREMENT_ID`
5. Deploy your site

During the build process, Netlify will run the `build-env.js` script which generates the `js/env.js` file using the environment variables you set in the Netlify dashboard.

### Deploying to Vercel

This project is also configured for deployment to Vercel:

1. Push your code to GitHub (without the sensitive `js/env.js` file)
2. Connect your GitHub repository to Vercel
3. In the Vercel dashboard, go to Project Settings > Environment Variables
4. Add the following environment variables with your Firebase configuration values:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_DATABASE_URL`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`
   - `FIREBASE_MEASUREMENT_ID`
5. Deploy your site

The `vercel.json` configuration file and `build-env.js` script will handle the generation of the `js/env.js` file during the build process.

### Deploying to GitHub Pages

For GitHub Pages deployment:

1. Create a new branch for GitHub Pages deployment: `git checkout -b gh-pages`
2. Create a production version of `js/env.js` with your actual Firebase configuration
3. Add this file to the gh-pages branch: `git add js/env.js`
4. Commit and push this branch to GitHub: `git commit -m "Add production env.js for GitHub Pages" && git push origin gh-pages`
5. In your GitHub repository settings, set up GitHub Pages to use the gh-pages branch

**Note:** Since GitHub Pages doesn't support environment variables or build processes, you'll need to include your Firebase configuration directly in the code. Be cautious about this approach and consider using Netlify or Vercel instead for better security.

## License

[Your license information here]
