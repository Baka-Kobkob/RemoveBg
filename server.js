const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });
const PORT = 3000;

// API KEY របស់អ្នក (សុវត្ថិភាពក្នុង Backend)
const REMOVE_BG_API_KEY = "3pnkcKC44h6WQnpVF9kPFHEL"; 

app.use(express.json());
app.use(express.static(__dirname));

// មុខងារកត់ត្រាសកម្មភាព
function logActivity(fileName) {
    const data = JSON.parse(fs.readFileSync('./vreal.json', 'utf8'));
    data.removed_images.push({
        user: "User_" + Math.floor(1000 + Math.random() * 9000),
        file_name: fileName,
        date: new Date().toLocaleString('km-KH')
    });
    fs.writeFileSync('./vreal.json', JSON.stringify(data, null, 2));
}

// Route សម្រាប់លុប Background
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
            headers: { ...formData.getHeaders(), 'X-Api-Key': REMOVE_BG_API_KEY },
        });

        logActivity(req.file.originalname);
        fs.unlinkSync(req.file.path); // លុបរូបបណ្តោះអាសន្នចេញពី server

        res.set('Content-Type', 'image/png');
        res.send(response.data);
    } catch (error) {
        res.status(500).send('AI Error: មិនអាចលុបបានទេ។');
    }
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
