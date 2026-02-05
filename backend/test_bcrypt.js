const bcrypt = require('bcryptjs');
(async () => {
  const hash = '$2b$10$gGiEVHSUYBkztfARK/rGpePFw0hqkR9lKI.NiitNf4aOtpveh.v5q';
  const plain = 'secret';
  try {
    const match = await bcrypt.compare(plain, hash);
    console.log('compare result:', match);
  } catch (err) {
    console.error('error:', err);
  }
})();
