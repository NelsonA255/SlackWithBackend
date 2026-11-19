
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
    console.log("Messages from API:", messages);

    console.log(messages);

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
      // Add the message to the chat window.
      document.querySelector("#chat-messages").appendChild(newMessage);
    }

  } catch (error) {
    console.log("Error loading messages:", error);
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

// Start the application.
init();