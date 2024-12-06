import { auth, createUserWithEmailAndPassword, 
onAuthStateChanged, signInWithEmailAndPassword,
sendPasswordResetEmail,signOut,provider, signInWithPopup,db,collection,
addDoc,GoogleAuthProvider} from "./firebase.js";

let postapp = document.getElementById("post_container");
let backgroundImg = '';

const validateEmail = (email) => {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,}$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*@).{8,}$/;
    return passwordRegex.test(password);
};

// get record of current user
onAuthStateChanged(auth, (user) => {
    if (user) {
        postapp.classList.add("show");
    } else {
        postapp.classList.remove("hide");
    }
    
});

// //for sigin//
const signIn = (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!validateEmail(email)) {
        alert("Invalid email format.");
        return;
    }
    if (!validatePassword(password)) {
        alert("Password must contain at least 8 characters, including a number, an uppercase letter, and a special character.");
        return;
    }
    
    signInWithEmailAndPassword(auth, email, password)
    .then((response) => {
        alert("Account successfully signed in"); 
        if (window.location.href.includes("signin.html")) {
            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000); 
        }
    })
        .catch((error) => {
            alert("Invalid email or password format. Please check your input.");
            console.log("error", error.message);
        });
};


// //for forget password//
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


// //for logout//
const logOut = () => {
    signOut(auth).then(() => {
        alert("Account successfully logged out");
    }).catch((error) => {
        console.error("Error during logout:", error.message);
    });
    
}


//for google signup//
const googleSignup = () => {
        signInWithPopup(auth, provider)
            .then((result) => {  
                const token = GoogleAuthProvider.credentialFromResult(result).accessToken;
                const user = result.user;
                console.log('Token:', token);
                console.log('User:', user);
    
                if (window.location.href.includes("signup.html")) {
                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 2000); 
                } 
            })
            .catch((error) => {
                console.error("Error during Google signup:", error.message);
                alert("Google signup failed: " + error.message);
            });
    };

// //for signup//
const signUp = (event) => {
    event.preventDefault();

    let fullName = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let conPassword = document.getElementById("con_password").value;
    let number = document.getElementById("number").value;
    let userData = { fullName, number, email, password };
    console.log(userData);

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

    createUserWithEmailAndPassword(auth, email, password)
    .then(async (response) => {
      console.log("user", response.user);
      alert("Your Account is successfully signed up");
          // ________________________________Add Doc
      try {
        const docRef = await addDoc(collection(db, "users"), {
          ...userData,
          uId: response.user.uid,
        });
        console.log("Document written with ID: ", docRef.id);
        if (window.location.href.includes("signup.html")) {
            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000); 
        } 
      } catch (e) {
        console.error("Error adding document: ", e);
      }
        })
        .catch((error) => {
            if (error.code === "auth/email-already-in-use") {
                alert("This email is already in use. Please use a different email.");
            } else {
                alert(error.message);
            }
            console.log("error", error.message);
        });
};

const post = () => {
    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const currentTime = new Date().toLocaleTimeString();

    if (title && description) {
        const postingArea = document.getElementById("posting");
        postingArea.innerHTML += `
        <div class="card p-2 mb-2">
            <div class="card-header d-flex">
                <img class="profile-photo" src="${profilePhotoImg.src}" alt="Profile" />
                <div class="name-time d-flex flex-column">
                    ${auth.currentUser.displayName || "Anonymous"}
                    <small>${currentTime}</small>
                </div>
            </div>
            <div style="background-image: url(${backgroundImg})" class="card-body">
                <p>${title}</p>
                <footer>${description}</footer>
            </div>
            <div class="card-footer d-flex justify-content-end">
                <button type="button" onclick="editpost()" class="btn btn-warning">Edit</button>
                <button type="button" onclick="deletePost()" class="btn btn-danger">Delete</button>
            </div>
        </div>`;
        document.getElementById("title").value = '';
        document.getElementById("description").value = '';
    } 
}


    const deletePost = async (buttonElement) => {
        try {
            // Get the parent card of the post
            const postElement = buttonElement.closest(".card");
            const postId = postElement.dataset.postId; // Assuming each post has a unique ID
    
            if (!postId) {
                alert("Unable to find post ID.");
                return;
            }
    
            // Delete the post from Firestore
            await deleteDoc(doc(db, "posts", postId));
            alert("Post deleted successfully!");
    
            // Remove the post element from the DOM
            postElement.remove();
        } catch (error) {
            console.error("Error deleting post:", error.message);
            alert("An error occurred while deleting the post.");
        }
    };
    


    const editPost = (buttonElement) => {
        const postElement = buttonElement.closest(".card");
        const postId = postElement.dataset.postId;
    
        if (!postId) {
            alert("Unable to find post ID.");
            return;
        }
    
        // Fetch the current title and description
        const currentTitle = postElement.querySelector(".card-body p").innerText;
        const currentDescription = postElement.querySelector(".card-body footer").innerText;
    
        // Prompt the user for new values
        const newTitle = prompt("Edit Title:", currentTitle);
        const newDescription = prompt("Edit Description:", currentDescription);
    
        if (newTitle && newDescription) {
            // Update Firestore
            updateDoc(doc(db, "posts", postId), {
                title: newTitle,
                description: newDescription,
            })
                .then(() => {
                    alert("Post updated successfully!");
    
                    // Update the DOM
                    postElement.querySelector(".card-body p").innerText = newTitle;
                    postElement.querySelector(".card-body footer").innerText = newDescription;
                })
                .catch((error) => {
                    console.error("Error updating post:", error.message);
                    alert("An error occurred while updating the post.");
                });
        } else {
            alert("Title and description cannot be empty.");
        }
    };
    


document.addEventListener("DOMContentLoaded", () => {
   const signUpBtn = document.getElementById("signup_btn")
   const signInBtn  = document.getElementById("signin_btn")
   const googleBtn = document.getElementById("google-btn")
   const logoutBtn  = document.getElementById("logout-btn")
   const FP = document.querySelector("p #FP")
  const posted =  document.getElementById("post");
 
   if (signUpBtn) {
    signUpBtn.addEventListener("click", signUp);
   }  
   if (signInBtn) {
    signInBtn.addEventListener("click", signIn);
   }
   if (googleBtn) {
    googleBtn.addEventListener("click", googleSignup);
   }
   if (logoutBtn) {
    logoutBtn.addEventListener("click", logOut);
   }
   if (FP) {
    FP.addEventListener("click", forgetPass);
   }
    if (posted) {
      posted.addEventListener("click", post);
   }
  
 });






