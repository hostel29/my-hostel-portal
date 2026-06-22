const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();

// 🛑 अपनी Cloudinary की डिटेल यहाँ पक्का चेक कर लें
cloudinary.config({
    cloud_name: 'dhg4qy5rw', 
    api_key: '492175456555184', 
    api_secret: 'nPJYcf47rjH56k2cNQtIi6etBLA' 
});

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

// रेंडर पर डेटा डिलीट होने से बचाने के लिए /tmp/ फोल्डर का इस्तेमाल (टेंपरेरी सेफ ज़ोन)
const studentsFile = path.join('/tmp', 'students.json');
const noticesFile = path.join('/tmp', 'notices.json');
const wardenFile = path.join('/tmp', 'warden.json');
const logoFile = path.join('/tmp', 'logo.json');

const defaultWarden = {
    name: "डॉ. राजेश कुमार शर्मा",
    designation: "मुख्य हॉस्टल वार्डन",
    mobile: "+91 98765 43210",
    office: "रूम नंबर 01, grounding floor",
    photoUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"
};

const defaultLogo = {
    url: "https://via.placeholder.com/150?text=HOSTEL+LOGO"
};

const initFile = (filePath, defaultData = '[]') => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, defaultData, 'utf8');
    }
};

initFile(studentsFile, '[]');
initFile(noticesFile, '[]');
initFile(wardenFile, JSON.stringify(defaultWarden, null, 2));
initFile(logoFile, JSON.stringify(defaultLogo, null, 2));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.get('/get-warden', (req, res) => {
    fs.readFile(wardenFile, 'utf8', (err, data) => {
        res.json(err || !data ? defaultWarden : JSON.parse(data));
    });
});

app.get('/get-logo', (req, res) => {
    fs.readFile(logoFile, 'utf8', (err, data) => {
        res.json(err || !data ? defaultLogo : JSON.parse(data));
    });
});

app.get('/get-notices', (req, res) => {
    fs.readFile(noticesFile, 'utf8', (err, data) => {
        res.json(err || !data ? [] : JSON.parse(data));
    });
});

app.get('/check-room-status', (req, res) => {
    const mobileQuery = req.query.mobile ? req.query.mobile.trim() : "";
    fs.readFile(studentsFile, 'utf8', (err, data) => {
        if (err || !data) return res.json({ found: false });
        try {
            const student = JSON.parse(data).find(s => s.mobile === mobileQuery);
            if (student) {
                res.json({ found: true, ...student });
            } else {
                res.json({ found: false });
            }
        } catch(e) { res.json({ found: false }); }
    });
});

