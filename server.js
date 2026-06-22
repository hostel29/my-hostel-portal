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
    url: "https://via.placeholder.com/800x250?text=HOSTEL+BANNER+LOGO"
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

// 🏠 मुख्य पेज
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// 📝 लिंक 1: रजिस्ट्रेशन फॉर्म पेज (सफ़ेद बैकग्राउंड में)
app.get('/registration-form', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="hi">
        <head>
            <meta charset="UTF-8">
            <title>स्टूडेंट रजिस्ट्रेशन फॉर्म 2026-27</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>body{ background-color: #f8f9fa; }</style>
        </head>
        <body class="p-5">
            <div class="container" style="max-width: 800px;">
                <div class="card p-4 shadow-sm bg-white">
                    <h2 class="text-center text-primary fw-bold mb-4">📝 स्टूडेंट रजिस्ट्रेशन फॉर्म (सत्र 2026-27)</h2>
                    <form action="/submit-form" method="POST" enctype="multipart/form-data" class="row g-3">
                        <div class="col-md-6"><label class="form-label fw-bold">विद्यार्थी का नाम:</label><input type="text" name="studentName" class="form-control" required></div>
                        <div class="col-md-6"><label class="form-label fw-bold">मोबाइल नंबर:</label><input type="tel" name="mobile" class="form-control" required></div>
                        <div class="col-md-6"><label class="form-label fw-bold">पिता का नाम:</label><input type="text" name="fatherName" class="form-control" required></div>
                        <div class="col-md-6"><label class="form-label fw-bold">माता का नाम:</label><input type="text" name="motherName" class="form-control" required></div>
                        <div class="col-md-6"><label class="form-label fw-bold">जन्म तिथि (DOB):</label><input type="date" name="dob" class="form-control" required></div>
                        <div class="col-md-6"><label class="form-label fw-bold">आधार कार्ड नंबर:</label><input type="text" name="aadharCard" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">क्लास / वर्ष:</label><input type="text" name="studentClass" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">कोर्स / ब्रांच:</label><input type="text" name="course" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">कैटेगरी (Category):</label><select name="category" class="form-select" required><option value="General">General</option><option value="OBC">OBC</option><option value="SC">SC</option><option value="ST">ST</option></select></div>
                        <div class="col-12"><label class="form-label fw-bold text-danger">📸 अपनी पासपोर्ट साइज फोटो अपलोड करें:</label><input type="file" name="studentPhoto" class="form-control" accept="image/*" required></div>
                        <div class="col-12 mt-4"><button type="submit" class="btn btn-primary w-100 fw-bold fs-5 shadow-sm">🚀 एडमिशन फॉर्म जमा करें</button></div>
                    </form>
                    <div class="text-center mt-3"><a href="/" class="btn btn-link">🏠 मुख्य पृष्ठ पर वापस जाएँ</a></div>
                </div>
            </div>
        </body>
        </html>
    `);
});

// 🔍 लिंक 2: स्टेटस / रिजल्ट चेक करने वाला पेज
app.get('/check-status-page', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="hi">
        <head>
            <meta charset="UTF-8">
            <title>अलॉटमेंट रिजल्ट स्टेटस</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>body{ background-color: #f8f9fa; }</style>
        </head>
        <body class="p-5">
            <div class="container" style="max-width: 600px;">
                <div class="card p-4 shadow-sm bg-white border border-success">
                    <h3 class="text-center text-success fw-bold mb-4">🔍 अलॉटमेंट रिजल्ट / प्रोफाइल स्टेटस</h3>
                    <div class="input-group mb-3">
                        <input type="tel" id="searchMobile" class="form-control" placeholder="अपना रजिस्टर्ड मोबाइल नंबर लिखें...">
                        <button onclick="checkStatus()" class="btn btn-success fw-bold">स्टेटस देखें</button>
                    </div>
                    <div id="statusResult"></div>
                    <div class="text-center mt-4"><a href="/" class="btn btn-link">🏠 मुख्य पृष्ठ पर वापस जाएँ</a></div>
                </div>
            </div>
            <script>
                function checkStatus() {
                    const mobile = document.getElementById('searchMobile').value;
                    const resultDiv = document.getElementById('statusResult');
                    if(!mobile) { alert('कृपया मोबाइल नंबर लिखें!'); return; }
                    fetch('/check-room-status?mobile=' + mobile).then(res => res.json()).then(data => {
                        if (data.found) {
                            resultDiv.innerHTML = \`
                                <div class="card p-3 bg-light border mt-3 shadow-sm">
                                    <div class="d-flex align-items-center mb-3">
                                        <img src="\${data.photoUrl}" class="rounded border me-3 shadow-sm" style="width:70px; height:70px; object-fit:cover;">
                                        <div>
                                            <h4 class="text-success fw-bold mb-0">🎉 \${data.studentName}</h4>
                                            <p class="text-muted mb-0">\${data.studentClass} (\${data.course})</p>
                                        </div>
                                    </div>
                                    <div class="bg-white p-3 rounded border">
                                        <p class="mb-2"><b>👨 पिता का नाम:</b> \${data.fatherName}</p>
                                        <p class="mb-2"><b>👩 माता का नाम:</b> \${data.motherName}</p>
                                        <p class="mb-0"><b>🏠 अलॉटेड रूम नंबर:</b> <span class="badge bg-warning text-dark fs-6">\${data.roomNumber}</span></p>
                                    </div>
                                </div>\`;
                        } else {
                            resultDiv.innerHTML = \`<div class="alert alert-danger mt-3">❌ इस मोबाइल नंबर से कोई प्रोफाइल या अलॉटमेंट लिस्ट नहीं मिली!</div>\`;
                        }
                    });
                }
            </script>
        </body>
        </html>
    `);
});

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
            res.send("<div style='text-align:center; padding:50px; font-family:sans-serif;'> <h1 style='color:green;'>🎉 प्रोफाइल सफलता पूर्वक बन गई!</h1><p>एडमिन द्वारा रूम अलॉट होने के बाद आप स्टेटस चेक कर सकते हैं।</p><a href='/' style='font-size:18px;'>मुख्य पृष्ठ पर वापस जाएँ</a></div>");
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
                <tr class="align-middle">
                    <td>${index + 1}</td>
                    <td><img src="${student.photoUrl}" class="rounded border" style="width:45px; height:45px; object-fit:cover; margin-right:10px;"><b>${student.studentName}</b></td>
                    <td><b>पिता:</b> ${student.fatherName}<br><b>माता:</b> ${student.motherName}</td>
                    <td>${student.dob}</td>
                    <td>${student.aadharCard ? 'XXXX-XXXX-' + student.aadharCard.slice(-4) : 'N/A'}</td>
                    <td>${student.mobile}</td>
                    <td>${student.studentClass} (${student.course})</td>
                    <td><span class="badge bg-info text-dark">${student.category}</span></td>
                    <td>
                        <div class="d-flex">
                            <input type="text" id="room-${student.id}" class="form-control form-control-sm bg-light border text-dark" value="${student.roomNumber}" style="width:90px; margin-right:5px;">
                            <button onclick="saveRoom('${student.id}')" class="btn btn-sm btn-success">अलॉट</button>
                        </div>
                    </td>
                </tr>`;
        });

        res.send(`
            <!DOCTYPE html>
            <html>
            <head><title>एडमिन पैनल</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"></head>
            <body class="bg-light text-dark p-4">
                <div class="row mb-4">
                    <div class="col-md-4">
                        <div class="bg-white border p-3 rounded shadow-sm h-100">
                            <h4 class="text-primary fw-bold">⚙️ हॉस्टल लोगो बदलें</h4>
                            <form action="/update-logo" method="POST" enctype="multipart/form-data" class="mt-2">
                                <input type="file" name="hostelLogo" class="form-control form-control-sm mb-2" accept="image/*" required>
                                <button type="submit" class="btn btn-sm btn-primary w-100">लोगो अपलोड करें</button>
                            </form>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="bg-white border p-3 rounded shadow-sm h-100">
                            <h4 class="text-danger fw-bold">📢 नया नोटिस जारी करें</h4>
                            <form action="/post-notice" method="POST" class="mt-2">
                                <input type="text" name="noticeText" class="form-control form-control-sm mb-2" placeholder="यहाँ नया नोटिस..." required>
                                <button type="submit" class="btn btn-sm btn-danger w-100">नोटिस लाइव करें</button>
                            </form>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="bg-white border p-3 rounded shadow-sm h-100">
                            <h4 class="text-success fw-bold">⚙️ वार्डन की जानकारी बदलें</h4>
                            <form action="/update-warden" method="POST" enctype="multipart/form-data" class="row g-2 mt-1">
                                <div class="col-6"><input type="text" name="wName" class="form-control form-control-sm" value="${currentWarden.name}" required></div>
                                <div class="col-6"><input type="text" name="wDesig" class="form-control form-control-sm" value="${currentWarden.designation}" required></div>
                                <div class="col-6"><input type="text" name="wMobile" class="form-control form-control-sm" value="${currentWarden.mobile}" required></div>
                                <div class="col-6"><input type="text" name="wOffice" class="form-control form-control-sm" value="${currentWarden.office}" required></div>
                                <div class="col-12"><input type="file" name="wardenPhoto" class="form-control form-control-sm" accept="image/*"></div>
                                <div class="col-12"><button type="submit" class="btn btn-sm btn-success w-100">वार्डन सेव करें</button></div>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="bg-white border p-4 rounded shadow-sm">
                    <h2 class="text-center text-primary fw-bold mb-4">🔒 हॉस्टल एडमिन पैनल - स्टूडेंट लिस्ट</h2>
                    <div class="table-responsive">
                        <table class="table table-bordered table-striped table-hover">
                            <thead class="table-dark"><tr><th>S.No</th><th>छात्र</th><th>माता/पिता</th><th>DOB</th><th>Aadhaar</th><th>मोबाइल</th><th>क्लास/कोर्स</th><th>कैटगरी</th><th>ROOM NO</th></tr></thead>
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
            res.send("<div style='text-align:center; padding:50px; font-family:sans-serif;'><h1>🎉 लोगो सफलतापूर्वक बदल गया!</h1><a href='/view-students'>वापस एडमिन पैनल जाएँ</a></div>");
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
        fs.writeFile(noticesFile, JSON.stringify(noticesList, null, 2), () => res.send("<div style='text-align:center; padding:50px; font-family:sans-serif;'><h1>📢 नोटिस लाइव हो गया है!</h1><a href='/view-students'>वापस जाएँ</a></div>"));
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
        res.send("<div style='text-align:center; padding:50px; font-family:sans-serif;'><h1>👨‍💼 वार्डन अपडेट हो गए!</h1><a href='/view-students'>वापस जाएँ</a></div>");
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('🚀 सर्वर चालू है!'));
