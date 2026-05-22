// load details user storage
const reviewerId = localStorage.getItem("reviewer_id");
const reviewerName = localStorage.getItem("reviewer_name");
const currentCandidateIndexKey = `cci_${reviewerId}`;
var currentCandidateIndex = Number(localStorage.getItem(currentCandidateIndexKey)) || 0;
const reviewsStorageKey = `reviews_${reviewerId}`;
const APP_VERSION = "0.3.1";
const DATASET_VERSION = "2026-05-18-sites-batch-01"
var buttonKey = `button_${reviewerId}`;
var times_pressed = localStorage.getItem(buttonKey) || 0;

// session variables 
let reviews = JSON.parse(localStorage.getItem(reviewsStorageKey)) || [];

// get elements from page 
const reviewerNameDisplayReview = document.getElementById("reviewer_name");
const reviewProgress = document.getElementById("review_progress");
const previousButton = document.getElementById("previous_button");
const nextButton = document.getElementById("next_button");
const labelSelect = document.getElementById("mound_label");
const confidenceSelect = document.getElementById("confidence_label");
const extentSelect = document.getElementById("extent_label");
const notesInput = document.getElementById("notes_input");
const textHomeLink = document.getElementById("text_home_link");
const logoHomeLink = document.getElementById("logo_home_link");
const preview = document.getElementById("image-preview");
const previewImg = document.getElementById("preview-img");
const previewScale = document.getElementById("preview-scale");
const export_button = document.getElementById("export_button");

const imageScaleMap = {
    "savi_img": "savi_scale_img",
    "msrm_img": "msrm_scale_img",
    "cmr_img": "cmr_scale_img"
};

const reviewImages = document.querySelectorAll(".review-img");

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

    for (let i = 0; i < 100; i++) {
        const balloon = document.createElement("div");
        balloon.classList.add("balloon");

        // ---------- SIZE GROWS WITH CLICKS ----------
        const scale = 1 + (1 * 0.05);

        const width = (30 + Math.random() * 25) * scale;
        const height = width * 1.3;

        balloon.style.width = width + "px";
        balloon.style.height = height + "px";

        // ---------- POSITION ----------
        balloon.style.left = Math.random() * 100 + "vw";

        // ---------- COLOUR ----------
        balloon.style.backgroundColor = colours[Math.floor(Math.random() * colours.length)];

        // ---------- SPEED ----------
        balloon.style.animationDuration = (4 + Math.random() * 5) + "s";

        balloon.style.animationDelay = (Math.random() * 1.5 * (1 * 0.5)) + "s";

        container.appendChild(balloon);

        balloon.addEventListener("animationend", () => {
            balloon.remove();
        });
    }
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
    // Save current review page 
    saveCurrentReview();
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
    console.log(csvContent);
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


// update header to show who is logged in  
function UpdateReviewer() {    
    // Update text on screen
    reviewerNameDisplayReview.textContent = reviewerName || "None Selected";
};

function loadCandidates() {
  //const response = await fetch("./candidates.json", {});
  //candidates = await response.json();
  // total number of candidates 
  //total_number = await candidates.length
  total_number = candidates.length
  localStorage.setItem("total_number", total_number);
  showCandidate();
}

function updateFormStatus() {
    const candidate = candidates[currentCandidateIndex];
    // get values from the 3 questions
    const q1 = document.getElementById("mound_label").value;
    const q2 = document.getElementById("confidence_label").value;
    const q3 = document.getElementById("extent_label").value;

    // target span
    const statusSpan = document.getElementById("candidate_id");

    // check if all questions have values
    const allAnswered = q1 !== "" && q2 !== "" && q3 !== "";

    // probability 
    const probability = Number(candidate.median_probability).toFixed(2)

    // update span text
    if (allAnswered) {
        statusSpan.textContent = `Model confidence: ${candidate.median_probability_category} (${probability})`;
        statusSpan.style.fontWeight = 'bold';
    } else {
        statusSpan.textContent = `Model confidence: Hidden, please answer all questions to reveal.`;
        statusSpan.style.fontWeight = 'normal';
    }
    // If everything has also been reviewed 
    if (currentCandidateIndex + 1 === Number(total_number) && allAnswered) {
        // Trigger clean 
        
        console.log("All reviwed")
        // Change colour of export button to draw attention
        export_button.className = "btn btn-danger btn";
        export_button.disabled = false;
        releaseBalloons();;
    } else {
        export_button.className = "btn btn-primary btn"
        export_button.disabled = true;
    }
}

function updateProgressBar() {
    const progressPercent = ((Number(currentCandidateIndex) + 1) / Number(total_number)) * 100;
    const roundedPercent = Math.round(progressPercent);
    reviewProgress.style.width = `${roundedPercent}%`;
    reviewProgress.textContent = `${roundedPercent}%`;
    reviewProgress.setAttribute("aria-valuenow", roundedPercent);
}

function showCandidate() {
  const candidate = candidates[currentCandidateIndex];

  //document.getElementById("candidate_location").textContent =`Lat: ${candidate.lat}, Lon: ${candidate.lon}`;
  document.getElementById("rgb_img").src = candidate.images[0].path;
  document.getElementById("savi_img").src = candidate.images[1].path;
  document.getElementById("msrm_img").src = candidate.images[2].path;
  document.getElementById("cmr_img").src = candidate.images[3].path;

  // Update the scale bars 
  document.getElementById("savi_scale_img").src = candidate.images[1].scale_path;
  document.getElementById("msrm_scale_img").src = candidate.images[2].scale_path;
  document.getElementById("cmr_scale_img").src = candidate.images[3].scale_path;

  // Update the google maps link 
  document.getElementById("gm_link").href = candidate.google_maps_url;
  updateProgressBar();
  updateNavigationButtons();
  loadReview();
}

