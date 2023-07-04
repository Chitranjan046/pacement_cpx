const Student = require('../models/studentSchema');

// Render home page
module.exports.homePage = async (req, res) => {
  try {
    const students = await Student.find({});
    return res.render('home', { students });
  } catch (error) {
    console.log(`Error in rendering home page: ${error}`);
    return res.redirect('back');
  }
};
