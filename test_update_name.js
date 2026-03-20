import axios from "axios";

async function test() {
  try {
    const signup = await axios.post("http://localhost:5000/api/auth/signup", {
      name: "Leena Test",
      email: "leena.test2@example.com",
      password: "password123",
      age: 25
    });
    
    const token = signup.data.token;
    console.log("Signup Token:", token);
    
    const update = await axios.put("http://localhost:5000/api/users/profile", {
      name: "Leena Changed"
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("Updated user:", update.data.name);
    
    const profile = await axios.get("http://localhost:5000/api/users/profile", {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("Fetched user:", profile.data.name);
    
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}

test();
