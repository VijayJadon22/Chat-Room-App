const socket = io.connect("http://localhost:7001");

const messageBox = document.querySelector(".message-box");
const inputField = document.getElementById("message-input");
const sendBtn = document.getElementById("sendBtn");
const userDisplay = document.getElementById("right-part");

var audio = new Audio("message-alert-190042.mp3");


// creating a typing timeout variable
let typingTimeout;

// Function to emit stop typing event 
function stopTyping() {
    socket.emit("stopTyping");
};

function formatTime(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return hours + ":" + minutes;
}


// taking username by prompt and emitting it to the server
const userName = prompt("Enter your name");
if (userName && userName.trim() != "") {
    socket.emit("userName", userName);
}

sendBtn.addEventListener("click", () => {
    const userMessage = inputField.value.trim();
    if (!userMessage || userMessage == "") {
        return;
    };

    const messageObject = {
        userMessage: userMessage,
        userName: userName,
        timestamp: new Date(),
    }

    // emit the user message to server
    socket.emit("userMessage", messageObject);

    const outerDiv = document.createElement("div");
    outerDiv.classList.add("right");
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    const timePara = document.createElement("p");
    timePara.classList.add("timestamp");
    timePara.textContent = formatTime(messageObject.timestamp);

    const msgPara = document.createElement("p");
    msgPara.textContent = userMessage;
    // messageDiv.appendChild(namePara);
    messageDiv.appendChild(msgPara);

    outerDiv.appendChild(timePara);
    outerDiv.appendChild(messageDiv);

    messageBox.appendChild(outerDiv);

    // Clear the input field after sending the message 
    inputField.value = "";

});

//new messsage from the server
socket.on("serverMessage", (messageObject) => {
    console.log(messageObject);
    const outerDiv = document.createElement("div");
    outerDiv.classList.add("left");
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    const namePara = document.createElement("p");
    namePara.classList.add("displayName");
    namePara.textContent = messageObject.userName.split(" ")[0];

    const timePara = document.createElement("p");
    timePara.classList.add("timestamp");
    timePara.textContent = formatTime(new Date(messageObject.timestamp));

    messageDiv.appendChild(namePara);

    const msgPara = document.createElement("p");
    msgPara.textContent = messageObject.userMessage;
    messageDiv.appendChild(msgPara);

    outerDiv.appendChild(timePara);
    outerDiv.appendChild(messageDiv);

    messageBox.appendChild(outerDiv);
    audio.play().catch(error => console.error("Error playing auido: ", error));
});

//new user joined the chat
socket.on("newUser", (name) => {
    const newUserDiv = document.createElement("div");
    newUserDiv.classList.add("center");
    newUserDiv.innerText = `${name} joined the chat!`;
    messageBox.appendChild(newUserDiv);
});

//if user disconnects it will be displayed
socket.on("userDisconnected", (name) => {
    if (name != null) {
        const newUserDiv = document.createElement("div");
        newUserDiv.classList.add("center");
        newUserDiv.innerText = `${name} just left the chat!`;
        messageBox.appendChild(newUserDiv);
    }
});

// Display Online users
socket.on("onlineUsers", (users) => {
    userDisplay.innerHTML = "";
    userDisplay.innerHTML = `<h1 id="user-heading">Active Users: ${users.length}</h1>`;

    users.forEach(user => {
        const userDiv = document.createElement("div");
        userDiv.classList.add("nameStyle");
        userDiv.innerHTML = `<img src="https://th.bing.com/th/id/OIP.1oYMAvXA8eaaRvWbCGgjhwHaHa?rs=1&pid=ImgDetMain" alt="activelogo" width="25px" srcset=""> ${user}`;

        userDisplay.appendChild(userDiv);
    });
});


// Event listener for when the user starts typing 
inputField.addEventListener("input", () => {
    socket.emit("typing");

    // Clear the previous timeout and set a new one 
    clearTimeout(typingTimeout); /*will keep on clearing previous timeout as users 
                                   press any key the event will be caught*/

    typingTimeout = setTimeout(stopTyping, 2000); // 2 seconds delay
});

// catching the typing message broadcasted to display to users
socket.on("userTyping", (name) => {
    const divExists = document.getElementById(`typing-${name}`);
    if (!divExists) {
        const userTypingDiv = document.createElement("div");
        userTypingDiv.id = `typing-${name}`;
        userTypingDiv.classList.add("message", "left");
        userTypingDiv.innerText = `${name} is typing...`;
        messageBox.appendChild(userTypingDiv);
    }
});

socket.on("userStopTyping", (name) => {
    const userTypingDiv = document.getElementById(`typing-${name}`);
    if (userTypingDiv) {
        messageBox.removeChild(userTypingDiv);
    }
});


// load chat History
socket.on("chatHistory", (messages, currentUserName) => {
    messages.forEach(message => {
        const outerDiv = document.createElement("div");
        const messageDiv = document.createElement("div");
        const namePara = document.createElement("p");
        const timePara = document.createElement("p");
        const msgPara = document.createElement("p");

        if (message.userName == currentUserName) {
            outerDiv.classList.add("right");
            namePara.textContent = currentUserName.split(" ")[0];
        } else {
            outerDiv.classList.add("left");
            namePara.textContent = message.userName.split(" ")[0];
        }
        messageDiv.classList.add("message");
        namePara.classList.add("displayName");
        timePara.classList.add("timestamp");

        
        timePara.textContent = formatTime(new Date(message.timestamp));
        msgPara.textContent = message.message;

        messageDiv.appendChild(namePara);
        messageDiv.appendChild(msgPara);

        outerDiv.appendChild(timePara);
        outerDiv.appendChild(messageDiv);

        messageBox.appendChild(outerDiv);

    });
});


