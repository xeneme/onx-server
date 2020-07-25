const jwt = require('jsonwebtoken');

module.exports = {
  verify: (token) =>
    jwt.verify(token, process.env.SECRET),
  confirmationToken: (code, email) => {
    return (
      'Bearer ' +
      jwt.sign(
        {
          stage: 'confirmation',
          code,
          email,
        },
        process.env.SECRET,
        { expiresIn: '1h' },
      )
    );
  },
  registrationToken: email => {
    return (
      'Bearer ' +
      jwt.sign(
        {
          stage: 'registration',
          email,
        },
        process.env.SECRET,
        {
          expiresIn: '8h',
        },
      )
    );
  },
  authorizationToken: userid => {
    return (
      'Bearer ' +
      jwt.sign(
        {
          stage: 'authorization',
          user: userid,
        },
        process.env.SECRET,
        {
          expiresIn: '24h',
        },
      )
    );
  },
};
