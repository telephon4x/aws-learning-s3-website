document.addEventListener("DOMContentLoaded", () => {
    const searchBar = document.getElementById("searchBar");
    searchBar.addEventListener("keyup", () => {
        const query = searchBar.value.toLowerCase();
        document.querySelectorAll("section").forEach(section => {
            const text = section.textContent.toLowerCase();
            section.style.display = text.includes(query) ? "block" : "none";
        });
    });
});
