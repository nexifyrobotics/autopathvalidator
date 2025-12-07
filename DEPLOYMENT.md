# GitHub Pages Deployment Guide

## 🚀 Quick Deploy

### Option 1: Automatic Deployment (Recommended)

1. **Create GitHub Repository**
   ```bash
   # On GitHub, create a new repository named "autopathvalidator"
   ```

2. **Push Code**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/autopathvalidator.git
   git branch -M main
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: "GitHub Actions"
   - The workflow will automatically build and deploy

4. **Access Your Site**
   ```
   https://YOUR_USERNAME.github.io/autopathvalidator/
   ```

### Option 2: Manual Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy dist folder**
   ```bash
   # Install gh-pages
   npm install -D gh-pages
   
   # Add to package.json scripts:
   "deploy": "gh-pages -d dist"
   
   # Deploy
   npm run deploy
   ```

## 📝 Important Notes

- The app is configured with `base: '/autopathvalidator/'` in `vite.config.js`
- If your repository name is different, update the `base` path
- GitHub Actions workflow is in `.github/workflows/deploy.yml`
- Every push to `main` branch triggers automatic deployment

## 🔧 Troubleshooting

### Issue: 404 on GitHub Pages
**Solution**: Make sure the repository name matches the `base` path in `vite.config.js`

### Issue: Assets not loading
**Solution**: Check that `base` path in `vite.config.js` starts and ends with `/`

### Issue: Workflow fails
**Solution**: 
1. Go to Settings → Actions → General
2. Enable "Read and write permissions"
3. Re-run the workflow

## 📦 Build Output

The `dist/` folder contains:
- `index.html` - Main HTML file
- `assets/` - CSS and JS bundles
- All static assets

Total size: ~173 KB gzipped

## 🌐 Custom Domain (Optional)

1. Add a `CNAME` file to `public/` folder with your domain
2. Configure DNS settings at your domain provider
3. Enable custom domain in GitHub Pages settings
