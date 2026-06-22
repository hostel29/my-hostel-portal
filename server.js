const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();

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

const uploadMiddleware = multer({ storage: storage }).fields([
    { name: 'studentPhoto', maxCount: 1 },
    { name: 'fatherAadharFile', maxCount: 1 },
    { name: 'motherAadharFile', maxCount: 1 },
    { name: 'casteCertFile', maxCount: 1 },
    { name: 'residenceCertFile', maxCount: 1 },
    { name: 'incomeCertFile', maxCount: 1 },
    { name: 'distanceCertFile', maxCount: 1 },
    { name: 'ayushmanFile', maxCount: 1 },
    { name: 'rationCardFile', maxCount: 1 },
    { name: 'hostelLogo', maxCount: 1 },
    { name: 'w1PhotoFile', maxCount: 1 },
    { name: 'w2PhotoFile', maxCount: 1 }
]);

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const mongoURI = "mongodb+srv://surajpurprimatricsthostelsuraj_db_user:HostelSurajpur2026@cluster0.jztdqxu.mongodb.net/hostelData?appName=Cluster0";

mongoose.connect(mongoURI)
    .then(() => console.log("🎰 मोंगोडीबी क्लाउड तिजोरी कनेक्ट हो गई है!"))
    .catch(err => console.error("❌ डेटाबेस कनेक्शन एरर:", err));

const StudentSchema = new mongoose.Schema({
    id: String, appNo: String, studentName: String, aadharCard: String, mobile: String,
    fatherName: String, motherName: String, annualIncome: Number, category: String, subCast: String,
    permanentAddress: String, blockName: String, districtName: String, homeDistance: Number,
    studentClass: String, course: String, collegeName: String, prevPercent: String, photoUrl: String,
    roomNumber: { type: String, default: "अभी अलॉट नहीं हुआ" }, approved: { type: Boolean, default: false },
    date: String
});
const Student = mongoose.model('Student', StudentSchema);

const NoticeSchema = new mongoose.Schema({ text: String, date: String });
const Notice = mongoose.model('Notice', NoticeSchema);

const WardenSchema = new mongoose.Schema({
    w1Name: String, w1Desig: String, w1Mobile: String, w1Office: String, w1Photo: String,
    w2Name: String, w2Desig: String, w2Mobile: String, w2Office: String, w2Photo: String
});
const Warden = mongoose.model('Warden', WardenSchema);

const LogoSchema = new mongoose.Schema({ url: String });
const Logo = mongoose.model('Logo', LogoSchema);

