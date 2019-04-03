const mongoose = require('mongoose');

const statSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      unique: true,
    },
    ign: {
      type: String,
      required: true
    },
    lockMap: [String],
    lockWeapon: [String],
    weapon: {
        type: String,
        required: true
    },
    map: {
        type: String,
        required: true
    },
    lv: Number,
    gold: Number,
    exp: Number,
});

statSchema.statics.createNewStat = async function(email) {
  let existingUser;
  try {
    existingUser = await Stat.findOne({email});
  } catch (e) {
    return console.log(e);
  }

  if (!existingUser) {
    // Create new stat
    const stat = new Stat({
        email: email,
        ign: 'null',
        weapon: 'sword', 
        map: 'grass', 
        lockMap: ['candy', 'castle'],
        lockWeapon: ['gun'],
        lv: 1,
        gold: 0,
        exp: 0});
    let newStat = await stat.save();
    return newStat;
    }
};


const Stat = mongoose.model('Stat', statSchema);
module.exports = Stat;