app.post('/submit-form', upload.single('studentPhoto'), (req, res) => {
    const photoPath = req.file ? req.file.path : "https://via.placeholder.com/150";
    const studentData = {
        id: req.body.mobile.trim(), 
        studentName: req.body.studentName,
        fatherName: req.body.fatherName,
        motherName: req.body.motherName,
        dob: req.body.dob,
        aadharCard: req.body.aadharCard,
        mobile: req.body.mobile.trim(),
        studentClass: req.body.studentClass,
        course: req.body.course,
        category: req.body.category,
        photoUrl: photoPath, 
        roomNumber: "अभी अलॉट नहीं हुआ", 
        date: new Date().toLocaleString()
    };

    fs.readFile(studentsFile, 'utf8', (err, data) => {
        let studentsList = [];
        if (!err && data) {
            try { studentsList = JSON.parse(data); } catch(e) { studentsList = []; }
        }
        studentsList = studentsList.filter(s => s.mobile !== studentData.mobile);
        studentsList.push(studentData);
        fs.writeFile(studentsFile, JSON.stringify(studentsList, null, 2), () => {
            res.send("<h1 style='color:green; text-align:center; margin-top:50px;'>🎉 प्रोफाइल सफलता पूर्वक बन गई!</h1><a href='/' style='display:block; text-align:center; font-size:20px;'>वापस जाएँ</a>");
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

    let currentWarden = defaultWarden;
    if (fs.existsSync(wardenFile)) {
        try { currentWarden = JSON.parse(fs.readFileSync(wardenFile, 'utf8')); } catch(e) {}
    }

    fs.readFile(studentsFile, 'utf8', (err, data) => {
        let studentsList = [];
        if (!err && data) {
            try { studentsList = JSON.parse(data); } catch(e) { studentsList = []; }
        }
        let tableRows = '';
        studentsList.forEach((student, index) => {
            tableRows += `
                <tr class="align-middle text-white">
                    <td>${index + 1}</td>
                    <td><img src="${student.photoUrl}" class="rounded border" style="width:45px; height:45px; object-fit:cover; margin-right:10px;"><b>${student.studentName}</b></td>
                    <td><b>पिता:</b> ${student.fatherName}<br><b>माता:</b> ${student.motherName}</td>
                    <td>${student.dob}</td>
                    <td>${student.aadharCard ? `XXXX-XXXX-${student.aadharCard.slice(-4)}` : 'N/A'}</td>
                    <td>${student.mobile}</td>
                    <td>${student.studentClass} (${student.course})</td>
                    <td><span class="badge bg-info">${student.category}</span></td>
                    <td>
                        <div class="d-flex">
                            <input type="text" id="room-${student.id}" class="form-control form-control-sm bg-dark text-white border-0" value="${student.roomNumber}" style="width:90px; margin-right:5px;">
                            <button onclick="saveRoom('${student.id}')" class="btn btn-sm btn-warning">अलॉट</button>
                        </div>
                    </td>
                </tr>`;
        });

        res.send(`
            <!DOCTYPE html>
            <html>
            <head><title>एडमिन पैनल</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"></head>
            <body class="bg-dark text-light p-4">
                <div class="row mb-4">
                    <div class="col-md-4">
                        <div class="bg-secondary p-3 rounded shadow h-100">
                            <h4 class="text-warning">⚙️ हॉस्टल लोगो बदलें</h4>
                            <form action="/update-logo" method="POST" enctype="multipart/form-data" class="mt-2">
                                <input type="file" name="hostelLogo" class="form-control form-control-sm mb-2" accept="image/*" required>
                                <button type="submit" class="btn btn-sm btn-primary w-100">लोगो अपलोड करें</button>
                            </form>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="bg-secondary p-3 rounded shadow h-100">
                            <h4 class="text-warning">📢 नया नोटिस जारी करें</h4>
                            <form action="/post-notice" method="POST" class="mt-2">
                                <input type="text" name="noticeText" class="form-control form-control-sm mb-2" placeholder="यहाँ नया नोटिस..." required>
                                <button type="submit" class="btn btn-sm btn-danger w-100">नोटिस लाइव करें</button>
                            </form>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="bg-secondary p-3 rounded shadow h-100">
                            <h4 class="text-warning">⚙️ वार्डन की जानकारी बदलें</h4>
                            <form action="/update-warden" method="POST" enctype="multipart/form-data" class="row g-2 mt-1">
                                <div class="col-6"><input type="text" name="wName" class="form-control form-control-sm" value="${currentWarden.name}" required></div>
                                <div class="col-6"><input type="text" name="wDesig" class="form-control form-control-sm" value="${currentWarden.designation}" required></div>
                                <div class="col-6"><input type="text" name="wMobile" class="form-control form-control-sm" value="${currentWarden.mobile}" required></div>
                                <div class="col-6"><input type="text" name="wOffice" class="form-control form-control-sm" value="${currentWarden.office}" required></div>
                                <div class="col-12"><input type="file" name="wardenPhoto" class="form-control form-control-sm" accept="image/*"></div>
                                <div class="col-12"><button type="submit" class="btn btn-sm btn-warning w-100">वार्डन सेव करें</button></div>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="bg-secondary p-4 rounded shadow">
                    <h2 class="text-center text-warning mb-4">🔒 हॉस्टल एडमिन पैनल - स्टूडेंट लिस्ट</h2>
                    <div class="table-responsive">
                        <table class="table table-dark table-striped table-hover">
                            <thead><tr><th>S.No</th><th>छात्र</th><th>माता/पिता</th><th>DOB</th><th>Aadhaar</th><th>मोबाइल</th><th>क्लास/कोर्स</th><th>कैटगरी</th><th>ROOM NO</th></tr></thead>
                            <tbody>${tableRows || '<tr><td colspan="9" class="text-center">अभी कोई छात्र पंजीकृत नहीं है।</td></tr>'}</tbody>
                        </table>
                    </div>
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

app.post('/update-logo', upload.single('hostelLogo'), (req, res) => {
    if (req.file) {
        fs.writeFile(logoFile, JSON.stringify({ url: req.file.path }, null, 2), () => {
            res.send("<h1 style='color:green; text-align:center; margin-top:50px;'>🎉 लोगो सफलतापूर्वक बदल गया!</h1><a href='/view-students' style='display:block; text-align:center;'>वापस एडमिन पैनल जाएँ</a>");
        });
    } else { res.redirect('/view-students'); }
});

app.post('/assign-room', (req, res) => {
    const { studentId, roomNumber } = req.body;
    fs.readFile(studentsFile, 'utf8', (err, data) => {
        let studentsList = [];
        try { studentsList = JSON.parse(data); } catch(e) {}
        studentsList = studentsList.map(s => { if (s.id === studentId) s.roomNumber = roomNumber; return s; });
        fs.writeFile(studentsFile, JSON.stringify(studentsList, null, 2), () => res.json({ success: true }));
    });
});

app.post('/post-notice', (req, res) => {
    const newNotice = { text: req.body.noticeText, date: new Date().toLocaleDateString() };
    fs.readFile(noticesFile, 'utf8', (err, data) => {
        let noticesList = [];
        if (!err && data) { try { noticesList = JSON.parse(data); } catch(e){} }
        noticesList.unshift(newNotice);
        fs.writeFile(noticesFile, JSON.stringify(noticesList, null, 2), () => res.send("<h1 style='color:green; text-align:center; margin-top:50px;'>📢 नोटिस लाइव हो गया है!</h1><a href='/view-students' style='display:block; text-align:center;'>वापस</a>"));
    });
});

app.post('/update-warden', upload.single('wardenPhoto'), (req, res) => {
    let currentWarden = defaultWarden;
    if (fs.existsSync(wardenFile)) {
        try { currentWarden = JSON.parse(fs.readFileSync(wardenFile, 'utf8')); } catch(e){}
    }
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 सर्वर चालू है!`));