const defaultWarden = {
    w1Name: "Unknown Warden A", w1Desig: "छात्रावास अधीक्षक (A)", w1Mobile: "+91 XXXXX XXXXX", w1Office: "कार्यालय कक्ष 01", w1Photo: "https://via.placeholder.com/150",
    w2Name: "Unknown Warden B", w2Desig: "छात्रावास अधीक्षक (B)", w2Mobile: "+91 XXXXX XXXXX", w2Office: "कार्यालय कक्ष 02", w2Photo: "https://via.placeholder.com/150"
};
const defaultLogo = { url: "https://via.placeholder.com/800x250?text=HOSTEL+BANNER+LOGO" };
// 🏠 मुख्य पृष्ठ (सिंपल और एरर-प्रूफ स्ट्रिंग फॉर्मेट)
app.get('/', async (req, res) => {
    try {
        const students = await Student.find({});
        const stApproved = students.filter(s => s.approved === true && s.category && s.category.includes('ST')).length;
        const scApproved = students.filter(s => s.approved === true && s.category && s.category.includes('SC')).length;
        const stAvailable = 100 - stApproved;
        const scAvailable = 50 - scApproved;

        let html = '<!DOCTYPE html><html lang="hi"><head><meta charset="UTF-8">';
        html += '<title>प्री मैट्रिक ST+SC बालक छात्रावास सूरजपुर</title>';
        html += '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">';
        html += '</head><body class="bg-light"><div class="container py-4">';
        html += '<div class="card p-4 mb-4 text-center bg-dark text-white">';
        html += '<h2 class="fw-bold text-warning">🏠 प्री मैट्रिक ST+SC बालक छात्रावास सूरजपुर (छ. ग.)</h2>';
        html += '<a class="btn btn-sm btn-outline-warning mt-2" href="/view-students" target="_blank">🔒 एडमिन पैनल</a></div>';
        
        html += '<div class="row g-3 mb-4 text-center">';
        html += '<div class="col-md-6"><div class="card p-3 border-top border-primary border-4"><h6>ST कुल सीटें: 100 | खाली: ' + (stAvailable > 0 ? stAvailable : 0) + '</h6></div></div>';
        html += '<div class="col-md-6"><div class="card p-3 border-top border-success border-4"><h6>SC कुल सीटें: 50 | खाली: ' + (scAvailable > 0 ? scAvailable : 0) + '</h6></div></div>';
        html += '</div>';

        html += '<div class="row g-4"><div class="col-md-8"><div class="card p-4 text-center mb-4">';
        html += '<img id="hostel-logo" src="" class="img-fluid rounded mb-3" style="max-height:200px;">';
        html += '<div class="bg-danger text-white p-2 rounded fw-bold">📢 नोटिस बोर्ड</div>';
        html += '<ul id="live-notices" class="list-group list-group-flush text-start mt-2"></ul></div>';
        
        html += '<div class="row g-3 text-center">';
        html += '<div class="col-6"><a href="/registration-form" class="btn btn-primary w-100 py-3 fw-bold">📝 हॉस्टल फॉर्म भरें</a></div>';
        html += '<div class="col-6"><a href="/check-status-page" class="btn btn-success w-100 py-3 fw-bold">🔍 अलॉटमेंट स्टेटस</a></div>';
        html += '</div></div>';

        html += '<div class="col-md-4"><div class="card p-3 text-center border-top border-warning border-4">';
        html += '<h6>👨‍💼 हॉस्टल वॉर्डन कॉर्नर</h6><div class="text-start small p-2 bg-white rounded mt-2 border">';
        html += '<b>नाम:</b> <span id="w1-name"></span><br><b>📞:</b> <span id="w1-phone"></span></div>';
        html += '<a href="/public-admission-list" target="_blank" class="btn btn-sm btn-dark w-100 mt-3 fw-bold">📋 एडमिशन चयन सूची देखें ➔</a></div></div></div></div>';
        
        html += '<script>window.onload = function() {';
        html += "fetch('/get-logo').then(res => res.json()).then(logo => { document.getElementById('hostel-logo').src = logo.url; });";
        html += "fetch('/get-notices').then(res => res.json()).then(notices => { const list = document.getElementById('live-notices'); list.innerHTML = notices.length === 0 ? \"<li class='list-group-item text-muted text-center'>कोई नोटिस नहीं है।</li>\" : \"\"; notices.forEach(n => { list.innerHTML += \"<li class='list-group-item'><b>[\" + n.date + \"]:</b> \" + n.text + \"</li>\"; }); });";
        html += "fetch('/get-warden').then(res => res.json()).then(w => { document.getElementById('w1-name').innerText = w.w1Name; document.getElementById('w1-phone').innerText = w.w1Mobile; });";
        html += '};</script></body></html>';
        
        res.send(html);
    } catch (err) { res.status(500).send("Home Page Error"); }
});

