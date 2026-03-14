const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load models
const Faculty = mongoose.model('users');
const Hod = mongoose.model('hod');
const Manager = mongoose.model('management_user');

module.exports = function (passport) {
    
    // FACULTY STRATEGY
    passport.use('faculty', new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
        Faculty.findOne({ email: email })
            .then(user => {
                if (!user) {
                    return done(null, false, { message: 'User not found' });
                }
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) return done(null, user);
                    else return done(null, false, { message: 'Password incorrect' });
                });
            })
            .catch(err => done(err));
    }));

    // HOD STRATEGY
    passport.use('hod', new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
        Hod.findOne({ email: email })
            .then(user => {
                if (!user) {
                    return done(null, false, { message: 'HOD record not found' });
                }
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) return done(null, user);
                    else return done(null, false, { message: 'Password incorrect' });
                });
            })
            .catch(err => done(err));
    }));

    // MANAGEMENT STRATEGY
    passport.use('management_user', new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    // Using regex to make the email search case-insensitive
        Manager.findOne({ email: { $regex: new RegExp("^" + email.toLowerCase() + "$", "i") } })
            .then(user => {
                if (!user) {
                    return done(null, false, { message: 'Manager account not found' });
            }
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) return done(null, user);
                else return done(null, false, { message: 'Password incorrect' });
            });
        })
        .catch(err => done(err));
    }));

    
    // SERIALIZATION
    passport.serializeUser((entity, done) => {
        // Important: entity.type must be set during registration (faculty, hod, or manager)
        done(null, { id: entity.id, type: entity.type });
    });

    // DESERIALIZATION
    // config/passport.js
    passport.deserializeUser((obj, done) => {
        switch (obj.type) {
            case 'faculty':
                Faculty.findById(obj.id).then(user => done(null, user)).catch(err => done(err, null));
                break;
            case 'hod':
                Hod.findById(obj.id).then(user => done(null, user)).catch(err => done(err, null));
                break;
            case 'manager': // <--- ENSURE THIS IS 'manager'
                Manager.findById(obj.id).then(user => done(null, user)).catch(err => done(err, null));
                break;
            default:
                done(new Error('Unknown user type: ' + obj.type), null);
    }
})};