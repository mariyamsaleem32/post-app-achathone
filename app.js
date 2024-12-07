import { 
  auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  sendEmailVerification, 
  signOut, 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs 
} from "./firebase.js";

const db = getFirestore();

const validateEmail = (email) => {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,}$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*@).{8,}$/;
  return passwordRegex.test(password);
};

// Sign Up Function
let signUp = async (event) => {
    event.preventDefault();

    let fullName = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let conPassword = document.getElementById("con_password").value;
   

    if (!validateEmail(email)) {
      alert("Invalid email format.");
      return;
  }
  if (!validatePassword(password)) {
      alert("Password must contain at least 8 characters, including a number, an uppercase letter, and a special character.");
      return;
  }
  if (password !== conPassword) {
      alert("Passwords do not match.");
      return;
  }

  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Successfully Signed Up", user);

    // Send email verification
    try {
      await sendEmailVerification(auth.currentUser);
      console.log("Email verification sent!");

      // Show alert that email verification was sent successfully
      alert("Sign Up Successful! A verification email has been sent.");

      // go to index directly
      window.location.href = "index.html"

    } catch (error) {
      console.error("Error sending email verification:", error);
      alert("Failed to send verification email. Please try again.");
    }

    // Firestore operation - Add user data to Firestore
    try {
      const docRef = await addDoc(collection(db, "users"), {
        email: user.email,
        uid: user.uid,
      });
      console.log("Document written with ID:", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }

  } catch (error) {
    const errorCode = error.code;
    console.log("Error in SignUp:", errorCode);

    // Show alert if there's an error during sign-up
    alert("Sign Up Failed! Please try again.");
  }
};

// Event Listener for Sign Up
document.getElementById("signup_btn").addEventListener("click", signUp);

// Sign In Function
let signIn = async () => {
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  if (!validateEmail(email)) {
    alert("Invalid email format.");
    return;
}
if (!validatePassword(password)) {
    alert("Password must contain at least 8 characters, including a number, an uppercase letter, and a special character.");
    return;
}

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Login Successfully", user);
    alert("Sign In Successful!");
    window.location.href = "index.html"
  } catch (error) {
    const errorCode = error.code;
    console.log("Error in SignIn:", errorCode);

    // Show alert on error during sign-in
    alert("Sign In Failed! Please check your credentials.");
  }
};

// Event Listener for Sign In
document.getElementById("signin_btn").addEventListener("click", signIn);

// Authentication State Listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;
    console.log(uid, "Already logged In");
    // Redirect to dashboard or another page
    // window.location.href = "./dashboard.html";
  } else {
    console.log("No User Here");
  }
});

//google signin
const googleSignin = () => {
  signInWithPopup(auth, provider)
      .then((result) => {
          const user = result.user;
          alert("User signed in successfully");
          window.location.href = "main.html"; // Redirect to your main page
      })
      .catch((error) => {
          const errorMessage = error.message;
          console.error("Error during Google sign-in:", error);
          alert(`You are not Registered ${errorMessage}`);
      });
};

document.getElementById("google-btn").addEventListener("click", googleSignin)

//for forget password//
const forgetPass = (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  if (!validateEmail(email)) {
      alert("Invalid email format.");
      return;
  }

  sendPasswordResetEmail(auth, email)
      .then(() => {
          alert("Password reset email sent! Check your inbox.");
      })
      .catch((error) => {
          console.error("Error sending password reset email:", error);
          alert("An error occurred: " + error.message);
      });
    }
    document.getElementById("forget_pass").addEventListener("click", forgetPass)

// Sign Out Function
let signOutHandler = () => {
  signOut(auth)
    .then(() => {
      console.log("Sign-out successful");

      // Show alert on successful sign-out
      alert("You have successfully signed out.");
    })
    .catch((error) => {
      console.log("Error during sign-out", error);

      // Show alert on error during sign-out
      alert("Sign Out Failed! Please try again.");
    });
};

// Event Listener for Sign Out
document.getElementById("sign_out").addEventListener("click", signOutHandler);

// Firestore Read Operation - Fetch Users Data
let getUsers = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));
  querySnapshot.forEach((doc) => {
    console.log(doc.id, " => ", doc.data()); // Log user data
  });
};

// Fetch Users (this would be used to display data in UI or handle further)
getUsers();