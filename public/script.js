const socket = io();
/*
https://socket.io/docs/v4
If your front is served on the same domain as your server, you can simply use:
const socket = io();
The server URL will be deduced from the window.location object.

In case your front is not served from the same domain as your server, you have to pass the URL of your server.

const socket = io("https://server-domain.com");
In that case, please make sure to enable Cross-Origin Resource Sharing (CORS) on the server.
*/

const clientsTotal = document.getElementById("clients-total");

const messageContainer = document.getElementById("message-container");
const nameInput = document.getElementById("name-input");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const messageTone = new Audio("/msg-audio.mp3");
messageForm.addEventListener("submit", (e) => {
  e.preventDefault(); //to prevent reloading the page and prevernting default behaviour of form submission
  sendMessage();
});

function sendMessage() {
  // console.log(messageInput.value);
  if (messageInput.value === "") return; //in case of empty message,return
  const data = {
    name: nameInput.value,
    message: messageInput.value,
    dateTime: new Date(),
  };
  socket.emit("message", data);
  addMessageToUI(true, data);
  messageInput.value = "";
}

function addMessageToUI(isOwnMessage, data) {
  clearFeedback();
  const element = `
      <li class= ${isOwnMessage ? "message-right" : "message-left"}>
          <p class="message">
            ${data.message}
            <span>${data.name} ● ${moment(data.dateTime).fromNow()}</span>
          </p>
        </li>
        `;

  messageContainer.innerHTML += element;
  scrollToBottom();
}

function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

//lisetening on event named clients-total as soon as server emits these event client will listen the event and this callback function will be executed.
socket.on("clients-total", (data) => {
  clientsTotal.innerText = `Total Clients: ${data}`;
});

socket.on("chat-message", (data) => {
  messageTone.play();
  addMessageToUI(false, data);
});

messageInput.addEventListener("focus", (e) => {
  socket.emit("feedback", {
    feedback: `✍️ ${nameInput.value} is typing a message`,
  });
});

messageInput.addEventListener("keypress", (e) => {
  socket.emit("feedback", {
    feedback: `✍️ ${nameInput.value} is typing a message`,
  });
});
messageInput.addEventListener("blur", (e) => {
  socket.emit("feedback", {
    feedback: "",
  });
});

socket.on("feedback", (data) => {
  clearFeedback();
  const element = `
        <li class="message-feedback">
          <p class="feedback" id="feedback">${data.feedback}</p>
        </li>
  `;
  messageContainer.innerHTML += element;
});

function clearFeedback() {
  document.querySelectorAll("li.message-feedback").forEach((element) => {
    element.parentNode.removeChild(element);
  });
}
