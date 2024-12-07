// Function to handle the post creation
function post() {
    // Get the title and description input values
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
  
    // Check if the title and description are provided
    if (title === "" || description === "") {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Both title and description are required!',
      });
      return; // Exit if inputs are empty
    }
  
    // Create the post content
    const postContainer = document.getElementById("post");
  
    // Create a new div for the post
    const newPost = document.createElement("div");
    newPost.classList.add("card");
    newPost.classList.add("p-3");
    newPost.classList.add("mb-3");
  
    // Set the post's HTML content
    newPost.innerHTML = `
      <h4>${title}</h4>
      <p>${description}</p>
      <p><small>Posted just now</small></p>
    `;
  
    // Add the new post to the post container
    postContainer.appendChild(newPost);
  
    // Clear the input fields after posting
    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
  
    // Optionally, show a success alert
    Swal.fire({
      icon: 'success',
      title: 'Post Created!',
      text: 'Your post has been created successfully.',
    });
  }