const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('./models/Users/ManagerDB'); // Ensure this matches your admin model file path
const Manager = mongoose.model('management_user');

const db = 'mongodb://localhost:27017/staff-db'; 

mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        const newAdmin = new Manager({
            name: 'System Admin',
            email: 'admin@gmail.com',
            password: 'admin', 
            type: 'manager'
        });

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newAdmin.password, salt, (err, hash) => {
                newAdmin.password = hash;
                newAdmin.save()
                    .then(user => {
                        console.log('Admin Account Created: ' + user.email);
                        process.exit();
                    })
                    .catch(err => console.log(err));
            });
        });
    });