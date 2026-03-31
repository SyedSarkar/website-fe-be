import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const SCRAPED_DATA_DIR = path.join(__dirname, '..', 'scraped_data');

// Get all pages for a module
router.get('/:moduleId', async (req, res) => {
  try {
    const { moduleId } = req.params;
    const modulePath = path.join(SCRAPED_DATA_DIR, moduleId);
    
    // Check if directory exists
    try {
      await fs.access(modulePath);
    } catch {
      return res.status(404).json({
        status: 'fail',
        message: `Module ${moduleId} not found`
      });
    }
    
    // Read all .txt files in the module directory
    const files = await fs.readdir(modulePath);
    const txtFiles = files.filter(f => f.endsWith('.txt'));
    
    const pages = {};
    for (const file of txtFiles) {
      const pageName = file.replace('.txt', '');
      const content = await fs.readFile(path.join(modulePath, file), 'utf-8');
      pages[pageName] = content;
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        moduleId,
        pages,
        pageCount: Object.keys(pages).length
      }
    });
  } catch (error) {
    console.error('Error fetching module content:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch module content'
    });
  }
});

// Get specific page content
router.get('/:moduleId/:pageId', async (req, res) => {
  try {
    const { moduleId, pageId } = req.params;
    const filePath = path.join(SCRAPED_DATA_DIR, moduleId, `${pageId}.txt`);
    
    // Security: prevent directory traversal
    const resolvedPath = path.resolve(filePath);
    const resolvedRoot = path.resolve(SCRAPED_DATA_DIR);
    if (!resolvedPath.startsWith(resolvedRoot)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Invalid path'
      });
    }
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      res.status(200).json({
        status: 'success',
        data: {
          moduleId,
          pageId,
          content
        }
      });
    } catch {
      return res.status(404).json({
        status: 'fail',
        message: `Page ${pageId} not found in module ${moduleId}`
      });
    }
  } catch (error) {
    console.error('Error fetching page content:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch page content'
    });
  }
});

// List all available modules
router.get('/', async (req, res) => {
  try {
    const entries = await fs.readdir(SCRAPED_DATA_DIR, { withFileTypes: true });
    const modules = entries
      .filter(e => e.isDirectory())
      .map(e => e.name);
    
    res.status(200).json({
      status: 'success',
      data: {
        modules,
        count: modules.length
      }
    });
  } catch (error) {
    console.error('Error listing modules:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to list modules'
    });
  }
});

// Serve images from module folders
router.get('/:moduleId/images/:imageName', async (req, res) => {
  try {
    const { moduleId, imageName } = req.params;
    const filePath = path.join(SCRAPED_DATA_DIR, moduleId, 'images', imageName);
    
    // Security: prevent directory traversal
    const resolvedPath = path.resolve(filePath);
    const resolvedRoot = path.resolve(SCRAPED_DATA_DIR);
    if (!resolvedPath.startsWith(resolvedRoot)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Invalid path'
      });
    }
    
    // Determine content type
    const ext = path.extname(imageName).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp'
    };
    
    try {
      const imageBuffer = await fs.readFile(filePath);
      res.set('Content-Type', contentTypes[ext] || 'application/octet-stream');
      res.send(imageBuffer);
    } catch {
      return res.status(404).json({
        status: 'fail',
        message: `Image ${imageName} not found`
      });
    }
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to serve image'
    });
  }
});

export default router;
