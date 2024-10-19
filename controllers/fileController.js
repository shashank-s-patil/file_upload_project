const express = require('express');
const multer = require('multer');
const fs = require('fs');
const File = require('../models/fileModel');
const router = express.Router();
const path = require('path');


// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Generate 6-digit code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// To Upload the file
router.post('/upload', upload.single('file'), async (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const code = generateCode();
    const newFile = new File({
        filename: file.filename,
        userId: req.user.id,
        code
    });
    await newFile.save();
    res.status(201).json({ message: 'File uploaded successfully', code });
});

// To get the List of files
router.get('/', async (req, res) => {
    const files = await File.find({ userId: req.user.id });
    res.json(files);
});

// To Remove the file
router.delete('/:id', async (req, res) => {
    const file = await File.findById(req.params.id);
    if (!file || file.userId.toString() !== req.user.id)
        return res.status(404).json({ message: 'File not found' });

    fs.unlink(path.join(__dirname, '../uploads', file.filename), err => {
        if (err) return res.status(500).json({ message: 'File deletion failed' });
    });
    await file.remove();
    res.json({ message: 'File removed successfully' });
});

// To Download the file
router.post('/download/:id', async (req, res) => {
    const { code } = req.body;
    const file = await File.findById(req.params.id);
    if (!file || file.userId.toString() !== req.user.id)
        return res.status(404).json({ message: 'File not found' });

    if (file.code !== code) return res.status(400).json({ message: 'Invalid code' });

    const filePath = path.join(__dirname, '../uploads', file.filename);
    res.download(filePath);
});

module.exports = router;