app.get('/registration-form', (req, res) => {
    res.send(`
        <!DOCTYPE html><html><head><meta charset="UTF-8"><title>प्रवेश आवेदन</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"></head>
        <body class="bg-light p-4"><div class="container" style="max-width: 700px;"><div class="card p-4 shadow-sm">
                    <h3 class="text-center text-primary fw-bold mb-4">छात्रावास प्रवेश आवेदन पत्र (2026-27)</h3>
                    <form action="/submit-form" method="POST" enctype="multipart/form-data" class="row g-3">
                        <div class="col-md-6"><label class="form-label fw-bold">विद्यार्थी का नाम:</label><input type="text" name="studentName" class="form-control" required></div>
                        <div class="col-md-6"><label class="form-label fw-bold">पिता का नाम:</label><input type="text" name="fatherName" class="form-control" required></div>
                        <div class="col-md-6"><label class="form-label fw-bold">आधार नंबर:</label><input type="text" name="aadharCard" class="form-control" required></div>
                        <div class="col-md-6"><label class="form-label fw-bold">मोबाइल नंबर:</label><input type="tel" name="mobile" class="form-control" required></div>
                        <div class="col-md-6"><label class="form-label fw-bold">वर्ग (Category):</label><select name="category" class="form-select"><option value="अनुसूचित जनजाति (ST)">अनुसूचित जनजाति (ST)</option><option value="अनुसूचित जाति (SC)">अनुसूचित जाति (SC)</option></select></div>
                        <div class="col-md-6"><label class="form-label fw-bold">वर्तमान कक्षा:</label><input type="text" name="studentClass" class="form-control" required></div>
                        <div class="col-md-12"><label class="form-label fw-bold">शाला का नाम:</label><input type="text" name="collegeName" class="form-control" required></div>
                        <div class="col-md-6"><label class="form-label fw-bold">स्थायी पता:</label><input type="text" name="permanentAddress" class="form-control" required></div>
                        <div class="col-md-6"><label class="form-label fw-bold">पिछला प्रतिशत (%):</label><input type="text" name="prevPercent" class="form-control" required></div>
                        <div class="col-12"><label class="form-label fw-bold text-danger">📸 छात्र की फोटो (अनिवार्य):</label><input type="file" name="studentPhoto" class="form-control" accept="image/*" required></div>
                        <div class="col-12 mt-4"><button type="submit" class="btn btn-primary w-100 fw-bold fs-5">🚀 आवेदन पत्र जमा करें</button></div>
                    </form>
                </div></div></body></html>
    `);
});
app.get('/check-status-page', (req, res) => {
    res.send(`
        <!DOCTYPE html><html><head><meta charset="UTF-8"><title>स्टेटस</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"></head>
        <body class="p-5 bg-light"><div class="container" style="max-width: 500px;"><div class="card p-4 shadow-sm text-center">
                    <h4 class="text-success fw-bold mb-3">🔍 अलॉटमेंट रिजल्ट स्टेटस</h4>
                    <input type="tel" id="searchMobile" class="form-control mb-3" placeholder="मोबाइल नंबर दर्ज करें...">
                    <button onclick="checkStatus()" class="btn btn-success w-100 fw-bold">रिजल्ट देखें</button>
                    <div id="statusResult" class="mt-3"></div>
                </div></div>
            <script>
                function checkStatus() {
                    const m = document.getElementById('searchMobile').value; if(!m) return alert('नंबर लिखें!');
                    fetch('/check-room-status?mobile=' + m).then(res => res.json()).then(data => {
                        const r = document.getElementById('statusResult');
                        if (data.found) {
                            r.innerHTML = '<div class="alert alert-info"><b>छात्र:</b> ' + data.studentName + '<br><b>रूम नंबर:</b> ' + (data.roomNumber || 'अभी अलॉट नहीं हुआ') + '<br><b>स्टेटस:</b> ' + (data.approved ? '✅ स्वीकृत' : '⏳ पेंडिंग') + '</div>';
                        } else { r.innerHTML = '<div class="alert alert-danger">❌ रिकॉर्ड नहीं मिला!</div>'; }
                    });
                }
            </script>
        </body></html>
    `);
});

app.get('/public-admission-list', async (req, res) => {
    try {
        const list = await Student.find({ approved: true }); let rows = '';
        list.forEach((s, idx) => { rows += '<tr><td>' + (idx+1) + '</td><td>' + s.studentName + '</td><td>' + s.fatherName + '</td><td>' + s.studentClass + '</td><td>' + (s.roomNumber || 'वेटिंग') + '</td></tr>'; });
        res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>चयन सूची</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"></head><body class="p-5 bg-light"><div class="container" style="max-width: 700px;"><div class="card p-4"><h4>📋 स्वीकृत छात्र प्रवेश चयन सूची</h4><table class="table table-bordered mt-3"><thead><tr><th>S.No</th><th>नाम</th><th>पिता का नाम</th><th>कक्षा</th><th>रूम नंबर</th></tr></thead><tbody>' + (rows || '<tr><td colspan="5">कोई सूची स्वीकृत नहीं है।</td></tr>') + '</tbody></table></div></div></body></html>');
    } catch(e) { res.status(500).send("Error"); }
});

