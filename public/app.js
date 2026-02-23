const getChatId = () => {
    const parts = window.location.pathname.split("/");
    return parts[2] || null;
};

let chatId = getChatId();

if (!chatId) {
    // Redirect to a new chat with a random ID
    const newId = crypto.randomUUID().replace(/-/g, "").slice(0, 24);
    window.location.href = `/chat/${newId}`;
}

const loadChat = async () => {
    const res = await fetch(`/api/chat/${chatId}`);
    const data = await res.json();
    renderMessages(data.messages || []);
}

const renderMessages = messages => {
    const container = document.getElementById("messages");
    container.innerHTML = "";

    messages.forEach(m => {
        const div = document.createElement("div");
        div.className = m.role;
        div.textContent = m.content;
        container.appendChild(div);
    });
};

const sendMessage = async () => {
    const input = document.getElementById("messageInput");

    const res = await fetch(`/api/chat/${chatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input.value })
    });
    const data = await res.json();
    if (data.chatId && data.chatId !== chatId) {
        chatId = data.chatId;
        window.history.replaceState(null, "", `/chat/${chatId}`);
    }

    input.value = "";
    loadChat();
};

loadChat();
