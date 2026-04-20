const supabase = require("../config/supabaseClient");
const supabaseAdmin = require("../config/supabaseAdminClient");
const generateStrongPassword = require("../utils/passwordGeneratorService").generateStrongPassword;
const sendPasswordEmail = require("../services/emailService");



// SIGNUP
const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL}/verify`
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: "User registered successfully",
      user: data.user
    });

  } catch (err) {
    res.status(500).json({ error: "Signup failed" });
  }
};

//login

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    // access set cookie
    res.cookie("access_token", data.session.access_token, {
      httpOnly: true,
      secure: true, // true in production (HTTPS)
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // refresh token cookie
    res.cookie("refresh_token", data.session.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      message: "Login successful",
      user: data.user
    });

  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};

//logout

const logout = (req, res) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");

  res.json({
    message: "Logged out successfully"
  });
};

//send password to email and change password in database


const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // 1️⃣ Get user by email
    const { data: usersData, error: fetchError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (fetchError) {
      return res.status(500).json({ error: fetchError.message });
    }

    const user = usersData.users.find(u => u.email === email);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2️⃣ Generate temp password
    const tempPassword = generateStrongPassword();

    // 3️⃣ Update password using USER ID (correct way)
    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: tempPassword
      });

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    // 4️⃣ Send email
    await sendPasswordEmail(email, tempPassword);

    res.json({
      message: "Temporary password sent to email"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Forgot password failed" });
  }
};



//change password for logged in user
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const access_token = req.cookies.access_token;
    const refresh_token = req.cookies.refresh_token;

    if (!access_token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    //  Set session
    await supabase.auth.setSession({
      access_token,
      refresh_token
    });

    //  Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      return res.status(400).json({ error: userError.message });
    }

    const email = userData.user.email;

    //  Re-authenticate with old password
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password: oldPassword
    });

    if (loginError) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    //  Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.json({
      message: "Password changed successfully"
    });

  } catch (err) {
    res.status(500).json({ error: "Password change failed" });
  }
};




module.exports = {
  signup,
  login,
  logout,
  forgotPassword,
  changePassword
};