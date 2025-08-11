(() => {
  const comicFiles = [
    {
      title: "BattleBeast 1",
      filePath: "/books/BattleBeast_01_EarlyReview_WM_1.pdf",
      fileType: "PDF",
      cover: "/images/comics/BattleBeast_01_4tgPtg_Cover_RGB.jpg",
      teaser: "The beast is back — and this time the city won’t survive the fallout."
    },
    {
      title: "G.I. Joe #9",
      filePath: "/books/GIJoe09_REVIEW_WM.pdf",
      fileType: "PDF",
      cover: "/images/news/GIJoe09A_Cover_RGB (2).jpg",
      teaser:"Baroness and Cover Girl are about to find out as they fight for their lives!"
    },
    {
      title: "Blood & Thunder #2",
      filePath: "/books/B&T Issue 2.pdf",
      fileType: "PDF",
      cover: "/images/comics/BnT_02A_Cover_RGB (2).jpg",
      teaser: "Can Thunder silence the bloodshed before it’s too late?"
    },
    {
      title: "Ultramega #9",
      filePath: "/books/Ultramega09_Review)WM.pdf",
      fileType: "PDF",
      cover: "/images/comics/Ultramega09A_Cover_RGB.jpg",
      teaser: "The series finale"
    },
    {
      title: "Ghost Pepper #1",
      filePath: "/books/GhostPepper01_WM_UPDATED.pdf",
      fileType: "PDF",
      cover: "/images/comics/GhostPepper01C_Cover_RGB (4).jpg",
      teaser: "The debut issue of the explosive new action series about forgotten heroes, cutthroat food trucks, and saving the world...again."
    }
  ];

  const comicLibrary = [
    { title: "Transformers #20", img: "/images/news/Transformers26C_Cover_RGB (2).jpg", url: "/books/Transformers_20_Review_WM.pdf" },
    { title: "BattleBeast #3", img: "/images/news/BattleBeast04_CoverD_RGB (1).jpg", url: "#" },
    { title: "Neon Samurai", img: "images/comics/neon.jpg", url: "#" },
    { title: "Cyber Jungle", img: "images/comics/cyber.jpg", url: "#" }
  ];

  let currentPages = [];
  let currentIndex = 0;

  function populateComics() {
    const grid = document.getElementById("comicGrid");
    grid.innerHTML = "";

    comicFiles.forEach(comic => {
      const card = document.createElement("div");
      card.className = "comic-card";
      card.innerHTML = `
        <img src="${comic.cover}" alt="${comic.title}" />
        <h3>${comic.title}</h3>
      `;
      card.onclick = () => showComicPreview(comic);
      grid.appendChild(card);
    });
  }

  function showComicPreview(comic) {
    const container = document.getElementById("comicContainer");
    const grid = document.getElementById("comicGrid");
    const navBar = document.getElementById("readerNav");

    grid.style.display = "none";
    navBar.style.display = "none";

    container.innerHTML = `
      <div class="comic-preview">
        <img src="${comic.cover}" alt="${comic.title} cover" class="preview-cover" />
        <h2>${comic.title}</h2>
        <p class="teaser">${comic.teaser || "An electrifying story from the neon underbelly of the grid..."}</p>
        <div class="modal-buttons">
          <button id="startReadingBtn">Start Reading</button>
          <button id="backToGridBtn">← Back</button>
        </div>
      </div>
    `;

    document.getElementById("startReadingBtn").onclick = () => {
      openComic(comic);
    };

    document.getElementById("backToGridBtn").onclick = () => {
      document.getElementById("endModal").classList.remove("active");
      container.innerHTML = "";
      grid.style.display = "flex";
    };
  }

  function openComic(comic) {
    console.log(`Opening "${comic.title}" [${comic.fileType}]`);
    if (comic.fileType === "PDF") loadPDF(comic.filePath);
    else if (comic.fileType === "CBR") loadCBR(comic.filePath);
    else alert("Unsupported file type: " + comic.fileType);

    document.getElementById("readerNav").style.display = "flex";
  }

  window.openComic = openComic;

  async function loadPDF(filePath) {
    try {
      const doc = await pdfjsLib.getDocument(filePath).promise;
      const images = [];

      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const viewport = page.getViewport({ scale: 2 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport }).promise;
        images.push(canvas.toDataURL());
      }

      currentPages = images;
      currentIndex = 0;
      displayCurrentPage();
    } catch (err) {
      console.error("PDF load error:", err);
      alert("There was a problem loading the PDF file.");
    }
  }

  function displayCurrentPage() {
    const container = document.getElementById("comicContainer");
    container.innerHTML = "";

    if (currentPages.length === 0) return;

    const img = document.createElement("img");
    img.src = currentPages[currentIndex];
    img.className = "comic-page";
    img.alt = `Page ${currentIndex + 1}`;

    img.onclick = (e) => {
      const bounds = e.target.getBoundingClientRect();
      const clickX = e.clientX - bounds.left;

      if (clickX > bounds.width / 2) {
        if (currentIndex === currentPages.length - 1) {
          showEndModal();
        } else {
          currentIndex++;
          displayCurrentPage();
        }
      } else {
        currentIndex = (currentIndex - 1 + currentPages.length) % currentPages.length;
        displayCurrentPage();
      }
    };

    const indicator = document.createElement("div");
    indicator.className = "page-indicator";
    indicator.textContent = `Page ${currentIndex + 1} of ${currentPages.length}`;

    container.appendChild(img);
    container.appendChild(indicator);
  }

  function getRandomComics(n = 2) {
    const shuffled = comicLibrary.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
  }

  function showEndModal() {
    const recs = getRandomComics();
    const container = document.getElementById("recommendations");
    container.innerHTML = "";

    recs.forEach(comic => {
      const img = document.createElement("img");
      img.src = comic.img;
      img.alt = comic.title;
      img.title = comic.title;
      img.onclick = () => {
        window.location.href = comic.url;
      };
      container.appendChild(img);
    });

    document.getElementById("endModal").classList.add("active");
  }

  window.closeComic = function () {
    document.getElementById("endModal").classList.remove("active");
    document.getElementById("comicContainer").innerHTML = "";
    document.getElementById("comicGrid").style.display = "flex";
    document.getElementById("readerNav").style.display = "none";
  };

  document.getElementById("exitReaderBtn").onclick = window.closeComic;
const slides = [
    {
      image: "/images/Skinbreaker01F_Cover_RGB.jpg",
      title: "Skinbreaker",
      caption: "The All-New Survival Epic from Skybound & Image Comics Debuts September 2025"
    },
    {
      image: "/images/news/GIJoe09A_Cover_RGB (2).jpg",
      title: "G.I. Joe #9",
      caption: "Baroness and Cover Girl fight for survival!"
    },
    {
      image: "/images/news/Covers_Clementine_V3_RGB (2).jpg",
      title: "Clementine Book Three",
      caption: "Tillie Walden hits the road in her newest graphic novel!"
    },
    {
      image: "/images/news/Transformers23A_Cover_RGB-(1).jpg",
      title: "Transformers #23",
      caption: "First Look: Enter the Matrix in TRANSFORMERS #23 By Daniel Warren Johnson and Jorge Corona"
    }
  ];

  let currentSlide = 0;
  const heroImg = document.getElementById("heroImg");
  const heroTitle = document.getElementById("heroTitle");
  const heroCaption = document.getElementById("heroCaption");

  function showSlide(index) {
    const slide = slides[index];
    heroImg.src = slide.image;
    heroImg.alt = slide.title;
    heroTitle.textContent = slide.title;
    heroCaption.textContent = slide.caption;
  }

  setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }, 7000);

  showSlide(currentSlide);
  document.addEventListener("DOMContentLoaded", populateComics);
})();




