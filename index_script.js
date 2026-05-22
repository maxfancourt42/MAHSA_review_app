// Get elements from page 
const reviewerSelect = document.getElementById("reviewer_select")
const reviewerNameDisplay = document.getElementById("reviewer_name")
const exportButton = document.getElementById("export_button");
const reviewProgress = document.getElementById("review_progress");
const startReviewButton = document.getElementById("startreview");

// Attempt to load local storage items, if none then set to defaults
var reviewerId = localStorage.getItem("reviewer_id") || reviewerSelect.selectedIndex;
var reviewerName = localStorage.getItem("reviewer_name") || reviewerSelect.options[reviewerSelect.selectedIndex].text;
var buttonKey = `button_${reviewerId}`;
var times_pressed = localStorage.getItem(buttonKey) || 0;
// Create user specific local storage keys
var reviewsStorageKey = `reviews_${reviewerId}`;
var currentCandidateIndexKey = `cci_${reviewerId}`;
var totalNumberKey = `total_number_${reviewerId}`;
// Attempt to retrieve user specific variables 
var reviews = JSON.parse(localStorage.getItem(reviewsStorageKey)) || [];
var currentCandidateIndex = Number(localStorage.getItem(currentCandidateIndexKey)) || 0;
var total_number = localStorage.getItem(totalNumberKey) || null;
const APP_VERSION = "0.3.1";
const DATASET_VERSION = "2026-05-18-sites-batch-01"


function releaseBalloons() {
    const container = document.getElementById("balloon-container");
    const colours = [
        "#ff6b6b",
        "#ffd93d",
        "#6bcB77",
        "#4d96ff",
        "#b983ff",
        "#ff9f1c"
    ];

    for (let i = 0; i < 30; i++) {
        const balloon = document.createElement("div");
        balloon.classList.add("balloon");

        // ---------- SIZE GROWS WITH CLICKS ----------
        const scale = 1 + (times_pressed * 0.05);

        const width = (30 + Math.random() * 25) * scale;
        const height = width * 1.3;

        balloon.style.width = width + "px";
        balloon.style.height = height + "px";

        // ---------- POSITION ----------
        balloon.style.left = Math.random() * 100 + "vw";

        // ---------- COLOUR ----------
        balloon.style.backgroundColor = colours[Math.floor(Math.random() * colours.length)];

        // ---------- SPEED ----------
        balloon.style.animationDuration = (4 + Math.random() * 4) + "s";

        balloon.style.animationDelay = (Math.random() * 1.5 * (times_pressed * 0.05)) + "s";

        container.appendChild(balloon);

        balloon.addEventListener("animationend", () => {
            balloon.remove();
        });
    }
    // Increment and store 
    times_pressed = Number(times_pressed) + 1;
    localStorage.setItem(buttonKey, times_pressed);
    console.log(times_pressed)
}

function getNumberOfCandidates() {
    //const response = await fetch("candidates.json");
    //candidates = await response.json();
    // total number of candidates 
    total_number = candidates.length
    return total_number
}

function updateStartReviewButton() {

    if (reviews.length > 0) {
        startReviewButton.textContent = "Continue Review";
    } else {
        startReviewButton.textContent = "Start Review";
    }
}

function restoreReviewerSelection() {
    const savedReviewerId = localStorage.getItem("reviewer_id");

    if (savedReviewerId !== null) {
        reviewerSelect.value = savedReviewerId;
    }
}

function UpdateReviewer() {
    reviewerId = reviewerSelect.value;
    reviewerName = reviewerSelect.options[reviewerSelect.selectedIndex].text;

    reviewerNameDisplay.textContent = reviewerName || "None Selected";

    localStorage.setItem("reviewer_id", reviewerId);
    localStorage.setItem("reviewer_name", reviewerName);

    reviewsStorageKey = `reviews_${reviewerId}`;
    currentCandidateIndexKey = `cci_${reviewerId}`;
    totalNumberKey = `total_number_${reviewerId}`;
    buttonKey = `button_${reviewerId}`;

    reviews = JSON.parse(localStorage.getItem(reviewsStorageKey)) || [];
    currentCandidateIndex = Number(localStorage.getItem(currentCandidateIndexKey)) || 0;
    total_number = localStorage.getItem(totalNumberKey) || null;
    times_pressed = localStorage.getItem(buttonKey) || 0;

    if (total_number === null || isNaN(Number(total_number))) {
        //total_number = await getNumberOfCandidates();
        total_number = candidates.length
        localStorage.setItem(totalNumberKey, total_number);
    }

    updateStartReviewButton();
    updateProgressBar();
}

function updateProgressBar() {
    if (!total_number || Number(total_number) === 0) {
        reviewProgress.style.width = "5%";
        reviewProgress.textContent = "0%";
        reviewProgress.setAttribute("aria-valuenow", 0);

        return;
    }

    const progressPercent =
        ((Number(currentCandidateIndex) + 1) / Number(total_number)) * 100;

    const roundedPercent = Math.round(progressPercent);

    reviewProgress.style.width = `${roundedPercent}%`;
    reviewProgress.textContent = `${roundedPercent}%`;
    reviewProgress.setAttribute("aria-valuenow", roundedPercent);
}

function initialisePage() {
    reviewerId = reviewerSelect.value;
    reviewerName = reviewerSelect.options[reviewerSelect.selectedIndex].text;

    reviewerNameDisplay.textContent = reviewerName || "None Selected";

    localStorage.setItem("reviewer_id", reviewerId);
    localStorage.setItem("reviewer_name", reviewerName);

    reviewsStorageKey = `reviews_${reviewerId}`;
    currentCandidateIndexKey = `cci_${reviewerId}`;
    totalNumberKey = `total_number_${reviewerId}`;
    buttonKey = `button_${reviewerId}`;

    reviews = JSON.parse(localStorage.getItem(reviewsStorageKey)) || [];
    currentCandidateIndex = Number(localStorage.getItem(currentCandidateIndexKey)) || 0;
    total_number = localStorage.getItem(totalNumberKey) || null;
    times_pressed = localStorage.getItem(buttonKey) || 0;
    
    updateStartReviewButton();

    if (total_number === null || isNaN(Number(total_number))) {
        //total_number = await getNumberOfCandidates();
        total_number = candidates.length
        localStorage.setItem(totalNumberKey, total_number);
    }
    updateProgressBar();
}

function csvEscape(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  if (
    stringValue.includes(",") ||
    stringValue.includes("\n") ||
    stringValue.includes('"')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function exportReviewsToCSV() {
    pressedButton = localStorage.getItem(buttonKey) || 0;

    // Check is any reveiws 
    if (reviews.length === 0) {
        alert("No reviews to export yet.");
        return
    }

    const csvHeaders = [
        "candidate_id",
        "reviewer_id",
        "reviewer_name",
        "label",
        "confidence",
        "extent",
        "notes",
        "timestamp"
    ];
    
    const rows = reviews.map(review => {
        return csvHeaders
        .map(header => csvEscape(review[header]))
        .join(",")
    })

    if (pressedButton >= 1) {
        rows.push(csvEscape(`${reviewerName} pressed the button ${pressedButton} times`));
    }

    const csvContent = [
        csvHeaders.join(","),
        ...rows
    ].join("\n");

    const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${reviewerName}_reviews`;
    link.click();

    URL.revokeObjectURL(url);
}

// Add event listeners
reviewerSelect.addEventListener("change", UpdateReviewer)
exportButton.addEventListener("click", function () {
  exportReviewsToCSV();
});

document.getElementById("settings_button").addEventListener("click", releaseBalloons);

restoreReviewerSelection();
initialisePage();

