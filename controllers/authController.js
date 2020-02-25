//Modul dependencies
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { validationResult } = require('express-validator');

//Models dependencies
const User = require('../models/User');

exports.list = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;

  try {
    //See if the user exist
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ errors: [{ msg: "User doesn't exist!" }] });
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) {
      return res.status(400).json({ errors: [{ msg: 'Invalid Credentals' }] });
    }

    //Return jsonwebtoken
    //define a payload
    const payload = {
      user: {
        id: user.id
      }
    };

    //secret and sign token
    jwt.sign(
      payload,
      config.get('jwtSecret'),
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
