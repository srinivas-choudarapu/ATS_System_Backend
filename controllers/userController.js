const supabase = require("../config/supabaseClient");



// SIGNUP
const signup = async (req, res) => {
  try {
    const { email, password} = req.body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password
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

    // 🍪 set cookie
    res.cookie("token", data.session.access_token, {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
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
  res.clearCookie("token");

  res.json({
    message: "Logged out successfully"
  });
};




module.exports = {
  signup,
  login,
  logout
};