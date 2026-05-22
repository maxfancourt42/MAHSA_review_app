// load details user storage
const reviewerId = localStorage.getItem("reviewer_id");
const reviewerName = localStorage.getItem("reviewer_name");
const currentCandidateIndexKey = `cci_${reviewerId}`;
var currentCandidateIndex = Number(localStorage.getItem(currentCandidateIndexKey)) || 0;
const reviewsStorageKey = `reviews_${reviewerId}`;
const APP_VERSION = "0.3.1";
const DATASET_VERSION = "2026-05-18-sites-batch-01"


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

const imageScaleMap = {
    "savi_img": "savi_scale_img",
    "msrm_img": "msrm_scale_img",
    "cmr_img": "cmr_scale_img"
};

const reviewImages = document.querySelectorAll(".review-img");


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
        statusSpan.textContent = `${candidate.candidate_id} Model confidence: ${candidate.median_probability_category} (${probability})`;
        statusSpan.style.fontWeight = 'bold';
    } else {
        statusSpan.textContent = `${candidate.candidate_id} Model confidence: Hidden, please answer all questions to reveal.`;
        statusSpan.style.fontWeight = 'normal';
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

// Initial page setup
UpdateReviewer();
loadCandidates();

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