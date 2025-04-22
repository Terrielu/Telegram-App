function search() {
  const query = document.getElementById("queryInput").value;
  fetch("http://localhost:8000/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt: query }),
  })
    .then((res) => res.json())
    .then((data) => {
      const result = data.result || data.error;
      document.getElementById("result").innerText = result;
    });
}

function startVoiceInput() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "ru-RU";
  recognition.start();
  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById("queryInput").value = transcript;
  };
}
