const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const app = express();
const upload = multer({ dest: '/tmp/' }); // ប្រើ /tmp សម្រាប់ Vercel

const API_KEY = "3pnkcKC44h6WQnpVF9kPFHEL"; 

app.use(express.json());

app.post('/api/remove-bg', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send('No image uploaded.');

        const formData = new FormData();
        formData.append('size', 'auto');
        formData.append('image_file', fs.createReadStream(req.file.path));

        const response = await axios({
            method: 'post',
            url: 'https://api.remove.bg/v1.0/removebg',
            data: formData,
            responseType: 'arraybuffer',
            headers: { ...formData.getHeaders(), 'X-Api-Key': API_KEY },
        });

        // លុប file ចេញពី /tmp បន្ទាប់ពីប្រើរួច
        fs.unlinkSync(req.file.path);

        res.set('Content-Type', 'image/png');
        res.send(response.data);
    } catch (error) {
        res.status(500).send('AI Error');
    }
});

module.exports = app;
