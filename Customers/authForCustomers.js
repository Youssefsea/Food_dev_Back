const data = require("../data/data");
const bcryptJs = require("bcryptjs");
const { createToken } = require("../middelware/jwtmake");


const signupForCustomer = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
if(role==='restaurant')
{

  return res.status(400).json({ error: "Invalid role" });
}


if(role!=='customer' && role!=='admin')
{
    return res.status(400).json({ error: "Invalid role" });
}

    const [userExists] = await data.query(
      "SELECT * FROM users WHERE email=? OR phone=?",
      [email, phone]
    );

    if (userExists.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashPassword = await bcryptJs.hash(password, 11);

    await data.query(
      "INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashPassword, role, phone]
    );

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const loginForCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [userRows] = await data.query("SELECT * FROM users WHERE email=?", [email]);

    if (userRows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = userRows[0];
if(user.role!=='customer')
{
    return res.status(403).json({ error: "Access denied. Not a customer account." });
}

    const isPasswordValid = await bcryptJs.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password" });
    }


const token = createToken({id: user.id, role: user.role, name: user.name, email: user.email});
console.log("Generated token:", token);

res.cookie('token', token, {
    httpOnly: true,
    secure: true,

    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000
});
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        token: token
      },
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};



const getProfile=async(req,res)=>
    {

    try{
        const user=req.user.id;
        const [userRows]=await data.query("SELECT id,name,email,role,phone FROM users WHERE id=?", [user]);
        if(userRows.length===0)
        {
            return res.status(404).json({error:"User not found"});
        }
        

        return res.status(200).json({user:userRows[0]});
    }
    catch(err)
    {
        console.error("Error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};


const changeUserInfoForCustomer=async(req,res)=>
{
try
{
    const userId=req.user.id;
    if(req.user.role !== 'customer')
    {
        return  res.status(403).json({error:"Access denied. Only customers can change their info."});
    }
    const {name,phone}=req.body;

if(!name || !phone)
{
    return res.status(400).json({error:"Name or phone are required"});
}


    await data.query("UPDATE users SET name=?, phone=? WHERE id=?", [name, phone, userId]);
    console.log(`User info updated for user ID ${userId}: name=${name}, phone=${phone}`);

    return res.status(200).json({message:"User info updated successfully", name, phone });

}
catch(err)
{
    console.error("Error:", err);
    return res.status(500).json({ error: "Internal server error" });


}
};

const loginForAdmin=async(req,res)=>
{
  try
  {

    const {email,password}=req.body;

    const [userRows]=await data.query("SELECT * FROM users WHERE email=?", [email]);
    if(userRows.length===0)
    {
        return res.status(400).json({error:"Invalid email or password"});
    }
    const admin=userRows[0];
    if(admin.role!=='admin')
    {
        return res.status(403).json({error:"Access denied. Not an admin account."});
    }
    const isPasswordValid=await bcryptJs.compare(password,admin.password);
    if(!isPasswordValid)
    {
        return res.status(400).json({error:"Invalid email or password"});
    }
    const token=createToken({id:admin.id,role:admin.role,name:admin.name,phone:admin.phone,email:admin.email});

    return res.status(200).json({
        message: "Login successful",
        user: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            phone: admin.phone,
            token: token
        }
    });
  }catch(err)
  {
    console.error("Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { loginForCustomer, signupForCustomer, getProfile, changeUserInfoForCustomer, loginForAdmin };
