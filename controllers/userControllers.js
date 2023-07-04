const User = require('../models/userSchema');
const Student = require('../models/studentSchema');
const fs = require('fs');
const fastcsv = require('fast-csv');

// Render sign up page
const signup = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('back');
  }
  res.render('signup');
};

// Render sign in page
const signin = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('back');
  }
  res.render('signin');
};

// Create session
const createSession = (req, res) => {
  console.log('Session created successfully');
  return res.redirect('/');
};

// Sign out
const signout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
  });
  return res.redirect('/users/signin');
};

// Create user
const createUser = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  try {
    if (password !== confirmPassword) {
      console.log(`Passwords don't match`);
      return res.redirect('back');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log(`Email already exists`);
      return res.redirect('back');
    }

    const newUser = await User.create({
      name,
      email,
      password,
    });

    if (!newUser) {
      console.log(`Error in creating user`);
      return res.redirect('back');
    }

    console.log(`User created successfully`);
    return res.redirect('/users/signin');
  } catch (error) {
    console.log(`Error in creating user: ${error}`);
    return res.redirect('back');
  }
};

// Download report
const downloadCsv = async (req, res) => {
  try {
    const students = await Student.find({});
    let csvData = [];
    let no = 1;

    // Push headers to the CSV data
    csvData.push([
      'S.No',
      'Name',
      'Email',
      'College',
      'Placement',
      'Contact Number',
      'Batch',
      'DSA Score',
      'Frontend Score',
      'Backend Score',
      'Interview',
      'Date',
      'Result'
    ]);

    for (let student of students) {
      let rowData = [
        no++,
        student.name,
        student.email,
        student.college,
        student.placement,
        student.contactNumber,
        student.batch,
        student.dsa,
        student.fronted,
        student.backend
      ];

      // Push interview data for each student
      for (let interview of student.interviews) {
        rowData.push(interview.company, interview.date.toString(), interview.result);
      }

      csvData.push(rowData);
    }

    // Create a CSV stream and write data to the file
    const csvStream = fastcsv.format({ headers: true });
    csvStream.pipe(fs.createWriteStream('report/data.csv')).on('finish', () => {
      console.log('Report generated successfully');
      return res.download('report/data.csv');
    });
    csvData.forEach((data) => csvStream.write(data));
    csvStream.end();
  } catch (error) {
    console.log(`Error in downloading file: ${error}`);
    return res.redirect('back');
  }
};

// Export the functions
module.exports = {
  signup, 
  signin,
  createSession,
  signout,
  createUser,
  downloadCsv
};