app.post('/submit-form', (req, res) => {
    uploadMiddleware(req, res, async (err) => {
        try {
            let photoPath = "https://via.placeholder.com/150";
            if (req.files && req.files['studentPhoto'] && req.files['studentPhoto'].length > 0) { photoPath = req.files['studentPhoto'][0].path; }
            const appNumber = "SUR-2026-" + req.body.mobile.trim().slice(-4);
            const sData = { id: req.body.mobile.trim(), appNo: appNumber, studentName: req.body.studentName, aadharCard: req.body.aadharCard, mobile: req.body.mobile.trim(), fatherName: req.body.fatherName, permanentAddress: req.body.permanentAddress, studentClass: req.body.studentClass, collegeName: req.body.collegeName, prevPercent: req.body.prevPercent, photoUrl: photoPath, date: new Date().toLocaleString() };
            const old = await Student.findOne({ mobile: sData.mobile });
            if (old) { await Student.updateOne({ mobile: sData.mobile }, { $set: sData }); }
            else { const newStudent = new Student(sData); await newStudent.save(); }
            res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>रसीद</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"></head><body><div class="container p-5"><div class="card p-4 border border-dark mx-auto text-center" style="max-width:500px;"><h4>पावती रसीद 2026-27</h4><p class="text-danger fw-bold">क्रमांक: ' + appNumber + '</p><h5>छात्र: ' + sData.studentName + '</h5><img src="' + photoPath + '" class="img-thumbnail mx-auto my-2" style="width:100px;"><br><button onclick="window.print()" class="btn btn-primary mt-3">🖨️ प्रिंट रसीद</button><a href="/" class="btn btn-link mt-2">मुख्य पृष्ठ</a></div></div></body></html>');
        } catch (e) { res.status(500).send("Upload Error"); }
    });
});

app.get('/view-students', async (req, res) => {
    const auth = { login: 'admin', password: 'password123' }; const b64 = (req.headers.authorization || '').split(' ')[1] || ''; const [login, password] = Buffer.from(b64, 'base64').toString().split(':');
    if (!login || !password || login !== auth.login || password !== auth.password) { res.set('WWW-Authenticate', 'Basic realm="401"'); return res.status(401).send('❌ गलत पासवर्ड!'); }
    let sList = await Student.find({}); let rows = '';
    sList.forEach((s, idx) => {
        let actionBtn = s.approved ? '<span class="badge bg-success">Approved</span>' : '<button onclick="approveStudent(\'' + s.id + '\')" class="btn btn-sm btn-primary">Approve</button>';
        rows += '<tr><td>' + (idx + 1) + '</td><td>' + s.studentName + '</td><td>' + s.mobile + '</td><td><input type="text" id="room-' + s.id + '" value="' + (s.roomNumber || '') + '" style="width:50px;"><button onclick="saveRoom(\'' + s.id + '\')" class="btn btn-sm btn-dark ms-1">सेव</button></td><td>' + actionBtn + '</td></tr>';
    });
    res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>एडमिन Panel</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"></head><body class="p-4"><h4>🔒 हॉस्टल कंट्रोल पैनल</h4><table class="table table-bordered mt-3"><thead><tr><th>S.No</th><th>छात्र</th><th>मोबाइल</th><th>ROOM अलॉट</th><th>Approval</th></tr></thead><tbody>' + (rows || '<tr><td colspan="5">कोई छात्र नहीं है</td></tr>') + '</tbody></table><script>function saveRoom(id){ const val=document.getElementById("room-"+id).value; fetch("/assign-room",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({studentId:id,roomNumber:val})}).then(()=>location.reload())} function approveStudent(id){ fetch("/approve-student",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({studentId:id})}).then(()=>location.reload())}</script></body></html>');
});

app.post('/assign-room', async (req, res) => { await Student.updateOne({ mobile: req.body.studentId }, { $set: { roomNumber: req.body.roomNumber } }); res.json({ success: true }); });
app.post('/approve-student', async (req, res) => { await Student.updateOne({ mobile: req.body.studentId }, { $set: { approved: true } }); res.json({ success: true }); });
app.get('/get-warden', async (req, res) => res.json(await Warden.findOne({}) || defaultWarden));
app.get('/get-logo', async (req, res) => res.json(await Logo.findOne({}) || defaultLogo));
app.get('/get-notices', async (req, res) => res.json(await Notice.find({})));
app.get('/check-room-status', async (req, res) => { const s = await Student.findOne({ mobile: req.query.mobile }); res.json(s ? { found: true, ...s.toObject() } : { found: false }); });

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log('🚀 सर्वर चालू है पोर्ट ' + PORT + ' पर!'));
