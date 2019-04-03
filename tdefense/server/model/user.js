const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String
  },
  inGameName: {
    type: String,
    maxlength: 16,
    minlength: 1
  },
  salt: String,
  session: String,
});

userSchema.statics.createNewUser = async function(email, password) {
  let existingUser;
  try {
    existingUser = await User.findOne({email});
  } catch (e) {
    return console.log(e);
  }

  if (!existingUser) {
    // Generate hash
    const salt = generateSalt();
    password = password ? password : '';
    const hashedPassword = hash(password, salt);

    // Create new user
    const user = new User({email, password: hashedPassword, salt});
    let newUser = await user.save();
    return newUser;
  }
};

userSchema.statics.authenticate = async function(email, password) {
  let userInDb;
  try {
    userInDb = await User.findOne({email});
  } catch (e) {
    return {
      error: {
        message: e,
      },
    };
  }

  if (userInDb) {
    const authenticated = verifyHash(password, userInDb.salt, userInDb.password);
    const user = authenticated ? userInDb : undefined;
    return {user};
  } else {
    return {};
  }
};

userSchema.statics.findUserByIGN = async function(inGameName) {
  try {
    let user = await User.findOne({inGameName});
    return user;
  } catch (e) {
    return null;
  }
}

/**
   * Verifies the combination of password and salt against a hash
   * @param {string} password - password in plain-text
   * @param {string} salt - a salt
   * @param {string} dbHash - an existing hash
   * @return {boolean} true if hash is equivalent to password with salt hash
   */
function verifyHash(password, salt, dbHash) {
  const tmpHash = hash(password, salt);
  return dbHash === tmpHash;
}

/**
   * Returns a randomly generated salt
   * @return {string} salt - a randomly generated salt
   */
function generateSalt() {
  return crypto.randomBytes(16).toString('base64');
}

/**
   * Hashes a password with a given salt
   * @param {string} password - password in plain-text
   * @param {string} salt - a salt
   * @return {string} hash - a generated hash for the provided password and salt
   */
function hash(password, salt) {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512');
  return hash.toString('hex');
}

const User = mongoose.model('User', userSchema);

module.exports = User;
