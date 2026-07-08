const Module = require('../models/Module');
const User = require('../models/User');
const db = require('../config/database');
const { AppError } = require('../utils/AppError');
const { asyncHandler } = require('../utils/asyncHandler');

exports.getModules = asyncHandler(async (req, res) => {
  const modules = await Module.findByCohort(req.params.cohortId, req.user.id);
  res.json({ status: 'success', data: { modules } });
});

exports.getModule = asyncHandler(async (req, res) => {
  const mod = await Module.findById(req.params.id, req.user.id);
  if (!mod) throw new AppError('Module not found', 404);
  
  if (!(await Module.checkPrerequisite(req.params.id, req.user.id))) {
    throw new AppError('Complete previous module first', 403);
  }
  
  await Module.trackProgress(req.params.id, req.user.id);
  await User.updateStreak(req.user.id);
  
  const blocks = await Module.getContentBlocks(req.params.id);
  
  const processedBlocks = blocks.map(block => {
    if (block.block_type === 'video' && block.content) {
      const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/;
      const match = block.content.match(youtubeRegex);
      if (match) {
        block.video_id = match[1];
        block.embed_url = `https://www.youtube.com/embed/${match[1]}`;
      }
    }
    return block;
  });
  
  res.json({ 
    status: 'success', 
    data: { 
      module: mod, 
      contentBlocks: processedBlocks 
    } 
  });
});

exports.createModuleContent = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;
  const { blockType, title, content, fileUrl, orderNumber } = req.body;
  
  if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
    throw new AppError('Only instructors can add content', 403);
  }
  

  const moduleCheck = await db.query('SELECT * FROM modules WHERE id = $1', [moduleId]);
  if (moduleCheck.rows.length === 0) {
    throw new AppError('Module not found', 404);
  }
  

  const orderResult = await db.query(
    'SELECT MAX(order_number) as max_order FROM content_blocks WHERE module_id = $1',
    [moduleId]
  );
  const nextOrder = (orderResult.rows[0].max_order || 0) + 1;
  
  const result = await db.query(
    'INSERT INTO content_blocks (module_id, block_type, title, content, file_url, order_number) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [moduleId, blockType, title, content, fileUrl, orderNumber || nextOrder]
  );
  
  res.status(201).json({ status: 'success', data: { block: result.rows[0] } });
});

exports.updateModuleContent = asyncHandler(async (req, res) => {
  const { blockId } = req.params;
  const { title, content, fileUrl, orderNumber } = req.body;
  
  if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
    throw new AppError('Only instructors can update content', 403);
  }
  
  const result = await db.query(
    'UPDATE content_blocks SET title = $1, content = $2, file_url = $3, order_number = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
    [title, content, fileUrl, orderNumber, blockId]
  );
  
  if (result.rows.length === 0) {
    throw new AppError('Content block not found', 404);
  }
  
  res.json({ status: 'success', data: { block: result.rows[0] } });
});


exports.deleteModuleContent = asyncHandler(async (req, res) => {
  const { blockId } = req.params;
  
  
  if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
    throw new AppError('Only instructors can delete content', 403);
  }
  
  
  const blockCheck = await db.query('SELECT * FROM content_blocks WHERE id = $1', [blockId]);
  if (blockCheck.rows.length === 0) {
    throw new AppError('Content block not found', 404);
  }
  
  
  await db.query('DELETE FROM content_blocks WHERE id = $1', [blockId]);
  
  res.json({ 
    status: 'success', 
    message: 'Content block deleted successfully' 
  });
});
