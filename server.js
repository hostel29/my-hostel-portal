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

// 🏠 मुख्य पृष्ठ (Updated Template with White Background & New Name)
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
                .logo-container { width: 100%; border-radius: 8px; overflow: hidden; margin-bottom: 15px; background: #fff; }
                .logo-img { width: 100%; height: auto; max-height: 250px; object-fit: cover; display: block; }
                .nav-btn-box { transition: all 0.3s ease; border: 2px dashed #0d6efd; text-decoration: none; display: block; }
                .nav-btn-box:hover { transform: translateY(-3px); box-shadow: 0 6px 12px rgba(0,0,0,0.1); background-color: #f1f7ff; }
                .nav-btn-box-2 { transition: all 0.3s ease; border: 2px dashed #198754; text-decoration: none; display: block; }
                .nav-btn-box-2:hover { transform: translateY(-3px); box-shadow: 0 6px 12px rgba(0,0,0,0.1); background-color: #f1fdf7; }
            </style>
        </head>
        <body>
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow-sm">
            <div class="container">
                <a class="navbar-brand fw-bold text-warning" href="/">🏠 प्री मैट्रिक ST+SC बालक छात्रावास सूरजपुर जिला सूरजपुर (छ. ग.)</a>
                <div class="navbar-nav ms-auto">
                    <a class="nav-link btn btn-outline-warning text-white px-3" href="/view-students" target="_blank">🔒 एडमिन पैनल</a>
                </div>
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
                    <div class="card border-top border-danger border-3 p-3 shadow-sm text-center position-sticky" style="top: 20px;">
                        <div class="card-header bg-light text-danger fw-bold rounded mb-3 border-0 fs-5">👨‍💼 हॉस्टल वार्डन कॉर्नर</div>
                        <img id="warden-img" src="" class="rounded-circle border mx-auto mb-3 shadow-sm" style="width: 130px; height: 130px; object-fit: cover;">
                        <h4 id="warden-name" class="fw-bold text-dark mb-1"></h4>
                        <p id="warden-desig" class="text-muted small mb-3"></p>
                        <div class="text-start bg-light p-3 rounded border text-secondary">
                            <p class="mb-2"><b>📞 मोबाइल:</b> <span id="warden-phone" class="text-dark"></span></p>
                            <p class="mb-0"><b>🏢 ऑफिस:</b> <span id="warden-office" class="text-dark"></span></p>
                        </div>
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
                    document.getElementById('warden-img').src = w.photoUrl;
                    document.getElementById('warden-name').innerText = w.name;
                    document.getElementById('warden-desig').innerText = w.designation;
                    document.getElementById('warden-phone').innerText = w.mobile;
                    document.getElementById('warden-office').innerText = w.office;
                });
            };
        </script>
        </body>
        </html>
    `);
});

// 📝 लिंक 1: रजिस्ट्रेशन फॉर्म पेज
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
            <div class="container" style="max-width: 900px;">
                <div class="card p-4 shadow-sm bg-white border-0">
                    <div class="text-center mb-3">
                        <h5 class="text-muted mb-1">आदिम जाति तथा अनुसूचित जाति विकास विभाग, छत्तीसगढ़ शासन</h5>
                        <h3 class="text-primary fw-bold">छात्रावास में प्रवेश हेतु आवेदन पत्र (नवीन)</h3>
                        <h6 class="fw-bold">वर्ष 2026-27</h6>
                    </div>
                    <form action="/submit-form" method="POST" enctype="multipart/form-data" class="row g-3">
                        <div class="section-title">1. व्यक्तिगत जानकारी</div>
                        <div class="col-md-6"><label class="form-label fw-bold">विद्यार्थी का आधार नंबर:</label><input type="text" name="aadharCard" class="form-control" required></div>
                        <div class="col-md-6"><label class="form-label fw-bold">विद्यार्थी का पूरा नाम (आधार के अनुसार):</label><input type="text" name="studentName" class="form-control" required></div>
                        <div class="col-md-6"><label class="form-label fw-bold">जन्मतिथि (Date of Birth):</label><input type="date" name="dob" class="form-control" required></div>
                        <div class="col-md-6"><label class="form-label fw-bold">विद्यार्थी का वर्ग:</label><select name="category" class="form-select" required><option value="अनुसूचित जनजाति (ST)">अनुसूचित जनजाति (ST)</option><option value="अनुसूचित जाति (SC)">अनुसूचित जाति (SC)</option><option value="अन्य पिछड़ा वर्ग (OBC)">अन्य पिछड़ा वर्ग (OBC)</option><option value="सामान्य (General)">सामान्य (General)</option></select></div>
                        <div class="col-md-6"><label class="form-label fw-bold">विद्यार्थी की जाति:</label><input type="text" name="subCast" class="form-control" required></div>
                        <div class="col-md-6"><label class="form-label fw-bold">पालक का मोबाइल नंबर:</label><input type="tel" name="mobile" class="form-control" required></div>
                        
                        <div class="section-title">2. पारिवारिक एवं आय की जानकारी</div>
                        <div class="col-md-6"><label class="form-label fw-bold">विद्यार्थी के पिता का नाम:</label><input type="text" name="fatherName" class="form-control" required></div>
                        <div class="col-md-6"><label class="form-label fw-bold">विद्यार्थी की माता का नाम:</label><input type="text" name="motherName" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">पिता का व्यवसाय:</label><input type="text" name="fatherJob" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">माता का व्यवसाय:</label><input type="text" name="motherJob" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">पालक की वार्षिक आय (₹):</label><input type="number" name="annualIncome" class="form-control" required></div>

                        <div class="section-title">3. विद्यार्थी का स्टेटस</div>
                        <div class="col-md-3"><label class="form-label fw-bold">नक्सल प्रभावित:</label><select name="naxalStatus" class="form-select"><option value="नहीं">नहीं</option><option value="हाँ">हाँ</option></select></div>
                        <div class="col-md-3"><label class="form-label fw-bold">दिव्यांग (PH):</label><select name="phStatus" class="form-select"><option value="नहीं">नहीं</option><option value="हाँ">हाँ</option></select></div>
                        <div class="col-md-3"><label class="form-label fw-bold">बीपीएल (BPL):</label><select name="bplStatus" class="form-select"><option value="नहीं">नहीं</option><option value="हाँ">हाँ</option></select></div>
                        <div class="col-md-3"><label class="form-label fw-bold">पीवीटीजी (PVTG):</label><select name="pvtgStatus" class="form-select"><option value="नहीं">नहीं</option><option value="हाँ">हाँ</option></select></div>

                        <div class="section-title">4. स्थायी पता एवं विद्यालय से दूरी</div>
                        <div class="col-md-6"><label class="form-label fw-bold">विद्यार्थी का स्थायी पता:</label><input type="text" name="permanentAddress" class="form-control" required></div>
                        <div class="col-md-3"><label class="form-label fw-bold">विकासखंड:</label><input type="text" name="blockName" class="form-control" required></div>
                        <div class="col-md-3"><label class="form-label fw-bold">जिला:</label><input type="text" name="districtName" class="form-control" required></div>
                        <div class="col-md-12"><label class="form-label fw-bold">घर से शाला की दूरी (कि.मी. में):</label><input type="number" name="homeDistance" class="form-control" required></div>

                        <div class="section-title">5. वर्तमान विद्यालय की जानकारी</div>
                        <div class="col-md-4"><label class="form-label fw-bold">वर्तमान कक्षा:</label><input type="text" name="studentClass" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">विषय (कोर्स एवं ब्रांच):</label><input type="text" name="course" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">शाला/महाविद्यालय का नाम:</label><input type="text" name="collegeName" class="form-control" required></div>
                        <div class="col-md-12"><label class="form-label fw-bold">शाला प्रवेश दिनांक:</label><input type="date" name="admissionDate" class="form-control" required></div>

                        <div class="section-title">6. पिछली कक्षा का परीक्षा परिणाम</div>
                        <div class="col-md-3"><label class="form-label fw-bold">उत्तीर्ण कक्षा:</label><input type="text" name="prevClass" class="form-control" required></div>
                        <div class="col-md-3"><label class="form-label fw-bold">उत्तीर्ण वर्ष:</label><select name="prevYear" class="form-select"><option value="2026">2026</option><option value="2025">2025</option></select></div>
                        <div class="col-md-3"><label class="form-label fw-bold">परीक्षा परिणाम:</label><select name="examResult" class="form-select"><option value="उत्तीर्ण">उत्तीर्ण</option><option value="अनुत्तीर्ण">अनुत्तीर्ण</option><option value="पूरक">पूरक</option></select></div>
                        <div class="col-md-3"><label class="form-label fw-bold">प्रतिशत / ग्रेड (%):</label><input type="text" name="prevPercent" class="form-control" required></div>

                        <div class="section-title">7. फोटो अपलोड</div>
                        <div class="col-12"><label class="form-label fw-bold text-danger">📸 अपनी नवीनतम पासपोर्ट साइज फोटो अपलोड करें:</label><input type="file" name="studentPhoto" class="form-control" accept="image/*" required></div>

                        <div class="col-12 mt-4"><button type="submit" class="btn btn-primary w-100 fw-bold fs-5">🚀 ऑनलाइन आवेदन पत्र जमा करें</button></div>
                    </form>
                    <div class="text-center mt-3"><a href="/" class="btn btn-link">🏠 मुख्य पृष्ठ पर वापस जाएँ</a></div>
                </div>
            </div>
        </body>
        </html>
    `);
});

