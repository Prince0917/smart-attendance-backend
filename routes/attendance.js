const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Attendance = require('../models/attendance');
const jwt = require('jsonwebtoken');


const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};


router.post('/create-session', verifyToken, async (req, res) => {
  try {
    const { code, expiresAt, latitude, longitude, radius } = req.body;

    const session = new Session({
      teacherId: req.user.userId,
      code,
      expiresAt,
      latitude,
      longitude,
      radius,
      isActive: true
    });

    await session.save();
    res.status(201).json({ message: 'Session created', session });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});


router.post('/mark', verifyToken, async (req, res) => {
  try {
    const { code, latitude, longitude } = req.body;


    const session = await Session.findOne({ code, isActive: true });
    if (!session) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    
    if (new Date() > session.expiresAt) {
      return res.status(400).json({ message: 'Session has expired' });
    }

   
    const existing = await Attendance.findOne({
      studentId: req.user.userId,
      sessionId: session._id
    });
    if (existing) {
      return res.status(400).json({ message: 'Attendance already marked' });
    }


    const attendance = new Attendance({
      studentId: req.user.userId,
      sessionId: session._id
    });

    await attendance.save();
    res.status(201).json({ message: 'Attendance marked successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;