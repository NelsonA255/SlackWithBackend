
let myMessageId = "";

function changeChannel(e) {
  let activeChannel = document.querySelector(".active");

  if (activeChannel) {
    activeChannel.classList.remove("active");
  }

  e.currentTarget.classList.add("active");

  populateMessages(e.currentTarget.getAttribute("data-channel"));

  document.querySelector("#channel-title").innerText =
    e.currentTarget.innerText;
}

// Get and display messages for the selected channel.
async function populateMessages(chat) {
  document.querySelectorAll(".message").forEach((item) => item.remove());
  let template = document.querySelector("template");

  try {
    // Get messages from the API.
    let response = await fetch(`https://slackclonebackendapi.onrender.com/messages?channelId=${chat}`);
    let messages = await response.json();

    // Display each message.
    for (let message of messages) {

      // Get the sender's information.
      let userResponse = await fetch(`https://slackclonebackendapi.onrender.com/users?id=${message.senderId}`);
      let users = await userResponse.json();

      // Create a copy of the message template.
      let newMessage = template.content.cloneNode(true);

      // Add the sender's name and message text.
      newMessage.querySelector(".sender").innerText = users[0].name + ":";
      newMessage.querySelector(".text").innerText = message.content;

      // Style the message we just sent.
      if (message.id === myMessageId) {
        newMessage.querySelector(".message").classList.add("self");
      }

      // Add the message to the chat window.
      document.querySelector("#chat-messages").appendChild(newMessage);
    }

  } catch (error) {
    console.log("Error loading messages:", error);
  }
}

// Send a new message to the backend.
async function sendMessage() {
  let input = document.querySelector("#message-input");
  let messageText = input.value.trim();

  // Do not send empty messages.
  if (messageText === "") {
    return;
  }

  // Find the selected channel.
  let activeChannel = document.querySelector(".channel.active");

  if (!activeChannel) {
    alert("Please select a channel first.");
    return;
  }

  let channelId = activeChannel.getAttribute("data-channel");

  // Choose a random user ID from the three known users.
  let randomUserId = Math.floor(Math.random() * 3) + 1;

  // Prepare the message for the API.
  let newMessage = {
    channelId: channelId,
    senderId: String(randomUserId),
    content: messageText,
    timestamp: new Date().toISOString()
  };

  try {
    // Send the message using POST.
    let response = await fetch("https://slackclonebackendapi.onrender.com/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newMessage)
    });

    if (!response.ok) {
      throw new Error("Message could not be sent.");
    }

    // Read the saved message returned by the backend.
    let savedMessage = await response.json();
    myMessageId = savedMessage.id;

    // Clear the input box.
    input.value = "";

    // Reload the messages.
    await populateMessages(channelId);

  } catch (error) {
    console.log("Error sending message:", error);
    alert("Message could not be sent. Please try again.");
  }
}

// Get and display the channels.
async function init() {

  try {
    // Get channels from the API.
    let response = await fetch("https://slackclonebackendapi.onrender.com/channels");
    let channels = await response.json();

    // Create a button for each channel.
    for (let channel of channels) {
      let button = document.createElement("button");
      button.classList.add("channel");
      button.setAttribute("data-channel", channel.id);
      button.innerText = channel.name;

      // Add the button to the channel list.
      document.querySelector(".channel-list").appendChild(button);
    }

  } catch (error) {
    console.log("Error loading channels:", error);
  }

  // Add click events to the channel buttons.
  document
    .querySelectorAll(".channel")
    .forEach((item) => item.addEventListener("click", changeChannel));
}

// Run sendMessage when the Send button is clicked.
document.querySelector("#chat-form button").addEventListener("click", sendMessage);

// Start the application.
init();
