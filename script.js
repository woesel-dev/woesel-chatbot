const chatBox = document.getElementById("chat-box");

let isTyping = false;
let typingTimeout = null;

// Typing sound (short click per character)
const typingSoundSrc = "assets/sounds/typing.mp3";

// ------------------ ADD MESSAGE ------------------
function addMessage(sender, text, isBot = false) {
  const msg = document.createElement("div");
  msg.classList.add("message");

  if (isBot) {
    msg.classList.add("bot");

    // Robot icon
    const botIcon = document.createElement("img");
    botIcon.src = "assets/robot.png";
    botIcon.alt = "Bot";
    botIcon.classList.add("bot-icon");
    msg.appendChild(botIcon);

    // Text span for typing effect
    const msgText = document.createElement("span");
    msg.appendChild(msgText);

    // Typing effect
    let i = 0;
    isTyping = true;

    function typeWriter() {
      if (!isTyping) return;

      if (i < text.length) {
        msgText.textContent += text.charAt(i);

        // play sound for each char
        playTypingSound();

        i++;
        // random delay between 40–100ms
        typingTimeout = setTimeout(typeWriter, 40 + Math.random() * 60);
      } else {
        isTyping = false;
        typingTimeout = null;
      }
    }

    typeWriter();
  } else {
    msg.classList.add("user");
    msg.textContent = "You: " + text;
  }

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ------------------ SEND MESSAGE ------------------
function sendMessage() {
  const userInput = document.getElementById("user-input");
  const message = userInput.value.trim();
  if (message === "") return;

  addMessage("user", message, false);
  playSound("assets/sounds/send.mp3");
  userInput.value = "";

  fetch("http://127.0.0.1:5000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  })
    .then((response) => response.json())
    .then((data) => {
      addMessage("", data.reply, true);
    })
    .catch((error) => {
      addMessage("", "Error connecting to backend.", true);
      console.error(error);
    });
}

// ------------------ STOP MESSAGE ------------------
function stopMessage() {
  if (isTyping) {
    stopTyping(); // stop typing effect + sounds
    playSound("assets/sounds/Stop.mp3");

    // Find last bot message
    const lastBotMessage = chatBox.querySelector(".message.bot:last-child span");
    if (lastBotMessage) {
      applyGlitchEffect(lastBotMessage, 6); // glitch last 6 chars
    }

    // Add interruption message
    addMessage("", "What happened? Anything else you want to add?", true);
  }
}

// ------------------ APPLY GLITCH ------------------
function applyGlitchEffect(element, glitchCount = 10) {
  let text = element.innerText;
  let safeText = text.slice(0, -glitchCount);
  let glitchText = text.slice(-glitchCount);

  // Wrap each char with span.glitch and progressive index
  let wrapped = glitchText
    .split("")
    .map((char, i) => `<span class="glitch" style="--i:${i + 1}">${char}</span>`)
    .join("");

  element.innerHTML = safeText + wrapped;
}

// ------------------ RESET CHAT ------------------
function resetChat() {
  fetch("http://127.0.0.1:5000/reset", {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data.message);

      // Clear chat box visually
      chatBox.innerHTML = "";
      playSound("assets/sounds/reset.mp3");

      // Add system note
      const resetMsg = document.createElement("div");
      resetMsg.classList.add("message", "bot");
      resetMsg.textContent = "🧹 Conversation has been reset.";
      chatBox.appendChild(resetMsg);
    })
    .catch((error) => {
      console.error("Error resetting chat:", error);
    });
}

// ------------------ SOUND HELPERS ------------------
function playSound(src) {
  const sound = new Audio(src);
  sound.play();
}

// short click sound for each character
function playTypingSound() {
  const click = new Audio(typingSoundSrc);
  click.volume = 0.05;
  click.play();
}

// stop typing effect
function stopTyping() {
  isTyping = false;
  if (typingTimeout) {
    clearTimeout(typingTimeout);
    typingTimeout = null;
  }
}
