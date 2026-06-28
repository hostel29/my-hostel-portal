const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();

const PORT = 3000;
const ADMIN_PASSWORD = "admin123";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: 'hostel-secret',
    resave: false,
    saveUninitialized: true
}));

app.use(express.static('public'));

const DATA_FILE = './students.json';

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]');
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });

function getStudents() {
    return JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveStudents(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get('/', (req, res) => {

    res.send(`
    
    <!DOCTYPE html>
    <html>

    <head>

    <title>Hostel Management</title>

    <style>

    body{
        margin:0;
        padding:0;
        background:#121212;
        font-family:Arial;
        color:white;
    }

    .container{
        width:350px;
        margin:auto;
        margin-top:120px;
        background:#1e1e1e;
        padding:30px;
        border-radius:12px;
        box-shadow:0 0 10px rgba(0,0,0,0.5);
    }

    h1{
        text-align:center;
    }

    input{
        width:100%;
        padding:12px;
        margin-top:12px;
        border:none;
        border-radius:6px;
        background:#2d2d2d;
        color:white;
    }

    button{
        width:100%;
        padding:12px;
        margin-top:15px;
        border:none;
        border-radius:6px;
        background:#00b894;
        color:white;
        cursor:pointer;
        font-size:16px;
    }

    button:hover{
        opacity:0.9;
    }

    .loading{
        display:none;
        text-align:center;
        margin-top:15px;
    }

    </style>

    </head>

    <body>

    <div class="container">

    <h1>Hostel Login</h1>

    <form id="loginForm">

    <input 
    type="password" 
    id="password" 
    placeholder="Enter Password"
    required
    >

    <button type="submit">
    Login
    </button>

    </form>

    <div class="loading" id="loading">
    Loading...
    </div>

    <p id="msg"></p>

    </div>

    <script>

    const form = document.getElementById('loginForm');

    form.addEventListener('submit', async function(e){

        e.preventDefault();

        document.getElementById('loading').style.display='block';

        const password = document.getElementById('password').value;

        const res = await fetch('/login',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({password})
        });

        const data = await res.json();

        document.getElementById('loading').style.display='none';

        document.getElementById('msg').innerText = data.message;

        if(data.success){
            window.location='/admin';
        }

    });

    </script>

    </body>
    </html>
    
    `);

});

app.post('/login', (req, res) => {

    const { password } = req.body;

    if(password === ADMIN_PASSWORD){

        req.session.admin = true;

        return res.json({
            success:true,
            message:'Login Successful'
        });

    }

    res.json({
        success:false,
        message:'Wrong Password'
    });

});

app.get('/admin', (req, res) => {

    if(!req.session.admin){
        return res.send('Access Denied');
    }

    const students = getStudents();

    let totalStudents = students.length;

    let html = `
    
    <!DOCTYPE html>
    <html>

    <head>

    <title>Admin Dashboard</title>

    <style>

    body{
        margin:0;
        padding:20px;
        background:#121212;
        color:white;
        font-family:Arial;
    }

    .top{
        display:flex;
        justify-content:space-between;
        align-items:center;
    }

    .card{
        background:#1e1e1e;
        padding:20px;
        border-radius:10px;
        margin-top:20px;
    }

    input{
        width:100%;
        padding:12px;
        margin-top:10px;
        border:none;
        border-radius:6px;
        background:#2d2d2d;
        color:white;
    }

    button{
        padding:12px;
        margin-top:10px;
        border:none;
        border-radius:6px;
        background:#00b894;
        color:white;
        cursor:pointer;
    }

    table{
        width:100%;
        border-collapse:collapse;
        margin-top:20px;
    }

    td,th{
        border:1px solid #333;
        padding:12px;
        text-align:center;
    }

    img{
        width:60px;
        height:60px;
        object-fit:cover;
        border-radius:50%;
    }

    .delete{
        background:red;
    }

    </style>

    </head>

    <body>

    <div class="top">

    <h1>Hostel Dashboard</h1>

    <a href="/logout">
    <button>Logout</button>
    </a>

    </div>

    <div class="card">

    <h2>Total Students : ${totalStudents}</h2>

    </div>

    <div class="card">

    <h2>Add Student</h2>

    <form 
    method="POST" 
    action="/add-student"
    enctype="multipart/form-data"
    >

    <input 
    name="name"
    placeholder="Student Name"
    required
    >

    <input 
    name="room"
    placeholder="Room Number"
    required
    >

    <input 
    name="mobile"
    placeholder="Mobile Number"
    required
    >

    <input 
    type="file"
    name="photo"
    required
    >

    <button type="submit">
    Add Student
    </button>

    </form>

    </div>

    <div class="card">

    <h2>All Students</h2>

    <table>

    <tr>
    <th>Photo</th>
    <th>Name</th>
    <th>Room</th>
    <th>Mobile</th>
    <th>Action</th>
    </tr>

    `;

    students.forEach(student => {

        html += `
        
        <tr>

        <td>
        <img src="${student.photo}">
        </td>

        <td>${student.name}</td>

        <td>${student.room}</td>

        <td>${student.mobile}</td>

        <td>

        <a href="/delete/${student.id}">
        <button class="delete">
        Delete
        </button>
        </a>

        </td>

        </tr>
        
        `;

    });

    html += `
    
    </table>

    </div>

    </body>

    </html>
    
    `;

    res.send(html);

});

app.post('/add-student', upload.single('photo'), (req, res) => {

    if(!req.session.admin){
        return res.send('Access Denied');
    }

    const students = getStudents();

    students.push({

        id: Date.now(),

        name: req.body.name,

        room: req.body.room,

        mobile: req.body.mobile,

        photo: '/uploads/' + req.file.filename

    });

    saveStudents(students);

    res.redirect('/admin');

});

app.get('/delete/:id', (req, res) => {

    if(!req.session.admin){
        return res.send('Access Denied');
    }

    let students = getStudents();

    students = students.filter(
        student => student.id != req.params.id
    );

    saveStudents(students);

    res.redirect('/admin');

});

app.get('/logout', (req, res) => {

    req.session.destroy();

    res.redirect('/');

});

app.listen(PORT, () => {

    console.log('Server Running On Port ' + PORT);

});
