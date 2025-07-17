document.addEventListener("DOMContentLoaded", () => {
  const timeline = document.getElementById("timeline");
  const yearIndex = document.getElementById("year-index");
  const searchInput = document.getElementById("search");

  let expandedEvent = null;

  function expandEvent(card) {
    if (expandedEvent && expandedEvent !== card) {
      expandedEvent.classList.remove("expanded");
    }
    card.classList.add("expanded");
    expandedEvent = card;
  }

  fetch("data/events.json")
    .then((res) => res.json())
    .then((events) => {
      events.sort((a, b) => new Date(b.date) - new Date(a.date));

      const years = new Set();

      events.forEach((event, i) => {
        const eventYear = new Date(event.date).getFullYear();
        years.add(eventYear);

        const card = document.createElement("div");
        card.className = "event";
        card.dataset.title = event.title.toLowerCase();
        card.dataset.body = event.body.toLowerCase();
        card.dataset.year = eventYear;
        card.id = `event-${i}`;

        const title = document.createElement("h2");
        title.textContent = `${event.date} — ${event.title}`;

        const body = document.createElement("div");
        body.className = "body";
        body.innerHTML = `<p>${event.body}</p>`;

        // Add images
        if (event.images && event.images.length > 0) {
          event.images.forEach((img) => {
            const image = document.createElement("img");
            image.src = `img/${img}`;
            image.alt = event.title;
            body.appendChild(image);
          });
        }

        // Add sources
        if (event.sources && event.sources.length > 0) {
          const sourcesHeader = document.createElement("strong");
          sourcesHeader.textContent = "Sources:";
          body.appendChild(sourcesHeader);

          const sourcesList = document.createElement("ul");
          sourcesList.className = "sources";

          event.sources.forEach((source, index) => {
            const sourceItem = document.createElement("li");
            const sourceLink = document.createElement("a");
            sourceLink.href = source;
            sourceLink.textContent = source;
            sourceLink.target = "_blank";
            sourceItem.appendChild(sourceLink);
            sourcesList.appendChild(sourceItem);
          });

          body.appendChild(sourcesList);
        }

        card.appendChild(title);
        card.appendChild(body);
        timeline.appendChild(card);
      });

      // Expand on click
      document.querySelectorAll(".event").forEach((card) => {
        card.addEventListener("click", () => {
          const isExpanded = card.classList.contains("expanded");
          if (isExpanded) {
            card.classList.remove("expanded");
            expandedEvent = null;
          } else {
            expandEvent(card);
          }
        });
      });

      // Group events by year
      const eventsByYear = {};
      events.forEach((event, i) => {
        const year = new Date(event.date).getFullYear();
        if (!eventsByYear[year]) eventsByYear[year] = [];
        eventsByYear[year].push({ ...event, id: `event-${i}` });
      });

      const sortedYears = Object.keys(eventsByYear).sort((a, b) => b - a);
      sortedYears.forEach((year) => {
        const yearSection = document.createElement("div");
        yearSection.className = "year-group";

        const toggle = document.createElement("button");
        toggle.className = "year-toggle";
        toggle.textContent = year;
        toggle.setAttribute("aria-expanded", "false");

        const eventList = document.createElement("ul");
        eventList.className = "event-list";
        eventList.style.display = "none";

        eventsByYear[year].forEach((evt) => {
          const li = document.createElement("li");
          const link = document.createElement("a");
          link.href = "#";
          link.textContent = evt.title;
          link.addEventListener("click", (e) => {
            e.preventDefault();
            const target = document.getElementById(evt.id);
            if (target) {
              target.scrollIntoView({ behavior: "smooth", block: "start" });
              expandEvent(target); // expand on scroll
            }
          });
          li.appendChild(link);
          eventList.appendChild(li);
        });

        toggle.addEventListener("click", () => {
          const expanded = toggle.getAttribute("aria-expanded") === "true";
          toggle.setAttribute("aria-expanded", String(!expanded));
          eventList.style.display = expanded ? "none" : "block";
        });

        yearSection.appendChild(toggle);
        yearSection.appendChild(eventList);
        yearIndex.appendChild(yearSection);
      });

      // Search filter
      searchInput.addEventListener("input", () => {
        const q = searchInput.value.toLowerCase();
        document.querySelectorAll(".event").forEach((card) => {
          const match =
            card.dataset.title.includes(q) || card.dataset.body.includes(q);
          card.style.display = match ? "" : "none";
        });
      });

      // Last updated label
      const updated = document.getElementById("last-updated");
      if (events.length > 0 && updated) {
        updated.textContent = new Date(events[0].date).toLocaleDateString();
      }
    });
});
