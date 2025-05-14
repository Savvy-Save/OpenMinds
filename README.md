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

When deploying the website:

1. Make sure to set up the environment variables on your hosting platform.
2. Do not include the `js/env.js` file in your deployment.

## License

[Your license information here]