function updateNavigationButtons() {
  previousButton.disabled = currentCandidateIndex === 0;
  nextButton.disabled = currentCandidateIndex === candidates.length - 1;
}

function getMultiSelectValues(selectElement) {
    return Array.from(selectElement.selectedOptions)
        .map(option => option.value);
}

function saveCurrentReview() {
    if (candidates.length === 0) {
        console.warn("Candidates have not loaded yet.");
        return;
    }

    const candidate = candidates[currentCandidateIndex];
    const review = {
        candidate_id: candidate.candidate_id,
        reviewer_id: reviewerId,
        reviewer_name: reviewerName,
        label: labelSelect.value,
        confidence: confidenceSelect.value,
        extent: getMultiSelectValues(extentSelect),
        notes: notesInput.value,
        timestamp: new Date().toISOString(),
        app_version: APP_VERSION,
        dataset_version: DATASET_VERSION
    };
    console.log(review);
    // Filter all reviews just to the ones done by this user
    reviews = reviews.filter(
        r => !(r.candidate_id === candidate.candidate_id && r.reviewer_id === reviewerId)
    );
    // Push new review to list
    reviews.push(review);
    
    // Save to local storage 
    localStorage.setItem(reviewsStorageKey, JSON.stringify(reviews));
}

function setMultiSelectValues(selectElement, values) {
    const selectedValues = Array.isArray(values) ? values : [];

    Array.from(selectElement.options).forEach(option => {
        option.selected = selectedValues.includes(option.value);
    });
}

function loadReview() {
    const candidate = candidates[currentCandidateIndex];

    const savedReview = reviews.find(r => 
        r.candidate_id === candidate.candidate_id && r.reviewer_id === reviewerId);

    // If a review is found then set the values to saved options
    if (savedReview) {
        labelSelect.value = savedReview.label;
        confidenceSelect.value = savedReview.confidence;
        setMultiSelectValues(extentSelect, savedReview.extent);
        notesInput.value = savedReview.notes;
    } else {
        labelSelect.value = "";
        confidenceSelect.value = "";
        setMultiSelectValues(extentSelect, []);
        notesInput.value = "";
    }
    // Check if answer needs to be reveleaed 
    updateFormStatus();
}

// Event listeners 
previousButton.addEventListener("click", function () {
    saveCurrentReview();
    if (currentCandidateIndex > 0) {
        currentCandidateIndex -= 1;
        localStorage.setItem(currentCandidateIndexKey, currentCandidateIndex);
        showCandidate();
    }
});

nextButton.addEventListener("click", function () {
    saveCurrentReview();
    if (currentCandidateIndex < candidates.length - 1) {
        currentCandidateIndex += 1;
        localStorage.setItem(currentCandidateIndexKey, currentCandidateIndex);
        showCandidate();
        
    }
});

textHomeLink.addEventListener("click", function (event) {

    // Prevent normal link behaviour
    event.preventDefault();

    // Save current review
    saveCurrentReview();

    // Save current candidate position
    localStorage.setItem(
        currentCandidateIndexKey,
        currentCandidateIndex
    );

    // Navigate back to index page
    window.location.href = "index.html";
});

logoHomeLink.addEventListener("click", function (event) {

    // Prevent normal link behaviour
    event.preventDefault();

    // Save current review
    saveCurrentReview();

    // Save current candidate position
    localStorage.setItem(
        currentCandidateIndexKey,
        currentCandidateIndex
    );

    // Navigate back to index page
    window.location.href = "index.html";
});


document.addEventListener("keydown", function (event) {

    // Ignore typing inside inputs/textareas
    if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA" ||
        event.target.tagName === "SELECT"
    ) {
        return;
    }

    // Right arrow -> next
    if (event.key === "ArrowRight") {
        nextButton.click();
    }

    // Left arrow -> previous
    if (event.key === "ArrowLeft") {
        previousButton.click();
    }

    // Up arrow -> reset questions to blank 
    if (event.key === "ArrowUp") {
        document.getElementById("mound_label").value = "";
        document.getElementById("confidence_label").value = "";
        document.getElementById("extent_label").value = "";
        updateFormStatus();
    }
});

export_button.addEventListener("click", function () {
  exportReviewsToCSV();
});

// Initial page setup
UpdateReviewer();
loadCandidates();

// Make it so that select boxes don't hold focus, this allows key commands to work at all times
document.querySelectorAll("select").forEach(select => {
    select.addEventListener("change", function () {
        this.blur();
    });
});


reviewImages.forEach(img => {

    img.addEventListener("mouseenter", () => {

        preview.style.display = "flex";

        previewImg.src = img.src;

        const scaleId = imageScaleMap[img.id];

        if (scaleId) {
            const scaleImg = document.getElementById(scaleId);

            previewScale.src = scaleImg.src;
            previewScale.style.display = "block";
            previewScale.style.visibility = "visible";
        } else {
            previewScale.removeAttribute("src");
            previewScale.style.display = "block";
            previewScale.style.visibility = "hidden";
        }
    });

    img.addEventListener("mouseleave", () => {
        preview.style.display = "none";
    });

});