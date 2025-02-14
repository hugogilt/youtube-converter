document.getElementById("convert").addEventListener("click", async () => {
    const url = document.getElementById("url").value;
    const statusElement = document.getElementById("status"); // Elemento para el mensaje de estado
    if (!url) {
        alert("Por favor, introduce una URL válida.");
        return;
    }

    // Mostrar el modal de carga
    document.getElementById("loadingModal").style.display = "flex";
    
    // Restablecer el estado al iniciar la descarga
    statusElement.textContent = "Iniciando descarga...";
    statusElement.style.color = "black";

    try {
        // Realizar la solicitud al servidor usando fetch
        const response = await fetch(`/download?url=${encodeURIComponent(url)}`);

        if (response.ok) {
            // Esperamos que el archivo se haya descargado exitosamente
            const blob = await response.blob();

            // Crear un enlace de descarga para el archivo
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = response.headers.get('Content-Disposition').split('filename=')[1].replace(/"/g, ''); // Usar el nombre de archivo del servidor
            link.click();

            // Actualizar el mensaje de estado
            statusElement.textContent = "Descarga completada";
            statusElement.style.color = "green"; // Color verde para éxito

            // Ocultar el modal después de iniciar la descarga
            document.getElementById("loadingModal").style.display = "none";
        } else {
            // Si hubo un error en la solicitud
            statusElement.textContent = "No se ha podido completar la descarga";
            statusElement.style.color = "red"; // Color rojo para error
            document.getElementById("loadingModal").style.display = "none";
        }
    } catch (error) {
        console.error("Error en la conversión:", error);
        // En caso de error en la solicitud
        statusElement.textContent = "No se ha podido completar la descarga";
        statusElement.style.color = "red"; // Color rojo para error
        document.getElementById("loadingModal").style.display = "none";
    }
});
