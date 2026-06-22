const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();

// 🛑 Cloudinary Config
cloudinary.config({
    cloud_name: 'dhg4qy5rw', 
    api_key: '492175456555184', 
    api_secret: 'nPJYcf47rjH56k2cNQtIi6etBLA' 
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'hostel_photos',
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf']
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
    w1Name: "Unknown Warden A", w1Desig: "छात्रावास अधीक्षक (A)", w1Mobile: "+91 XXXXX XXXXX", w1Office: "कार्यालय कक्ष 01", w1Photo: "https://via.placeholder.com/150",
    w2Name: "Unknown Warden B", w2Desig: "छात्रावास अधीक्षक (B)", w2Mobile: "+91 XXXXX XXXXX", w2Office: "कार्यालय कक्ष 02", w2Photo: "https://via.placeholder.com/150"
};
const defaultLogo = { url: "https://via.placeholder.com/800x250?text=HOSTEL+BANNER+LOGO" };

if (!fs.existsSync(studentsFile)) fs.writeFileSync(studentsFile, '[]', 'utf8');
if (!fs.existsSync(noticesFile)) fs.writeFileSync(noticesFile, '[]', 'utf8');
if (!fs.existsSync(wardenFile)) fs.writeFileSync(wardenFile, JSON.stringify(defaultWarden, null, 2), 'utf8');
if (!fs.existsSync(logoFile)) fs.writeFileSync(logoFile, JSON.stringify(defaultLogo, null, 2), 'utf8');

const readWardenSafe = () => {
    try {
        if (fs.existsSync(wardenFile)) {
            const data = fs.readFileSync(wardenFile, 'utf8');
            return data ? JSON.parse(data) : defaultWarden;
        }
    } catch (e) {}
    return defaultWarden;
};

// 🏠 मुख्य पृष्ठ
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="hi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>प्री मैट्रिक ST+SC बालक छात्रावास सूरजपुर</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { background-color: #f8f9fa; color: #212529; font-family: 'Segoe UI', sans-serif; }
                .card { background-color: #ffffff; border: 1px solid #dee2e6; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                .logo-container { width: 100%; border-radius: 8px; overflow: hidden; margin-bottom: 15px; text-align: center; }
                .logo-img { width: 100%; height: auto; max-height: 280px; display: block; margin: 0 auto; }
                .nav-btn-box { transition: all 0.3s ease; border: 2px dashed #0d6efd; text-decoration: none; display: block; }
                .nav-btn-box:hover { transform: translateY(-3px); background-color: #f1f7ff; }
                .nav-btn-box-2 { transition: all 0.3s ease; border: 2px dashed #198754; text-decoration: none; display: block; }
                .nav-btn-box-2:hover { transform: translateY(-3px); background-color: #f1fdf7; }
            </style>
        </head>
        <body>
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow-sm">
            <div class="container">
                <a class="navbar-brand fw-bold text-warning" href="/">🏠 प्री मैट्रिक ST+SC बालक छात्रावास सूरजपुर (छ. ग.)</a>
                <div class="navbar-nav ms-auto"><a class="nav-link btn btn-outline-warning text-white px-3" href="/view-students" target="_blank">🔒 एडमिन पैनल</a></div>
            </div>
        </nav>
        <div class="container">
            <div class="row g-4">
                <div class="col-md-8">
                    <div class="logo-container border shadow-sm"><img id="hostel-logo" src="" alt="Hostel Logo" class="logo-img"></div>
                    <div class="card p-3 mb-4 shadow-sm">
                        <div class="card-header bg-danger text-white fw-bold rounded mb-2">📢 महत्वपूर्ण नोटिस बोर्ड</div>
                        <ul id="live-notices" class="list-group list-group-flush"></ul>
                    </div>
                    <hr class="my-4">
                    <div class="row g-3 mb-5">
                        <div class="col-md-6">
                            <a href="/registration-form" class="nav-btn-box text-dark">
                                <div class="card p-4 text-center h-100">
                                    <span style="font-size: 40px;">📝</span>
                                    <h4 class="fw-bold text-primary mt-2">हॉस्टल रजिस्ट्रेशन फॉर्म</h4>
                                    <span class="badge bg-primary px-3 py-2 mt-2 fs-6">सत्र 2026-27</span>
                                    <p class="text-muted small mt-2 mb-0">नया एडमिशन फॉर्म भरने के लिए यहाँ क्लिक करें</p>
                                </div>
                            </a>
                        </div>
                        <div class="col-md-6">
                            <a href="/check-status-page" class="nav-btn-box-2 text-dark">
                                <div class="card p-4 text-center h-100">
                                    <span style="font-size: 40px;">🔍</span>
                                    <h4 class="fw-bold text-success mt-2">प्रोफाइल / रूम अलॉटमेंट स्टेटस</h4>
                                    <span class="badge bg-success px-3 py-2 mt-2 fs-6">एडमिन द्वारा जारी रिजल्ट</span>
                                    <p class="text-muted small mt-2 mb-0">अपना अलॉटेड रूम और स्टेटस देखने के लिए यहाँ क्लिक करें</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card border-top border-danger border-3 p-3 shadow-sm text-center mb-4">
                        <div class="card-header bg-light text-danger fw-bold rounded mb-3 border-0 fs-5">👨‍💼 हॉस्टल वॉर्डन कॉर्नर</div>
                        <div class="row">
                            <div class="col-6 border-end">
                                <img id="w1-img" src="" class="rounded border mb-2 shadow-sm" style="width: 90px; height: 90px; object-fit: cover;">
                                <h6 id="w1-name" class="fw-bold text-dark mb-0"></h6>
                                <small id="w1-desig" class="text-muted block"></small>
                                <div class="text-start bg-light p-2 rounded border mt-2" style="font-size:11px;">
                                    <b>📞:</b> <span id="w1-phone"></span><br><b>🏢:</b> <span id="w1-office"></span>
                                </div>
                            </div>
                            <div class="col-6">
                                <img id="w2-img" src="" class="rounded border mb-2 shadow-sm" style="width: 90px; height: 90px; object-fit: cover;">
                                <h6 id="w2-name" class="fw-bold text-dark mb-0"></h6>
                                <small id="w2-desig" class="text-muted block"></small>
                                <div class="text-start bg-light p-2 rounded border mt-2" style="font-size:11px;">
                                    <b>📞:</b> <span id="w2-phone"></span><br><b>🏢:</b> <span id="w2-office"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card border-top border-success border-3 p-3 shadow-sm">
                        <div class="card-header bg-light text-success fw-bold rounded mb-2 border-0 fs-6 text-center">📋 छात्रावास प्रवेश चयन सूची (Admission List)</div>
                        <p class="text-muted small text-center mb-2">केवल चयनित छात्रों के नाम और कक्षा की सूची (सुरक्षित डेटा)</p>
                        <a href="/public-admission-list" target="_blank" class="btn btn-sm btn-success w-100 fw-bold">चयनित छात्रों की सूची देखें ➔</a>
                    </div>
                </div>
            </div>
        </div>
        <script>
            window.onload = function() {
                fetch('/get-logo').then(res => res.json()).then(logo => { document.getElementById('hostel-logo').src = logo.url; });
                fetch('/get-notices').then(res => res.json()).then(notices => {
                    const list = document.getElementById('live-notices');
                    list.innerHTML = notices.length === 0 ? "<li class='text-muted text-center p-3'>कोई नया नोटिस नहीं है।</li>" : "";
                    notices.forEach(n => { list.innerHTML += \`<li class='list-group-item bg-white text-dark border-bottom mb-1 p-2'><b class='text-danger'>[\${n.date}]:</b> \${n.text}</li>\`; });
                });
                fetch('/get-warden').then(res => res.json()).then(w => {
                    document.getElementById('w1-img').src = w.w1Photo; document.getElementById('w1-name').innerText = w.w1Name;
                    document.getElementById('w1-desig').innerText = w.w1Desig; document.getElementById('w1-phone').innerText = w.w1Mobile; document.getElementById('w1-office').innerText = w.w1Office;
                    document.getElementById('w2-img').src = w.w2Photo; document.getElementById('w2-name').innerText = w.w2Name;
                    document.getElementById('w2-desig').innerText = w.w2Desig; document.getElementById('w2-phone').innerText = w.w2Mobile; document.getElementById('w2-office').innerText = w.w2Office;
                });
            };
        </script>
        </body>
        </html>
    `);
});
// 📝 लिंक 1: रजिस्ट्रेशन फॉर्म पेज (सारे प्रमाण पत्रों की फोटो अपलोड व्यवस्था)
app.get('/registration-form', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="hi">
        <head>
            <meta charset="UTF-8">
            <title>प्रवेश हेतु आवेदन पत्र 2026-27</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>body{ background-color: #f8f9fa; } .section-title { background-color: #e9ecef; padding: 6px 12px; font-weight: bold; border-left: 4px solid #0d6efd; margin-top: 15px; margin-bottom: 15px; color: #333; }</style>
        </head>
        <body class="p-4">
            <div class="container" style="max-width: 950px;">
                <div class="card p-4 shadow-sm bg-white border-0">
                    <div class="text-center mb-3">
                        <h5 class="text-muted mb-1">आदिम जाति तथा अनुसूचित जाति विकास विभाग, छत्तीसगढ़ शासन</h5>
                        <h3 class="text-primary fw-bold">छात्रावास में प्रवेश हेतु आवेदन पत्र (नवीन)</h3>
                        <h6 class="fw-bold">वर्ष 2026-27</h6>
                    </div>
                    <form action="/submit-form" method="POST" enctype="multipart/form-data" class="row g-3">
                        <div class="section-title">1. व्यक्तिगत जानकारी एवं फोटो</div>
                        <div class="col-md-4"><label class="form-label fw-bold">विद्यार्थी का नाम (आधार के अनुसार):</label><input type="text" name="studentName" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">जन्मतिथि (DOB):</label><input type="date" name="dob" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">विद्यार्थी का आधार नंबर:</label><input type="text" name="aadharCard" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">विद्यार्थी का वर्ग:</label><select name="category" class="form-select" required><option value="अनुसूचित जनजाति (ST)">अनुसूचित जनजाति (ST)</option><option value="अनुसूचित जाति (SC)">अनुसूचित जाति (SC)</option><option value="अन्य पिछड़ा वर्ग (OBC)">अन्य पिछड़ा वर्ग (OBC)</option><option value="सामान्य (General)">सामान्य (General)</option></select></div>
                        <div class="col-md-4"><label class="form-label fw-bold">विद्यार्थी की जाति:</label><input type="text" name="subCast" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">पालक का मोबाइल नंबर:</label><input type="tel" name="mobile" class="form-control" required></div>
                        <div class="col-12"><label class="form-label fw-bold text-danger">📸 छात्र की फोटो अपलोड करें (अनिवार्य):</label><input type="file" name="studentPhoto" class="form-control" accept="image/*" required></div>
                        
                        <div class="section-title">2. पारिवारिक विवरण एवं पालक आधार (अपलोड ऐच्छिक / Optional)</div>
                        <div class="col-md-6"><label class="form-label fw-bold">पिता का नाम:</label><input type="text" name="fatherName" class="form-control" required></div>
                        <div class="col-md-6"><label class="form-label fw-bold text-muted">पिता का आधार कार्ड फ़ोटो (Optional):</label><input type="file" name="fatherAadharFile" class="form-control" accept="image/*,application/pdf"></div>
                        <div class="col-md-6"><label class="form-label fw-bold">माता का नाम:</label><input type="text" name="motherName" class="form-control" required></div>
                        <div class="col-md-6"><label class="form-label fw-bold text-muted">माता का आधार कार्ड फ़ोटो (Optional):</label><input type="file" name="motherAadharFile" class="form-control" accept="image/*,application/pdf"></div>
                        <div class="col-md-4"><label class="form-label fw-bold">पिता का व्यवसाय:</label><input type="text" name="fatherJob" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">माता का व्यवसाय:</label><input type="text" name="motherJob" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">पालक की वार्षिक आय (₹):</label><input type="number" name="annualIncome" class="form-control" required></div>

                        <div class="section-title">3. सरकारी प्रमाण पत्र एवं कार्ड फ़ोटो अपलोड (अनिवार्य एवं ऐच्छिक)</div>
                        <div class="col-md-6"><label class="form-label fw-bold">जाति प्रमाण पत्र अपलोड (अनिवार्य):</label><input type="file" name="casteCertFile" class="form-control" accept="image/*,application/pdf" required></div>
                        <div class="col-md-6"><label class="form-label fw-bold">निवास प्रमाण पत्र अपलोड (अनिवार्य):</label><input type="file" name="residenceCertFile" class="form-control" accept="image/*,application/pdf" required></div>
                        <div class="col-md-6"><label class="form-label fw-bold text-muted">आय प्रमाण पत्र अपलोड (Optional):</label><input type="file" name="incomeCertFile" class="form-control" accept="image/*,application/pdf"></div>
                        <div class="col-md-6"><label class="form-label fw-bold text-muted">दूरी प्रमाण पत्र अपलोड (Optional):</label><input type="file" name="distanceCertFile" class="form-control" accept="image/*,application/pdf"></div>
                        <div class="col-md-6"><label class="form-label fw-bold text-muted">आयुष्मान कार्ड अपलोड (Optional):</label><input type="file" name="ayushmanFile" class="form-control" accept="image/*,application/pdf"></div>
                        <div class="col-md-6"><label class="form-label fw-bold">राशन कार्ड फ़ोटो अपलोड (अनिवार्य):</label><input type="file" name="rationCardFile" class="form-control" accept="image/*,application/pdf" required></div>

                        <div class="section-title">4. स्टेटस, पता एवं विद्यालय विवरण</div>
                        <div class="col-md-3"><label class="form-label fw-bold">नक्सल प्रभावित:</label><select name="naxalStatus" class="form-select"><option value="नहीं">नहीं</option><option value="हाँ">हाँ</option></select></div>
                        <div class="col-md-3"><label class="form-label fw-bold">दिव्यांग (PH):</label><select name="phStatus" class="form-select"><option value="नहीं">नहीं</option><option value="हाँ">हाँ</option></select></div>
                        <div class="col-md-3"><label class="form-label fw-bold">बीपीएल (BPL):</label><select name="bplStatus" class="form-select"><option value="नहीं">नहीं</option><option value="हाँ">हाँ</option></select></div>
                        <div class="col-md-3"><label class="form-label fw-bold">पीवीटीजी (PVTG):</label><select name="pvtgStatus" class="form-select"><option value="नहीं">नहीं</option><option value="हाँ">हाँ</option></select></div>
                        
                        <div class="col-md-6"><label class="form-label fw-bold">स्थायी पता:</label><input type="text" name="permanentAddress" class="form-control" required></div>
                        <div class="col-md-3"><label class="form-label fw-bold">विकासखंड:</label><input type="text" name="blockName" class="form-control" required></div>
                        <div class="col-md-3"><label class="form-label fw-bold">जिला:</label><input type="text" name="districtName" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">घर से शाला की दूरी (कि.मी.):</label><input type="number" name="homeDistance" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">वर्तमान कक्षा/वर्ष:</label><input type="text" name="studentClass" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">कोर्स / ब्रांच:</label><input type="text" name="course" class="form-control" required></div>
                        <div class="col-md-8"><label class="form-label fw-bold">शाला का नाम:</label><input type="text" name="collegeName" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">पिछला परीक्षा प्रतिशत (%):</label><input type="text" name="prevPercent" class="form-control" required></div>
                        
                        <div class="col-12 mt-4"><button type="submit" class="btn btn-primary w-100 fw-bold fs-5">🚀 ऑनलाइन आवेदन पत्र जमा करें</button></div>
                    </form>
                    <div class="text-center mt-3"><a href="/" class="btn btn-link">🏠 मुख्य पृष्ठ पर वापस जाएँ</a></div>
                </div>
            </div>
        </body>
        </html>
    `);
});
// 🔍 लिंक 2: स्टेटस चेक करने वाला पेज
app.get('/check-status-page', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="hi">
        <head><title>अलॉटमेंट रिजल्ट स्टेटस</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"></head>
        <body class="p-5 bg-light">
            <div class="container" style="max-width: 650px;">
                <div class="card p-4 shadow-sm bg-white border border-success mb-4">
                    <h3 class="text-center text-success fw-bold mb-4">🔍 छात्रावास अलॉटमेंट रिजल्ट / स्टेटस</h3>
                    <div class="input-group mb-3">
                        <input type="tel" id="searchMobile" class="form-control" placeholder="रजिस्टर्ड मोबाइल नंबर दर्ज करें...">
                        <button onclick="checkStatus()" class="btn btn-success fw-bold">रिजल्ट देखें</button>
                    </div>
                    <div id="statusResult"></div>
                </div>
                <div class="card p-4 shadow-sm bg-white border border-warning">
                    <h4 class="text-center text-warning fw-bold mb-3">⚠️ आवेदन पत्र में त्रुटि सुधार (Edit Form)</h4>
                    <div class="input-group">
                        <input type="tel" id="editMobile" class="form-control" placeholder="अपना रजिस्टर्ड मोबाइल नंबर डालें...">
                        <button onclick="openEditForm()" class="btn btn-warning fw-bold">त्रुटि सुधार खोलें</button>
                    </div>
                </div>
                <div class="text-center mt-4"><a href="/" class="btn btn-link">🏠 मुख्य पृष्ठ पर वापस जाएँ</a></div>
            </div>
            <script>
                function checkStatus() {
                    const mobile = document.getElementById('searchMobile').value;
                    const resultDiv = document.getElementById('statusResult');
                    if(!mobile) { alert('कृपया मोबाइल नंबर लिखें!'); return; }
                    fetch('/check-room-status?mobile=' + mobile).then(res => res.json()).then(data => {
                        if (data.found) {
                            let isAllocated = data.roomNumber && data.roomNumber !== "अभी अलॉट नहीं हुआ (वेटिंग)";
                            let statusBadge = isAllocated ? \`<span class="badge bg-success fs-6 ms-2">✅ Admission Confirmed</span>\` : \`<span class="badge bg-secondary fs-6 ms-2">⏳ Waiting List</span>\`;
                            resultDiv.innerHTML = \`
                                <div class="card p-3 bg-light border mt-3 shadow-sm">
                                    <h4 class="text-success fw-bold mb-2">🎉 \${data.studentName}</h4>
                                    <p class="mb-1"><b>👨 पिता का नाम:</b> \${data.fatherName}</p>
                                    <p class="mb-1"><b>वर्ग (Category):</b> \${data.category}</p>
                                    <p class="mb-0"><b>🏢 अलॉटेड रूम नंबर:</b> <span class="badge bg-warning text-dark fs-6">\${data.roomNumber}</span> \${statusBadge}</p>
                                </div>\`;
                        } else { resultDiv.innerHTML = \`<div class="alert alert-danger mt-3">❌ कोई प्रोफाइल नहीं मिली!</div>\`; }
                    });
                }
                function openEditForm() {
                    const mobile = document.getElementById('editMobile').value;
                    if(!mobile) { alert('मोबाइल नंबर लिखें!'); return; }
                    window.location.href = '/edit-student-form?mobile=' + mobile;
                }
            </script>
        </body>
        </html>
    `);
});

// 📋 पब्लिक एडमिशन लिस्ट 
app.get('/public-admission-list', (req, res) => {
    fs.readFile(studentsFile, 'utf8', (err, data) => {
        let studentsList = [];
        if (!err && data) { try { studentsList = JSON.parse(data); } catch(e){} }
        let confirmedStudents = studentsList.filter(s => s.roomNumber && s.roomNumber !== "अभी अलॉट नहीं हुआ (वेटिंग)");
        let tableRows = '';
        confirmedStudents.forEach((student, index) => {
            tableRows += `<tr><td>${index + 1}</td><td><b>${student.studentName}</b></td><td>${student.fatherName}</td><td>${student.studentClass}</td><td><span class="badge bg-success">कन्फर्म</span></td><td><b>${student.roomNumber}</b></td></tr>`;
        });
        res.send(`
            <!DOCTYPE html>
            <html>
            <head><title>प्रवेश चयन सूची 2026-27</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"></head>
            <body class="p-5 bg-light text-dark">
                <div class="container" style="max-width: 850px;">
                    <div class="card p-4 shadow-sm bg-white">
                        <h3 class="text-center text-primary fw-bold mb-1">प्री मैट्रिक ST+SC बालक छात्रावास सूरजपुर</h3>
                        <h5 class="text-center text-success mb-4">📋 छात्रावास प्रवेश चयन सूची (सत्र 2026-27)</h5>
                        <table class="table table-bordered table-striped text-center">
                            <thead class="table-dark"><tr><th>S.No</th><th>छात्र का नाम</th><th>पिता का नाम</th><th>कक्षा</th><th>प्रवेश स्टेटस</th><th>अलॉटेड रूम नंबर</th></tr></thead>
                            <tbody>${tableRows || '<tr><td colspan="6" class="text-center text-muted">अभी कोई चयन सूची जारी नहीं हुई है।</td></tr>'}</tbody>
                        </table>
                        <div class="text-center mt-3"><a href="/" class="btn btn-link">🏠 मुख्य पृष्ठ पर वापस जाएँ</a></div>
                    </div>
                </div>
            </body>
            </html>
        `);
    });
});
// 🛠️ मल्टी-फ़ाइल अपलोड कॉन्फ़िगरेशन
const cpUpload = upload.fields([
    { name: 'studentPhoto', maxCount: 1 }, { name: 'casteCertFile', maxCount: 1 },
    { name: 'residenceCertFile', maxCount: 1 }, { name: 'rationCardFile', maxCount: 1 },
    { name: 'w1PhotoFile', maxCount: 1 }, { name: 'w2PhotoFile', maxCount: 1 }
]);

app.post('/submit-form', cpUpload, (req, res) => {
    const files = req.files || {};
    const photoPath = files.studentPhoto ? files.studentPhoto[0].path : "https://via.placeholder.com/150";
    
    const studentData = {
        id: req.body.mobile.trim(), studentName: req.body.studentName, aadharCard: req.body.aadharCard,
        mobile: req.body.mobile.trim(), fatherName: req.body.fatherName, motherName: req.body.motherName,
        annualIncome: req.body.annualIncome || 0, category: req.body.category, subCast: req.body.subCast,
        permanentAddress: req.body.permanentAddress, blockName: req.body.blockName, districtName: req.body.districtName,
        homeDistance: req.body.homeDistance, studentClass: req.body.studentClass, course: req.body.course,
        collegeName: req.body.collegeName, prevPercent: req.body.prevPercent, photoUrl: photoPath,
        roomNumber: "अभी अलॉट नहीं हुआ (वेटिंग)", date: new Date().toLocaleString()
    };
    fs.readFile(studentsFile, 'utf8', (err, data) => {
        let studentsList = [];
        if (!err && data) { try { studentsList = JSON.parse(data); } catch(e) {} }
        const oldData = studentsList.find(s => s.mobile === studentData.mobile);
        if (oldData) { studentData.roomNumber = oldData.roomNumber; }
        studentsList = studentsList.filter(s => s.mobile !== studentData.mobile);
        studentsList.push(studentData);
        fs.writeFile(studentsFile, JSON.stringify(studentsList, null, 2), () => {
            res.send("<div style='text-align:center; padding:50px;'><h1>🎉 रिकॉर्ड सफलतापूर्वक सुरक्षित कर लिया गया है!</h1><a href='/'>मुख्य पृष्ठ पर वापस जाएँ</a></div>");
        });
    });
});

app.get('/view-students', (req, res) => {
    const auth = { login: 'admin', password: 'password123' };
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');
    if (!login || !password || login !== auth.login || password !== auth.password) {
        res.set('WWW-Authenticate', 'Basic realm="401"'); return res.status(401).send('❌ गलत पासवर्ड!');
    }
    let currentWarden = readWardenSafe();
    fs.readFile(studentsFile, 'utf8', (err, data) => {
        let studentsList = [];
        if (!err && data) { try { studentsList = JSON.parse(data); } catch(e) {} }
        let tableRows = '';
        studentsList.forEach((student, index) => {
            tableRows += `
                <tr class="align-middle" style="font-size:12px;">
                    <td>${index + 1}</td>
                    <td><img src="${student.photoUrl}" class="rounded border" style="width:40px; height:40px; object-fit:cover; margin-right:5px;"><b>${student.studentName}</b></td>
                    <td><b>पिता:</b> ${student.fatherName}<br><b>माता:</b> ${student.motherName}</td>
                    <td>${student.mobile}</td>
                    <td>${student.permanentAddress}<br><small class="text-danger">दूरी: ${student.homeDistance}KM</small></td>
                    <td><b>कक्षा:</b> ${student.studentClass}</td>
                    <td>${student.prevPercent}%</td>
                    <td>
                        <div class="d-flex">
                            <input type="text" id="room-${student.id}" class="form-control form-control-sm" value="${student.roomNumber}" style="width:75px; margin-right:5px;">
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
                        <div class="bg-white border p-3 rounded h-100 shadow-sm">
                            <h4>⚙️ लोगो/बैनर बदलें</h4>
                            <form action="/update-logo" method="POST" enctype="multipart/form-data"><input type="file" name="hostelLogo" class="form-control form-control-sm mb-2" accept="image/*" required><button type="submit" class="btn btn-sm btn-primary w-100">अपलोड करें</button></form>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="bg-white border p-3 rounded h-100 shadow-sm">
                            <h4>📢 नया नोटिस जारी करें</h4>
                            <form action="/post-notice" method="POST"><input type="text" name="noticeText" class="form-control form-control-sm mb-2" required><button type="submit" class="btn btn-sm btn-danger w-100">लाइव करें</button></form>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="bg-white border p-3 rounded h-100 shadow-sm">
                            <h4 class="text-success">⚙️ दोनों वॉर्डन की जानकारी एवं फ़ोटो बदलें</h4>
                            <form action="/update-warden" method="POST" enctype="multipart/form-data" class="row g-2">
                                <div class="col-6"><input type="text" name="w1Name" class="form-control form-control-sm" value="${currentWarden.w1Name}" placeholder="वॉर्डन A नाम"></div>
                                <div class="col-6"><input type="text" name="w2Name" class="form-control form-control-sm" value="${currentWarden.w2Name}" placeholder="वॉर्डन B नाम"></div>
                                <div class="col-6"><input type="text" name="w1Mobile" class="form-control form-control-sm" value="${currentWarden.w1Mobile}" placeholder="मोबाइल"></div>
                                <div class="col-6"><input type="text" name="w2Mobile" class="form-control form-control-sm" value="${currentWarden.w2Mobile}" placeholder="मोबाइल"></div>
                                <div class="col-6"><small class="text-muted">वॉर्डन A फ़ोटो:</small><input type="file" name="w1PhotoFile" class="form-control form-control-sm" accept="image/*"></div>
                                <div class="col-6"><small class="text-muted">वॉर्डन B फ़ोटो:</small><input type="file" name="w2PhotoFile" class="form-control form-control-sm" accept="image/*"></div>
                                <div class="col-12"><button type="submit" class="btn btn-sm btn-success w-100 mt-2">दोनों वॉर्डन सेव करें</button></div>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="bg-white border p-4 rounded shadow-sm">
                    <h2 class="text-center text-primary mb-4">🔒 हॉस्टल एडमिन पैनल</h2>
                    <table class="table table-bordered table-striped">
                        <thead class="table-dark"><tr><th>S.No</th><th>छात्र</th><th>माता/पिता</th><th>मोबाइल</th><th>स्थायी पता</th><th>संस्थान</th><th>Result</th><th>कार्रवाई</th></tr></thead>
                        <tbody>${tableRows || '<tr><td colspan="8">कोई छात्र पंजीकृत नहीं है।</td></tr>'}</tbody>
                    </table>
                </div>
                <script>function saveRoom(id){const val=document.getElementById('room-'+id).value;fetch('/assign-room',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({studentId:id,roomNumber:val})}).then(res=>res.json()).then(d=>{if(d.success){alert('🎉 अलॉट हो गया!');location.reload();}})}</script>
            </body>
            </html>
        `);
    });
});

app.post('/update-logo', upload.single('hostelLogo'), (req, res) => {
    if (req.file) { fs.writeFile(logoFile, JSON.stringify({ url: req.file.path }, null, 2), () => { res.send("<h1>🎉 लोगो बदल गया!</h1><a href='/view-students'>वापस जाएँ</a>"); }); } else { res.redirect('/view-students'); }
});

app.post('/assign-room', (req, res) => {
    const { studentId, roomNumber } = req.body;
    fs.readFile(studentsFile, 'utf8', (err, data) => {
        let studentsList = []; try { studentsList = JSON.parse(data); } catch(e) {}
        studentsList = studentsList.map(s => { if (s.id === studentId) s.roomNumber = roomNumber; return s; });
        fs.writeFile(studentsFile, JSON.stringify(studentsList, null, 2), () => res.json({ success: true }));
    });
});

app.post('/post-notice', (req, res) => {
    const newNotice = { text: req.body.noticeText, date: new Date().toLocaleDateString() };
    fs.readFile(noticesFile, 'utf8', (err, data) => {
        let noticesList = []; if (!err && data) { try { noticesList = JSON.parse(data); } catch(e){} }
        noticesList.unshift(newNotice); fs.writeFile(noticesFile, JSON.stringify(noticesList, null, 2), () => res.send("<h1>📢 नोटिस लाइव हो गया!</h1><a href='/view-students'>वापस जाएँ</a>"));
    });
});

app.post('/update-warden', cpUpload, (req, res) => {
    const files = req.files || {};
    let currentWarden = readWardenSafe();
    
    const w1PhotoPath = files.w1PhotoFile ? files.w1PhotoFile[0].path : currentWarden.w1Photo;
    const w2PhotoPath = files.w2PhotoFile ? files.w2PhotoFile[0].path : currentWarden.w2Photo;

    const updatedWarden = {
        w1Name: req.body.w1Name || currentWarden.w1Name, w1Desig: "छात्रावास अधीक्षक (A)", w1Mobile: req.body.w1Mobile || currentWarden.w1Mobile, w1Office: "कार्यालय कक्ष 01", w1Photo: w1PhotoPath,
        w2Name: req.body.w2Name || currentWarden.w2Name, w2Desig: "छात्रावास अधीक्षक (B)", w2Mobile: req.body.w2Mobile || currentWarden.w2Mobile, w2Office: "कार्यालय कक्ष 02", w2Photo: w2PhotoPath
    };
    fs.writeFile(wardenFile, JSON.stringify(updatedWarden, null, 2), () => { res.send("<h1>🎉 दोनों वॉर्डन की जानकारी एवं फ़ोटो अपडेट हो गए!</h1><a href='/view-students'>वापस जाएँ</a>"); });
});

app.get('/get-warden', (req, res) => { res.json(readWardenSafe()); });
app.get('/get-logo', (req, res) => { fs.readFile(logoFile, 'utf8', (err, data) => { res.json(err || !data ? defaultLogo : JSON.parse(data)); }); });
app.get('/get-notices', (req, res) => { fs.readFile(noticesFile, 'utf8', (err, data) => { res.json(err || !data ? [] : JSON.parse(data)); }); });
app.get('/check-room-status', (req, res) => {
    const mobileQuery = req.query.mobile ? req.query.mobile.trim() : "";
    fs.readFile(studentsFile, 'utf8', (err, data) => {
        if (err || !data) return res.json({ found: false });
        try {
            const student = JSON.parse(data).find(s => s.mobile === mobileQuery);
            res.json(student ? { found: true, ...student } : { found: false });
        } catch(e) { res.json({ found: false }); }
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('🚀 सर्वर चालू है!'));
