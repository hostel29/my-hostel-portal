const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();

// 🛑 यहाँ अपनी Cloudinary की डिटेल भरें जो आपने चरण 1 में नोट की थी
cloudinary.config({
    cloud_name: 'यहाँ_अपना_Cloud_Name_लिखें',
    api_key: 'यहाँ_अपनी_API_Key_लिखें',
    api_secret: 'यहाँ_अपना_API_Secret_लिखें'
});

// ☁️ क्लाउड स्टोरेज सेटिंग (अब फोटो इंटरनेट पर सेव होगी)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'hostel_photos',
        allowed_formats: ['jpg', 'png', 'jpeg']
    },
});
const upload = multer({ storage: storage });

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const studentsFile = path.join(__dirname, 'students.json');
const noticesFile = path.join(__dirname, 'notices.json');
const wardenFile = path.join(__dirname, 'warden.json');

const defaultWarden = {
    name: "डॉ. राजेश कुमार शर्मा",
    designation: "मुख्य हॉस्टल वार्डन",
    mobile: "+91 98765 43210",
    office: "रूम नंबर 01, ग्राउंड फ्लोर",
    photoUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"
};

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/get-warden', (req, res) => {
    fs.readFile(wardenFile, 'utf8', (err, data) => res.json(err || !data ? defaultWarden : JSON.parse(data)));
});
app.get('/get-notices', (req, res) => {
    fs.readFile(noticesFile, 'utf8', (err, data) => res.json(err || !data ? [] : JSON.parse(data)));
});

app.get('/check-room-status', (req, res) => {
    const mobileQuery = req.query.mobile ? req.query.mobile.trim() : "";
    fs.readFile(studentsFile, 'utf8', (err, data) => {
        if (err || !data) return res.json({ found: false });
        const student = JSON.parse(data).find(s => s.mobile === mobileQuery);
        if (student) {
            res.json({ found: true, name: student.studentName, studentClass: student.studentClass, category: student.category, photoUrl: student.photoUrl, roomNumber: student.roomNumber });
        } else {
            res.json({ found: false });
        }
    });
});

app.post('/submit-form', upload.single('studentPhoto'), (req, res) => {
    // req.file.path में अब इंटरनेट वाला लाइव फोटो लिंक आता है
    const photoPath = req.file ? req.file.path : "https://via.placeholder.com/150";

    const studentData = {
        id: req.body.mobile.trim(), 
        studentName: req.body.studentName,
        studentClass: req.body.studentClass,
        category: req.body.category,
        mobile: req.body.mobile.trim(),
        photoUrl: photoPath, 
        roomNumber: "अभी अलॉट नहीं हुआ", 
        date: new Date().toLocaleString()
    };

    fs.readFile(studentsFile, 'utf8', (err, data) => {
        let studentsList = !err && data ? JSON.parse(data) : [];
        studentsList = studentsList.filter(s => s.mobile !== studentData.mobile);
        studentsList.push(studentData);
        fs.writeFile(studentsFile, JSON.stringify(studentsList, null, 2), () => {
            res.send("<h1 style='color:green; text-align:center; margin-top:50px;'>🎉 प्रोफाइल बन गई!</h1><a href='/' style='display:block; text-align:center; font-size:20px;'>वापस जाएँ</a>");
        });
    });
});