// 🔍 लिंक 2: स्टेटस चेक करने वाला पेज (Updated with ✅ Tick & Truti Sudhar Option)
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
                    <p class="text-muted text-center small">यदि फॉर्म भरते समय कोई जानकारी गलत हो गई हो, तो यहाँ से सुधारें।</p>
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
                                    <div class="d-flex align-items-center mb-3">
                                        <img src="\${data.photoUrl}" class="rounded border me-3 shadow-sm" style="width:70px; height:70px; object-fit:cover;">
                                        <div>
                                            <h4 class="text-success fw-bold mb-0">🎉 \${data.studentName}</h4>
                                            <p class="text-muted mb-0">\${data.studentClass} - \${data.collegeName}</p>
                                        </div>
                                    </div>
                                    <div class="bg-white p-3 rounded border">
                                        <p class="mb-2"><b>👨 पिता का नाम:</b> \${data.fatherName}</p>
                                        <p class="mb-2"><b>वर्ग (Category):</b> \${data.category}</p>
                                        <hr>
                                        <p class="mb-0"><b>🏢 अलॉटेड रूम नंबर:</b> <span class="badge bg-warning text-dark fs-6">\${data.roomNumber}</span> \${statusBadge}</p>
                                    </div>
                                </div>\`;
                        } else {
                            resultDiv.innerHTML = \`<div class="alert alert-danger mt-3">❌ इस मोबाइल नंबर से कोई प्रोफाइल या अलॉटमेंट लिस्ट नहीं मिली!</div>\`;
                        }
                    });
                }

                function openEditForm() {
                    const mobile = document.getElementById('editMobile').value;
                    if(!mobile) { alert('कृपया त्रुटि सुधार के लिए मोबाइल नंबर लिखें!'); return; }
                    window.location.href = '/edit-student-form?mobile=' + mobile;
                }
            </script>
        </body>
        </html>
    `);
});

