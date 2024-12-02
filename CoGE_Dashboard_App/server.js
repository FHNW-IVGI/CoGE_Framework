import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const port = process.env.PORT || 5000;

// Define the path to the videos directory
const videosDir = path.join(process.cwd(), 'public', 'videos');

// Serve the list of video files
app.get('/api/files', (req, res) => {
  fs.readdir(videosDir, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    // Filter out only mp4 files
    const videoFiles = files.filter(file => file.endsWith('.mp4'));
    res.json(videoFiles);
  });
});

// Serve static files (including videos) from the public directory
app.use(express.static(path.join(process.cwd(), 'public')));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