app.get('/view-students', (req, res) => {
    const auth = { login: 'admin', password: 'password123' };
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');
    if (!login || !password || login !== auth.login || password !== auth.password) {
        res.set('WWW-Authenticate', 'Basic realm="401"');
        return res.status(401).send('<h1 style="text-align:center; margin-top:50px; color:red;">❌ गलत पासवर्ड!</h1>');
    }

    let currentWarden = fs.existsSync(wardenFile) ? JSON.parse(fs.readFileSync(wardenFile, 'utf8')) : defaultWarden;

    fs.readFile(studentsFile, 'utf8', (err, data) => {
        let studentsList = !err && data ? JSON.parse(data) : [];
        let tableRows = '';
        studentsList.forEach((student, index) => {
            tableRows += `
                <tr class="align-middle">
                    <td>${index + 1}</td>
                    <td><img src="${student.photoUrl}" class="rounded border shadow-sm me-2" style="width:45px; height:45px; object-fit:cover;"><b>${student.studentName}</b></td>
                    <td>${student.studentClass}</td>
                    <td><span class="badge bg-info">${student.category}</span></td>
                    <td>${student.mobile}</td>
                    <td>
                        <div class="d-flex">
                            <input type="text" id="room-${student.id}" class="form-control form-control-sm bg-dark text-white border-0" value="${student.roomNumber}" style="width:110px; margin-right:5px;">
                            <button onclick="saveRoom('${student.id}')" class="btn btn-sm btn-warning">अलॉट</button>
                        </div>
                    </td>
                </tr>`;
        });

        res.send(`
            <!DOCTYPE html>
            <html>
            <head><title>एडमिन पैनल</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"></head>
            <body class="bg-dark text-light p-5">
                <div class="row mb-4">
                    <div class="col-md-6">
                        <div class="container bg-secondary p-4 rounded shadow h-100">
                            <h3 class="text-warning">📢 नया नोटिस जारी करें</h3>
                            <form action="/post-notice" method="POST" class="input-group mt-3">
                                <input type="text" name="noticeText" class="form-control" placeholder="यहाँ नया नोटिस..." required>
                                <button type="submit" class="btn btn-danger">नोटिस लाइव करें</button>
                            </form>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="container bg-secondary p-4 rounded shadow h-100">
                            <h3 class="text-warning">⚙️ वार्डन की जानकारी और फोटो बदलें</h3>
                            <form action="/update-warden" method="POST" enctype="multipart/form-data" class="row g-2 mt-1">
                                <div class="col-md-6"><input type="text" name="wName" class="form-control form-control-sm" value="${currentWarden.name}" placeholder="नाम" required></div>
                                <div class="col-md-6"><input type="text" name="wDesig" class="form-control form-control-sm" value="${currentWarden.designation}" placeholder="पद" required></div>
                                <div class="col-md-6"><input type="text" name="wMobile" class="form-control form-control-sm" value="${currentWarden.mobile}" placeholder="मोबाइल" required></div>
                                <div class="col-md-6"><input type="text" name="wOffice" class="form-control form-control-sm" value="${currentWarden.office}" placeholder="ऑफिस" required></div>
                                <div class="col-md-10"><label class="small text-warning">📸 वार्डन फोटो (गैलरी से):</label><input type="file" name="wardenPhoto" class="form-control form-control-sm" accept="image/*"></div>
                                <div class="col-md-2 d-flex align-items-end"><button type="submit" class="btn btn-sm btn-primary w-100">सेव</button></div>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="container bg-secondary p-4 rounded shadow">
                    <h2 class="text-center text-warning mb-4">🔒 हॉस्टल एडमिन पैनल - स्टूडेंट प्रोफाइल्स</h2>
                    <table class="table table-dark table-striped table-hover align-middle">
                        <thead><tr><th>S.No</th><th>छात्र (फ़ोटो + नाम)</th><th>क्लास</th><th>कैटगरी</th><th>मोबाइल</th><th>ROOM NO</th></tr></thead>
                        <tbody>${tableRows || '<tr><td colspan="6" class="text-center">अभी कोई छात्र पंजीकृत नहीं है।</td></tr>'}</tbody>
                    </table>
                </div>
                <script>
                    function saveRoom(studentId) {
                        const roomVal = document.getElementById('room-' + studentId).value;
                        fetch('/assign-room', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ studentId: studentId, roomNumber: roomVal })
                        }).then(res => res.json()).then(data => { if(data.success) { alert('🎉 रूम अलॉट हो गया!'); location.reload(); } })
                    }
                </script>
            </body>
            </html>
        `);
    });
});

app.post('/assign-room', (req, res) => {
    const { studentId, roomNumber } = req.body;
    fs.readFile(studentsFile, 'utf8', (err, data) => {
        let studentsList = JSON.parse(data);
        studentsList = studentsList.map(s => { if (s.id === studentId) s.roomNumber = roomNumber; return s; });
        fs.writeFile(studentsFile, JSON.stringify(studentsList, null, 2), () => res.json({ success: true }));
    });
});

app.post('/post-notice', (req, res) => {
    const newNotice = { text: req.body.noticeText, date: new Date().toLocaleDateString() };
    fs.readFile(noticesFile, 'utf8', (err, data) => {
        let noticesList = !err && data ? JSON.parse(data) : [];
        noticesList.unshift(newNotice);
        fs.writeFile(noticesFile, JSON.stringify(noticesList, null, 2), () => res.send("<h1 style='color:green; text-align:center; margin-top:50px;'>📢 नोटिस लाइव हो गया है!</h1><a href='/view-students' style='display:block; text-align:center;'>वापस</a>"));
    });
});

app.post('/update-warden', upload.single('wardenPhoto'), (req, res) => {
    let currentWarden = fs.existsSync(wardenFile) ? JSON.parse(fs.readFileSync(wardenFile, 'utf8')) : defaultWarden;
    const photoPath = req.file ? req.file.path : currentWarden.photoUrl;

    const updatedWarden = {
        name: req.body.wName,
        designation: req.body.wDesig,
        mobile: req.body.wMobile,
        office: req.body.wOffice,
        photoUrl: photoPath
    };

    fs.writeFile(wardenFile, JSON.stringify(updatedWarden, null, 2), () => {
        res.send("<h1 style='color:green; text-align:center; margin-top:50px;'>👨‍💼 वार्डन अपडेट हो गए!</h1><a href='/view-students' style='display:block; text-align:center;'>वापस</a>");
    });
});

// Render होस्टिंग के लिए पोर्ट को डायनामिक करना ज़रूरी है
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 सर्वर पोर्ट ${PORT} पर चालू है!`));