// 🛠️ त्रुटि सुधार (Edit Page Interface)
app.get('/edit-student-form', (req, res) => {
    const mobileQuery = req.query.mobile ? req.query.mobile.trim() : "";
    fs.readFile(studentsFile, 'utf8', (err, data) => {
        let studentsList = [];
        try { studentsList = JSON.parse(data); } catch(e){}
        const student = studentsList.find(s => s.mobile === mobileQuery);
        
        if (!student) {
            return res.send("<h1 style='color:red; text-align:center; margin-top:50px;'>❌ इस नंबर से कोई फॉर्म पंजीकृत नहीं है!</h1><br><a href='/check-status-page' style='display:block; text-align:center;'>वापस जाएँ</a>");
        }

        res.send(`
            <!DOCTYPE html>
            <html lang="hi">
            <head>
                <meta charset="UTF-8">
                <title>आवेदन पत्र में त्रुटि सुधार</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>body{ background-color: #f8f9fa; } .section-title { background-color: #fff3cd; padding: 6px 12px; font-weight: bold; border-left: 4px solid #ffc107; margin-top: 15px; margin-bottom: 15px; color: #856404; }</style>
            </head>
            <body class="p-4">
                <div class="container" style="max-width: 900px;">
                    <div class="card p-4 shadow-sm bg-white border border-warning">
                        <h2 class="text-center text-warning fw-bold mb-4">🛠️ आवेदन पत्र में त्रुटि सुधार (सत्र 2026-27)</h2>
                        <form action="/submit-form" method="POST" enctype="multipart/form-data" class="row g-3">
                            <input type="hidden" name="mobile" value="${student.mobile}">
                            
                            <div class="section-title">1. व्यक्तिगत जानकारी सुधारें</div>
                            <div class="col-md-6"><label class="form-label fw-bold">आधार नंबर:</label><input type="text" name="aadharCard" class="form-control" value="${student.aadharCard || ''}" required></div>
                            <div class="col-md-6"><label class="form-label fw-bold">विद्यार्थी का नाम:</label><input type="text" name="studentName" class="form-control" value="${student.studentName || ''}" required></div>
                            <div class="col-md-6"><label class="form-label fw-bold">जन्मतिथि (DOB):</label><input type="date" name="dob" class="form-control" value="${student.dob || ''}" required></div>
                            <div class="col-md-6"><label class="form-label fw-bold">वर्ग:</label><select name="category" class="form-select"><option value="${student.category}">${student.category}</option><option value="अनुसूचित जनजाति (ST)">अनुसूचित जनजाति (ST)</option><option value=" अनुसूचित जाति (SC)">अनुसूचित जाति (SC)</option><option value="अन्य पिछड़ा वर्ग (OBC)">अन्य पिछड़ा वर्ग (OBC)</option><option value="सामान्य (General)">सामान्य (General)</option></select></div>
                            <div class="col-md-6"><label class="form-label fw-bold">जाति:</label><input type="text" name="subCast" class="form-control" value="${student.subCast || ''}" required></div>
                            <div class="col-md-6"><label class="form-label fw-bold">पंजीकृत मोबाइल नंबर (बदला नहीं जा सकता):</label><input type="text" class="form-control" value="${student.mobile}" disabled></div>
                            
                            <div class="section-title">2. पारिवारिक एवं आय की जानकारी सुधारें</div>
                            <div class="col-md-6"><label class="form-label fw-bold">पिता का नाम:</label><input type="text" name="fatherName" class="form-control" value="${student.fatherName || ''}" required></div>
                            <div class="col-md-6"><label class="form-label fw-bold">माता का नाम:</label><input type="text" name="motherName" class="form-control" value="${student.motherName || ''}" required></div>
                            <div class="col-md-4"><label class="form-label fw-bold">पिता का व्यवसाय:</label><input type="text" name="fatherJob" class="form-control" value="${student.fatherJob || ''}" required></div>
                            <div class="col-md-4"><label class="form-label fw-bold">माता का व्यवसाय:</label><input type="text" name="motherJob" class="form-control" value="${student.motherJob || ''}" required></div>
                            <div class="col-md-4"><label class="form-label fw-bold">पालक की वार्षिक आय (₹):</label><input type="number" name="annualIncome" class="form-control" value="${student.annualIncome || ''}" required></div>

                            <div class="section-title">3. विद्यार्थी का स्टेटस सुधारें</div>
                            <div class="col-md-3"><label class="form-label fw-bold">नक्सल प्रभावित:</label><select name="naxalStatus" class="form-select"><option value="${student.naxalStatus}">${student.naxalStatus}</option><option value="नहीं">नहीं</option><option value="हाँ">हाँ</option></select></div>
                            <div class="col-md-3"><label class="form-label fw-bold">दिव्यांग (PH):</label><select name="phStatus" class="form-select"><option value="${student.phStatus}">${student.phStatus}</option><option value="नहीं">नहीं</option><option value="हाँ">हाँ</option></select></div>
                            <div class="col-md-3"><label class="form-label fw-bold">बीपीएल (BPL):</label><select name="bplStatus" class="form-select"><option value="${student.bplStatus}">${student.bplStatus}</option><option value="नहीं">नहीं</option><option value="हाँ">हाँ</option></select></div>
                            <div class="col-md-3"><label class="form-label fw-bold">पीवीटीजी (PVTG):</label><select name="pvtgStatus" class="form-select"><option value="${student.pvtgStatus}">${student.pvtgStatus}</option><option value="नहीं">नहीं</option><option value="हाँ">हाँ</option></select></div>

                            <div class="section-title">4. स्थायी पता एवं विद्यालय से दूरी सुधारें</div>
                            <div class="col-md-6"><label class="form-label fw-bold">स्थायी पता:</label><input type="text" name="permanentAddress" class="form-control" value="${student.permanentAddress || ''}" required></div>
                            <div class="col-md-3"><label class="form-label fw-bold">विकासखंड:</label><input type="text" name="blockName" class="form-control" value="${student.blockName || ''}" required></div>
                            <div class="col-md-3"><label class="form-label fw-bold">जिला:</label><input type="text" name="districtName" class="form-control" value="${student.districtName || ''}" required></div>
                            <div class="col-md-12"><label class="form-label fw-bold">घर से शाला की दूरी (कि.मी. में):</label><input type="number" name="homeDistance" class="form-control" value="${student.homeDistance || ''}" required></div>

                            <div class="section-title">5. वर्तमान विद्यालय की जानकारी सुधारें</div>
                            <div class="col-md-4"><label class="form-label fw-bold">वर्तमान कक्षा:</label><input type="text" name="studentClass" class="form-control" value="${student.studentClass || ''}" required></div>
                            <div class="col-md-4"><label class="form-label fw-bold">विषय (कोर्स एवं ब्रांच):</label><input type="text" name="course" class="form-control" value="${student.course || ''}" required></div>
                            <div class="col-md-4"><label class="form-label fw-bold">शाला का नाम:</label><input type="text" name="collegeName" class="form-control" value="${student.collegeName || ''}" required></div>
                            <div class="col-md-12"><label class="form-label fw-bold">शाला प्रवेश दिनांक:</label><input type="date" name="admissionDate" class="form-control" value="${student.admissionDate || ''}" required></div>

                            <div class="section-title">6. पिछली कक्षा का परीक्षा परिणाम सुधारें</div>
                            <div class="col-md-3"><label class="form-label fw-bold">उत्तीर्ण कक्षा:</label><input type="text" name="prevClass" class="form-control" value="${student.prevClass || ''}" required></div>
                            <div class="col-md-3"><label class="form-label fw-bold">उत्तीर्ण वर्ष:</label><select name="prevYear" class="form-select"><option value="${student.prevYear}">${student.prevYear}</option><option value="2026">2026</option><option value="2025">2025</option></select></div>
                            <div class="col-md-3"><label class="form-label fw-bold">परीक्षा परिणाम:</label><select name="examResult" class="form-select"><option value="${student.examResult}">${student.examResult}</option><option value="उत्तीर्ण">उत्तीर्ण</option><option value="अनुत्तीर्ण">अनुत्तीर्ण</option><option value="पूरक">पूरक</option></select></div>
                            <div class="col-md-3"><label class="form-label fw-bold">प्रतिशत / ग्रेड (%):</label><input type="text" name="prevPercent" class="form-control" value="${student.prevPercent || ''}" required></div>

                            <div class="section-title">7. फोटो (यदि बदलना चाहें, अन्यथा खाली छोड़ें)</div>
                            <div class="col-12">
                                <label class="form-label fw-bold text-danger">📸 नई पासपोर्ट साइज फोटो अपलोड करें (पुरानी रखने के लिए खाली छोड़ें):</label>
                                <input type="file" name="studentPhoto" class="form-control" accept="image/*">
                                <input type="hidden" name="existingPhoto" value="${student.photoUrl}">
                            </div>

                            <div class="col-12 mt-4"><button type="submit" class="btn btn-warning w-100 fw-bold fs-5 text-dark">🔄 सुधार की हुई जानकारी सुरक्षित करें</button></div>
                        </form>
                        <div class="text-center mt-3"><a href="/check-status-page" class="btn btn-link">🔙 वापस जाएँ</a></div>
                    </div>
                </div>
            </body>
            </html>
        `);
    });
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
    const photoPath = req.file ? req.file.path : (req.body.existingPhoto || "https://via.placeholder.com/150");
    const studentData = {
        id: req.body.mobile.trim(), 
        studentName: req.body.studentName,
        aadharCard: req.body.aadharCard,
        dob: req.body.dob,
        category: req.body.category,
        subCast: req.body.subCast,
        mobile: req.body.mobile.trim(),
        fatherName: req.body.fatherName,
        motherName: req.body.motherName,
        fatherJob: req.body.fatherJob,
        motherJob: req.body.motherJob,
        annualIncome: req.body.annualIncome,
        naxalStatus: req.body.naxalStatus,
        phStatus: req.body.phStatus,
        bplStatus: req.body.bplStatus,
        pvtgStatus: req.body.pvtgStatus,
        permanentAddress: req.body.permanentAddress,
        blockName: req.body.blockName,
        districtName: req.body.districtName,
        homeDistance: req.body.homeDistance,
        studentClass: req.body.studentClass,
        course: req.body.course,
        collegeName: req.body.collegeName,
        admissionDate: req.body.admissionDate,
        prevClass: req.body.prevClass,
        prevYear: req.body.prevYear,
        examResult: req.body.examResult,
        prevPercent: req.body.prevPercent,
        photoUrl: photoPath, 
        roomNumber: req.body.existingRoom || "अभी अलॉट नहीं हुआ (वेटिंग)", 
        date: new Date().toLocaleString()
    };

    fs.readFile(studentsFile, 'utf8', (err, data) => {
        let studentsList = [];
        if (!err && data) {
            try { studentsList = JSON.parse(data); } catch(e) { studentsList = []; }
        }
        // यदि छात्र पहले से था, तो उसका पुराना अलॉटेड रूम सुरक्षित रखें
        const oldData = studentsList.find(s => s.mobile === studentData.mobile);
        if (oldData) {
            studentData.roomNumber = oldData.roomNumber;
        }
        
        studentsList = studentsList.filter(s => s.mobile !== studentData.mobile);
        studentsList.push(studentData);
        fs.writeFile(studentsFile, JSON.stringify(studentsList, null, 2), () => {
            res.send("<div style='text-align:center; padding:50px; font-family:sans-serif;'> <h1 style='color:green;'>🎉 जानकारी सफलतापूर्वक सुरक्षित कर ली गई है!</h1><p>अब आपका रिकॉर्ड लाइव अपडेट हो चुका है।</p><a href='/' style='font-size:18px;'>मुख्य पृष्ठ पर वापस जाएँ</a></div>");
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
                <tr class="align-middle" style="font-size:13px;">
                    <td>${index + 1}</td>
                    <td><img src="${student.photoUrl}" class="rounded border" style="width:45px; height:45px; object-fit:cover; margin-right:5px;"><b>${student.studentName}</b><br><small class="text-muted">आधार: ${student.aadharCard}</small></td>
                    <td><b>पिता:</b> ${student.fatherName}<br><b>माता:</b> ${student.motherName}<br><small>आय: ₹${student.annualIncome}</small></td>
                    <td>${student.mobile}</td>
                    <td>${student.permanentAddress}, ${student.blockName}<br><small class="text-danger">दूरी: ${student.homeDistance}KM</small></td>
                    <td><b>कक्षा:</b> ${student.studentClass}<br><small>${student.collegeName}</small></td>
                    <td>${student.prevClass} (${student.prevPercent})</td>
                    <td>
                        <span class="badge bg-secondary">Naxal: ${student.naxalStatus}</span><br>
                        <span class="badge bg-dark">BPL: ${student.bplStatus}</span><br>
                        <span class="badge bg-info text-dark">PVTG: ${student.pvtgStatus}</span>
                    </td>
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
                            <h4 class="text-primary fw-bold">⚙️ हॉस्टल लोगो/बैनर बदलें</h4>
                            <form action="/update-logo" method="POST" enctype="multipart/form-data" class="mt-2">
                                <input type="file" name="hostelLogo" class="form-control form-control-sm mb-2" accept="image/*" required>
                                <button type="submit" class="btn btn-sm btn-primary w-100">अपलोड करें</button>
                            </form>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="bg-white border p-3 rounded shadow-sm h-100">
                            <h4 class

