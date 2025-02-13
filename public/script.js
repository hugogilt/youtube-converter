document.getElementById("convert").addEventListener("click", () => {
    const url = document.getElementById("url").value;
    if (!url) {
        alert("Por favor, introduce una URL válida.");
        return;
    }

    const status = document.getElementById("status");
    status.textContent = "Procesando...";

    window.location.href = `/download?url=${encodeURIComponent(url)}`;
});