document.getElementById("showPagesBtn").onclick = () => {
  const modal = document.getElementById("pageSelectorModal");
  const grid = document.getElementById("pageGrid");
  modal.classList.remove("hidden");
  grid.innerHTML = "";

  // Example: Load thumbnails dynamically
  for (let i = 1; i <= comic.totalPages; i++) {
    const thumb = document.createElement("img");
    thumb.src = `${comic.pageThumbs[i - 1]}`; // array of thumbnail URLs
    thumb.alt = `Page ${i}`;
    thumb.onclick = () => {
      openComicPage(comic, i); // Jump to selected page
      modal.classList.add("hidden");
    };
    grid.appendChild(thumb);
  }
};

document.getElementById("closePageSelector").onclick = () => {
  document.getElementById("pageSelectorModal").classList.add("hidden");
};

function openComicPage(comic, pageNumber) {
  // Your logic to render the selected page
  console.log(`Opening page ${pageNumber} of ${comic.title}`);
  // You might update an iframe, canvas, or image viewer here
}
/*
document.addEventListener("DOMContentLoaded", () => {
  let currentIndex = 0;
  const items = document.querySelectorAll('.carousel-item');

  function updateCarousel() {
    items.forEach(item => item.classList.remove('center'));
    items[currentIndex].classList.add('center');
  }

  function moveCarousel(direction) {
    currentIndex += direction;
    if (currentIndex < 0) currentIndex = items.length - 1;
    if (currentIndex >= items.length) currentIndex = 0;
    updateCarousel();
  }

  updateCarousel();

  document.querySelector('.carousel-btn.prev').addEventListener('click', () => moveCarousel(-1));
  document.querySelector('.carousel-btn.next').addEventListener('click', () => moveCarousel(1));
});*/